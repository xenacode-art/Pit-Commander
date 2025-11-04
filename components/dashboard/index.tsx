import React from 'react';
import { RaceResult, TelemetryPoint, RaceState } from '../../types';

// This file is repurposed to hold the global application context.
// This approach avoids circular dependencies while working within the file structure constraints.

/**
 * Defines the shape of the global context, containing all shared data
 * and simulation controls for the application.
 */
export interface IRaceContext {
    historicalData: RaceResult[];
    telemetryData: TelemetryPoint[];
    lap: number;
    raceState: RaceState;
    isSimulating: boolean;
    maxLaps: number;
    play: () => void;
    pause: () => void;
    reset: () => void;
    goToLap: (targetLap: number) => void;
}

/**
 * The React Context object for the entire application.
 * Components will consume this to access shared state.
 */
export const RaceContext = React.createContext<IRaceContext | undefined>(undefined);

/**
 * A custom hook to simplify consumption of the RaceContext.
 * It provides a convenient way for components to access race data and
 * simulation controls, while also ensuring the context is used correctly.
 */
export const useRaceContext = () => {
    const context = React.useContext(RaceContext);
    if (context === undefined) {
        throw new Error('useRaceContext must be used within a RaceProvider');
    }
    return context;
};
