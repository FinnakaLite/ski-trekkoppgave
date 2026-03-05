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
 * Part 1: Synchronize raw scans from the read-only Heissystem table into our local Heis_Turer table.
 */
export const syncHeissystemData = async (lastSyncTime?: Date) => {
    try {
        const records = await fetchHeissystemData(lastSyncTime);
        if (records.length === 0) return 0;

        let processedCount = 0;

        for (const record of records) {
            const { cardSerial, time, location } = record;

            // Check for existing record to avoid duplicates
            const existingHeisTur = await prisma.heis_Turer.findFirst({
                where: {
                    cardSerial,
                    timeStart: time,
                }
            });

            if (existingHeisTur) continue;

            // Get metadata length for the current lift
            const metadata = await prisma.heis_metadata.findUnique({
                where: { heis: location },
            });
            const length = metadata?.length || 0;

            // Save the new ride to Heis_Turer
            await prisma.heis_Turer.create({
                data: {
                    cardSerial,
                    timeStart: time,
                    heis: location,
                    length,
                }
            });
            processedCount++;
        }

        console.log(`Sync complete: Processed ${processedCount} new raw lift rides.`);
        return processedCount;
    } catch (error) {
        console.error('Error syncing Heissystem data:', error);
        throw error;
    }
};

/**
 * Part 2: Process the local Heis_Turer table to identify and calculate trips (Turer).
 * This logic is now based entirely on the local records.
 */
export const generateTripsFromHeisTurer = async (targetCardSerial?: string) => {
    try {
        console.log('Calculating trips from local lift ride history...');

        // If targetCardSerial is provided, only process that card. Otherwise process all.
        const whereClause = targetCardSerial ? { cardSerial: targetCardSerial } : {};

        // Get all lift rides, grouped by card and ordered by time
        const allRides = await prisma.heis_Turer.findMany({
            where: whereClause,
            orderBy: [
                { cardSerial: 'asc' },
                { timeStart: 'asc' }
            ]
        });

        let tripsCreated = 0;

        // Iterate through rides to find consecutive pairs for the same card
        for (let i = 0; i < allRides.length - 1; i++) {
            const rideA = allRides[i];
            const rideB = allRides[i + 1];

            // Ensure they belong to the same card
            if (rideA.cardSerial !== rideB.cardSerial) continue;

            // Check if a Tur (trip) already exists for this specific interval
            const existingTur = await prisma.turer.findFirst({
                where: {
                    cardSerial: rideA.cardSerial,
                    timeFirstLift: rideA.timeStart,
                    timeEndLift: rideB.timeStart
                }
            });

            if (existingTur) continue;

            // Calculate the route between the two lifts
            const startLift = rideA.heis;
            const endLift = rideB.heis;
            const possibleRoutes = ROUTES_MAP[startLift]?.[endLift];

            if (possibleRoutes && possibleRoutes.length > 0) {
                // Default to the first suggested route
                const defaultRoute = possibleRoutes[0];

                await prisma.turer.create({
                    data: {
                        cardSerial: rideA.cardSerial,
                        timeFirstLift: rideA.timeStart,
                        timeEndLift: rideB.timeStart,
                        route: defaultRoute,
                    }
                });
                tripsCreated++;
            }
        }

        console.log(`Trip generation complete: Generated ${tripsCreated} new trips.`);
        return tripsCreated;
    } catch (error) {
        console.error('Error generating trips from Heis_Turer:', error);
        throw error;
    }
};

/**
 * Main entry point that runs both parts of the sync process.
 */
export const processHeissystemData = async (lastSyncTime?: Date) => {
    const newScans = await syncHeissystemData(lastSyncTime);
    const newTrips = await generateTripsFromHeisTurer();
    return { newScans, newTrips };
};
