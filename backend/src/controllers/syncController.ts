import prisma from '../lib/prisma.ts';
import { ROUTES_MAP } from '../common/constants/routesMap.ts';

/**
 * Controller for fetching data from the read-only Heissystem table.
 * This function is intended to be run via a cron job or an internal process,
 * rather than as an API endpoint.
 */
export const fetchHeissystemData = async (lastSyncTime?: Date) => {
    try {
        console.log('Fetching new data from read-only Heissystem table...');

        const whereClause = lastSyncTime ? {
            time: {
                gt: lastSyncTime
            }
        } : {};

        // Fetch records from Heissystem
        const newRecords = await prisma.heissystem.findMany({
            where: whereClause,
            orderBy: {
                time: 'asc',
            },
        });

        console.log(`Successfully fetched ${newRecords.length} records from Heissystem.`);
        return newRecords;
    } catch (error) {
        console.error('Error fetching data from Heissystem:', error);
        throw error;
    }
};

/**
 * Synchronize and process new entries from Heissystem, inserting into Heis_Turer and Turer.
 */
export const processHeissystemData = async (lastSyncTime?: Date) => {
    try {
        const records = await fetchHeissystemData(lastSyncTime);
        if (records.length === 0) return;

        let processedCount = 0;
        let routesCalculated = 0;

        for (const record of records) {
            const { cardSerial, time, location } = record;

            // 1. Check if we already have this exact scan in Heis_Turer to avoid duplicates
            // Since time is DateTime, we can check for an exact match
            const existingHeisTur = await prisma.heis_Turer.findFirst({
                where: {
                    cardSerial,
                    timeStart: time,
                }
            });

            if (existingHeisTur) {
                // Skip if duplicate
                continue;
            }

            // 2. Look up the last known location/ride for this cardSerial BEFORE current time
            const lastRide = await prisma.heis_Turer.findFirst({
                where: {
                    cardSerial,
                    timeStart: { lt: time } // Only look at rides strictly before this new one
                },
                orderBy: {
                    timeStart: 'desc'
                }
            });

            // 3. Get metadata length for the current lift
            const metadata = await prisma.heis_metadata.findUnique({
                where: { heis: location },
            });
            const length = metadata?.length || 0;

            // 4. Save the new ride to Heis_Turer
            const currentRide = await prisma.heis_Turer.create({
                data: {
                    cardSerial,
                    timeStart: time,
                    heis: location,
                    length,
                }
            });
            processedCount++;

            // 5. If there was a previous ride, calculate the route between them
            if (lastRide) {
                const startLift = lastRide.heis;
                const endLift = location;

                // Lookup path in our predefined Map (now an array of routes)
                const calculatedRoutes = ROUTES_MAP[startLift]?.[endLift];

                if (calculatedRoutes && calculatedRoutes.length > 0) {
                    // For now, we pick the first defined route.
                    // The guest can edit this route later using the manual update API if they took another path.
                    const defaultRoute = calculatedRoutes[0];
                    if (defaultRoute) {
                        await prisma.turer.create({
                            data: {
                                cardSerial,
                                timeFirstLift: lastRide.timeStart,
                                timeEndLift: time,
                                route: defaultRoute,
                            }
                        });
                        routesCalculated++;
                    }
                } else {
                    console.log(`No predefined route found from ${startLift} to ${endLift} for card ${cardSerial}`);
                }
            }
        }

        console.log(`Sync complete: Processed ${processedCount} new lift rides, calculated ${routesCalculated} routes.`);
    } catch (error) {
        console.error('Error processing Heissystem data:', error);
        throw error;
    }
};
