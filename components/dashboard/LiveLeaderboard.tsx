import React from 'react';
// FIX: Import CarState to correctly type the race state values.
import { RaceState, CarState } from '../../types';

interface LiveLeaderboardProps {
    raceState: RaceState;
    onSelectCar: (carNumber: string) => void;
    selectedCarNumber: string | null;
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({ raceState, onSelectCar, selectedCarNumber }) => {
    // FIX: Explicitly cast Object.values to CarState[] to resolve type errors.
    const sortedCars = (Object.values(raceState) as CarState[]).sort((a, b) => a.position - b.position);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 mb-4">Live Leaderboard</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {sortedCars.map((car, index) => (
                    <div
                        key={car.carNumber}
                        onClick={() => onSelectCar(car.carNumber)}
                        className={`p-2 rounded-md flex justify-between items-center cursor-pointer transition-colors ${
                            selectedCarNumber === car.carNumber ? 'bg-race-red/80' : 'bg-gray-700/50 hover:bg-gray-600/50'
                        }`}
                    >
                        <div className="flex items-center">
                            <span className="font-bold w-8 text-center">{car.position}</span>
                            <div className="ml-2">
                                <p className="font-semibold text-sm">{`#${car.carNumber} ${car.driverFullName}`}</p>
                                <p className="text-xs text-gray-400">{car.team}</p>
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-semibold">
                                {index === 0 ? car.lapTime.toFixed(3) : `+${car.gapToLeader.toFixed(2)}`}
                            </p>
                            <p className="text-xs text-gray-400">
                                {index > 0 ? `+${car.gapToAhead.toFixed(2)}` : ''}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveLeaderboard;