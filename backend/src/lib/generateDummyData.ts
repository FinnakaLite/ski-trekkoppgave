import prisma from './prisma.ts';
import { ROUTES_MAP } from '../common/constants/routesMap.ts';
import { Heiser, Bakker } from '@prisma/client';
import { syncHeissystemData, generateTripsFromHeisTurer, processHeissystemData } from '../controllers/syncController.ts';
import promptSync from 'prompt-sync';
/**
 * Script to generate dummy lift rides and route data for testing purposes.
 * This script populates the Heis_metadata, Heis_Turer, and Turer tables.
 * It uses the ROUTES_MAP to ensure generated rides are logically possible.
 */
async function main() {
    console.log('--- Reseeding dummy data into heisturer table (Heis_Turer) and Turer ---');

    // 1. Seed Heis_metadata (required for processed rides to have length info)
    // These lengths represent the length of the lift in meters.
    const liftMetadata = [
        { heis: Heiser.S1, length: 1200 },
        { heis: Heiser.S2, length: 850 },
        { heis: Heiser.L1, length: 1550 },
        { heis: Heiser.L2, length: 2100 },
        { heis: Heiser.L3_4, length: 3100 },
    ];

    for (const metadata of liftMetadata) {
        await prisma.heis_metadata.upsert({
            where: { heis: metadata.heis },
            update: { length: metadata.length },
            create: metadata,
        });
    }
    console.log('✓ Heis_metadata populated/verified.');

    const cardSerials = ['SKI-42-TRON', 'SNOW-99-BOSS', 'GUEST-PRO', 'KIDDO-123'];
    const baseDate = new Date();
    // We'll set the time to 9:00 AM local time for today
    baseDate.setHours(9, 0, 0, 0);

    for (const cardSerial of cardSerials) {
        console.log(`\nGenerating realistic rides for card: ${cardSerial}`);

        // We start at a random lift
        const startLifts = Object.keys(ROUTES_MAP) as Heiser[];
        let currentLift: Heiser = startLifts[Math.floor(Math.random() * startLifts.length)];
        let lastTime = new Date(baseDate);

        // Each card gets between 6 and 12 lift rides for variety
        const numRides = 6 + Math.floor(Math.random() * 6);

        // Tracks current sequence of rides to generate trips (Turer)
        let lastRideLift: Heiser | null = null;
        let lastRideTime: Date | null = null;
        let lastHeisTurID: number | null = null;

        for (let i = 0; i < numRides; i++) {
            // 2. Look up metadata length for current lift
            const metadata = await prisma.heis_metadata.findUnique({ where: { heis: currentLift } });
            const length = metadata?.length || 0;

            // 3. Create the lift ride record in Heis_Turer
            const currentRide = await prisma.heis_Turer.create({
                data: {
                    cardSerial,
                    heis: currentLift,
                    timeStart: new Date(lastTime),
                    length: length,
                },
            });
            console.log(`  [Heis_Turer] Lift: ${currentLift} at ${lastTime.toLocaleTimeString()} (ID: ${currentRide.heisTurid})`);

            // 4. If we have a previous lift position, calculate the trip/route taken between them
            if (lastRideLift && lastRideTime && lastHeisTurID) {
                // Find possible routes from previous lift to current lift in ROUTES_MAP
                const possibleRoutes = ROUTES_MAP[lastRideLift]?.[currentLift];

                if (possibleRoutes && possibleRoutes.length > 0) {
                    // Choose the first available route for now (or random if multiple)
                    const chosenRoute = possibleRoutes[Math.floor(Math.random() * possibleRoutes.length)];

                    await prisma.turer.create({
                        data: {
                            cardSerial,
                            timeFirstLift: lastRideTime,
                            timeEndLift: lastTime,
                            startHeisTurID: lastHeisTurID,
                            endHeisTurID: currentRide.heisTurid,
                            route: chosenRoute as Bakker[],
                        },
                    });
                    console.log(`  [Turer] Trip: ${lastRideLift} -> ${currentLift} via ${chosenRoute.join(', ')}`);
                } else if (lastRideLift === currentLift) {
                    // Some lifts return to themselves
                    const selfRoutes = ROUTES_MAP[currentLift]?.[currentLift];
                    if (selfRoutes && selfRoutes.length > 0) {
                        const chosenRoute = selfRoutes[0];
                        await prisma.turer.create({
                            data: {
                                cardSerial,
                                timeFirstLift: lastRideTime,
                                timeEndLift: lastTime,
                                startHeisTurID: lastHeisTurID,
                                endHeisTurID: currentRide.heisTurid,
                                route: chosenRoute as Bakker[],
                            },
                        });
                        console.log(`  [Turer] Lap: ${currentLift} back to ${currentLift} via ${chosenRoute.join(', ')}`);
                    }
                } else {
                    console.log(`  ! Logic Gap: No predefined route from ${lastRideLift} to ${currentLift} found in ROUTES_MAP.`);
                }
            }

            // Update tracking for next iteration
            lastHeisTurID = currentRide.heisTurid;

            // 5. Pick the next lift based on what is reachable from the current one
            const possibleDestinations = Object.keys(ROUTES_MAP[currentLift] || {}) as Heiser[];

            if (possibleDestinations.length === 0) {
                console.log(`  ! Lift ${currentLift} appears to be a dead end in ROUTES_MAP. Ending sequence.`);
                break;
            }

            const nextLift = possibleDestinations[Math.floor(Math.random() * possibleDestinations.length)];

            // Update tracking for next iteration
            lastRideLift = currentLift;
            lastRideTime = new Date(lastTime);

            // Move time forward randomly:
            // ~5-10 mins for lift ride + ~10-25 mins for skiing down
            const duration = 15 + Math.floor(Math.random() * 20);
            lastTime.setMinutes(lastTime.getMinutes() + duration);

            // Check if we hit end of day (e.g. 4:30 PM)
            if (lastTime.getHours() >= 16 && lastTime.getMinutes() >= 30) {
                console.log(`  End of ski day reached for ${cardSerial}.`);
                break;
            }

            currentLift = nextLift;
        }
    }

    console.log('\n--- Dummy data generation complete ---');
    const prompt = promptSync();

    const userInput = prompt('Do you want to sync this data to the database and process it? (yes/no)');
    if (userInput === 'yes') {
        await processHeissystemData();
    } else {
        console.log('Skipping sync and processing.');
    }
}

main()
    .catch((e) => {
        console.error('An error occurred during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
