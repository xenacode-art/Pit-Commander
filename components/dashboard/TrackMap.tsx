import React from 'react';
// FIX: Import CarState to correctly type the race state values.
import { RaceState, CarState } from '../../types';

interface TrackMapProps {
    raceState: RaceState;
    selectedCarNumber: string | null;
}

// A highly simplified SVG path for the Indianapolis road course
const trackPath = "M 50,50 L 350,50 L 350,150 L 250,150 L 250,120 L 200,120 L 200,150 L 100,150 L 100,200 L 350,200 L 350,250 L 50,250 Z";

// Approximate total path length for lap percentage calculation
const totalPathLength = 1200; 

const getCarPositionOnTrack = (lapDistance: number) => {
    // This function maps a percentage of lap completion to an {x, y} coordinate on the SVG path.
    const distance = (lapDistance / 100) * totalPathLength;
    if (distance <= 300) return { x: 50 + distance, y: 50 }; // Top straight
    if (distance <= 400) return { x: 350, y: 50 + (distance - 300) }; // T1-T2
    if (distance <= 500) return { x: 350 - (distance - 400), y: 150 }; // Back straight part 1
    if (distance <= 530) return { x: 250, y: 150 - (distance - 500) }; // Chicane up
    if (distance <= 580) return { x: 250 - (distance - 530), y: 120 }; // Chicane across
    if (distance <= 610) return { x: 200, y: 120 + (distance - 580) }; // Chicane down
    if (distance <= 710) return { x: 200 - (distance - 610), y: 150 }; // Back straight part 2
    if (distance <= 760) return { x: 100, y: 150 + (distance - 710) }; // T7
    if (distance <= 1010) return { x: 100 + (distance - 760), y: 200 }; // Bottom straight
    if (distance <= 1060) return { x: 350, y: 200 + (distance - 1010) }; // T13
    if (distance <= 1360) return { x: 350 - (distance - 1060), y: 250 }; // Main straight
    return { x: 50, y: 250 - (distance - 1310) }; // Loop back to start
};


const TrackMap: React.FC<TrackMapProps> = ({ raceState, selectedCarNumber }) => {
    // FIX: Explicitly cast Object.values to CarState[] to resolve type errors.
    const cars = (Object.values(raceState) as CarState[]).sort((a,b) => b.position - a.position); // Render leader on top

    // Mock lap distance based on position to spread cars out, since we don't have real-time lapDistance.
    const getLapDistance = (position: number, gapToLeader: number) => {
        // A simple function to visualize gaps. This is not physically accurate.
        const base = (new Date().getTime() / 20) % 100; // Animate cars moving
        const offset = (position * 5 + gapToLeader * 2) % 100;
        return (base - offset + 100) % 100;
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 mb-4">Track Map</h3>
            <div className="flex justify-center items-center">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                    <path d={trackPath} stroke="#4A5568" strokeWidth="10" fill="none" />
                    <path d={trackPath} stroke="#667185" strokeWidth="1" fill="none" />
                    {/* Start/Finish Line */}
                    <line x1="50" y1="225" x2="50" y2="275" stroke="white" strokeWidth="3" strokeDasharray="5,5" />
                    
                    {cars.map(car => {
                        const { x, y } = getCarPositionOnTrack(getLapDistance(car.position, car.gapToLeader));
                        const isSelected = car.carNumber === selectedCarNumber;
                        return (
                             <g key={car.carNumber}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isSelected ? 8 : 6}
                                    fill={isSelected ? '#FBBF24' : '#EB0A1E'}
                                    stroke={isSelected ? 'white' : 'black'}
                                    strokeWidth={isSelected ? 2 : 1}
                                />
                                <text
                                    x={x + 10}
                                    y={y + 4}
                                    fontSize="10"
                                    fill="white"
                                    className="font-bold"
                                >
                                    {car.carNumber}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default TrackMap;