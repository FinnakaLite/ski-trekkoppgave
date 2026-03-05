import { Bakker, Heiser } from '@prisma/client';

export type RoutesMapType = {
    [startLift in Heiser]?: {
        [endLift in Heiser]?: Bakker[];
    };
};

/**
 * Define all possible routes between lifts here.
 * Format is: ROUTES_MAP[StartLift][EndLift] = [Array of Bakker]
 */
export const ROUTES_MAP: RoutesMapType = {
    // TODO: The schema defines Heiser (S1, S2, L1, L2, L3_4) and Bakker (B1-B27).
    // Example:
    /*
    S1: {
        L1: ['B1', 'B2'],
        S2: ['B3'],
    },
    L1: {
        S1: ['B14', 'B15'],
    }
    */
};
