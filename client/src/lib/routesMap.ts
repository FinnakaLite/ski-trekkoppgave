export type Bakker = 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9' | 'B10' | 'B11' | 'B12' | 'B14' | 'B15' | 'B16' | 'B21' | 'B22' | 'B23' | 'B24' | 'B25' | 'B26' | 'B27';
export type Heiser = 'S1' | 'S2' | 'L1' | 'L2' | 'L3_4';

export type RoutesMapType = {
    [startLift in Heiser]?: {
        [endLift in Heiser]?: Bakker[][];
    };
};

/**
 * Define all possible routes between lifts here.
 * Format is: ROUTES_MAP[StartLift][EndLift] = [ [Route1_Bakker, ...], [Route2_Bakker, ...] ]
 */
export const ROUTES_MAP: RoutesMapType = {
    S1: {
        L1: [
            ['B5'],
            ['B6', 'B5']
        ],
        S2: [
            ['B7']
        ],
        S1: [
            ['B5'],
            ['B6', 'B5'],
            ['B7']
        ]
    },
    L1: {
        S1: [
            ['B4', 'B5'],
            ['B1']
        ],
        L1: [
            ['B2', 'B3'],
            ['B4', 'B5'],
            ['B1', 'B3'],
            ['B1', 'B5']
        ],
        S2: [
            ['B4', 'B14', 'B8'],
            ['B4', 'B14', 'B9']
        ],
        L2: [
            ['B4', 'B14', 'B9'],
            ['B4', 'B14', 'B10'],
            ['B4', 'B14', 'B15'],
            ['B4', 'B14', 'B16']
        ],
        L3_4: [
            ['B4', 'B14', 'B16', 'B21']
        ]
    },
    S2: {
        S1: [
            ['B7']
        ],
        S2: [
            ['B8']
        ],
        L2: [
            ['B8']
        ]
    },
    L2: {
        S1: [
            ['B11', 'B5'],
            ['B11', 'B1']
        ],
        L1: [
            ['B11', 'B5']
        ],
        S2: [
            ['B11', 'B9'],
            ['B10']
        ],
        L2: [
            ['B10'],
            ['B12', 'B15'],
            ['B12', 'B16'],
            ['B11', 'B9']

        ],
        L3_4: [
            ['B12', 'B16', 'B21']
        ]
    },
    L3_4: {
        L3_4: [
            ['B21'],
            ['B24'],
            ['B23']
        ],
        L2: [
            ['B22'],
            ['B23']
        ]
    },
};
