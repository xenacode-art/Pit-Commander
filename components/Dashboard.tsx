
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CarState, RaceState, TelemetryPoint, StrategyRecommendation } from '../types';
import { useRaceSimulation } from '../hooks/useRaceSimulation';
import { generateStrategyRecommendation } from '../services/geminiService';

// --- Sub-components defined in the same file for simplicity ---

const TrackMap: React.FC<{ raceState: RaceState }> = ({ raceState }) => {
    // FIX: Explicitly type parameters to fix type inference issues on Object.values()
    const cars = Object.values(raceState).sort((a: CarState, b: CarState) => b.lapDistance - a.lapDistance);
    
    // Simple oval path
    const trackPath = "M 50,50 A 150,80 0 1,1 350,50 L 350,150 A 150,80 0 1,1 50,150 Z";
    const pathLength = 885; // Approximate length of this path

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg flex-grow flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full h-full">
                <path d={trackPath} stroke="#4A5568" strokeWidth="4" fill="none" />
                <path d={trackPath} stroke="white" strokeWidth="1" fill="none" strokeDasharray="10 10" />
                 {/* Start/Finish Line */}
                <line x1="200" y1="140" x2="200" y2="230" stroke="white" strokeWidth="2" />

                {cars.map(car => {
                    const position = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${trackPath}"/></svg>`, "image/svg+xml").querySelector('path')!.getPointAtLength((car.lap + (car.lapDistance / 100)) / 24 * pathLength);
                    
                    return (
                        <g key={car.carNumber}>
                            <circle cx={position.x} cy={position.y} r="5" fill="#EB0A1E" stroke="white" strokeWidth="1" />
                             <text x={position.x + 8} y={position.y + 4} fontSize="8" fill="white" className="font-mono">{car.driverShortName}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


const LiveLeaderboard: React.FC<{ raceState: RaceState, onSelect: (car: CarState) => void }> = ({ raceState, onSelect }) => {
    // FIX: Explicitly type parameters to fix type inference issues on Object.values()
    const sortedCars = useMemo(() => Object.values(raceState).sort((a: CarState, b: CarState) => a.position - b.position), [raceState]);

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm font-mono">
                <thead className="sticky top-0 bg-gray-900">
                    <tr>
                        <th className="p-2">P</th>
                        <th className="p-2">#</th>
                        <th className="p-2">Driver</th>
                        <th className="p-2">Gap</th>
                        <th className="p-2 hidden md:table-cell">Last Lap</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                    {sortedCars.map(car => (
                        <tr key={car.carNumber} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => onSelect(car)}>
                            <td className="p-2">{car.position}</td>
                            <td className="p-2">#{car.carNumber}</td>
                            <td className="p-2 font-bold">{car.driverShortName}</td>
                            <td className="p-2">{car.gapToLeader > 0 ? `+${car.gapToLeader.toFixed(2)}` : '-'}</td>
                            <td className="p-2 hidden md:table-cell">{car.lapTime.toFixed(3)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const LiveTelemetry: React.FC<{ selectedCar: CarState | null }> = ({ selectedCar }) => {
    if (!selectedCar) {
        return <div className="bg-gray-900/50 p-4 rounded-lg flex-grow flex items-center justify-center text-gray-400">Select a driver to view live telemetry.</div>;
    }

    const TelemetryItem: React.FC<{label: string, value: any, unit: string}> = ({label, value, unit}) => (
        <div className="flex justify-between items-baseline p-2 bg-gray-800/50 rounded">
            <span className="text-gray-400">{label}</span>
            <span className="font-mono text-xl">{value}<span className="text-sm ml-1 text-gray-500">{unit}</span></span>
        </div>
    );

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg flex-grow space-y-2">
            <h3 className="text-lg font-bold text-center mb-2">TELEMETRY: #{selectedCar.carNumber} {selectedCar.driverFullName}</h3>
            <div className="grid grid-cols-2 gap-2">
                <TelemetryItem label="Speed" value={selectedCar.speed.toFixed(0)} unit="km/h" />
                <TelemetryItem label="RPM" value={selectedCar.rpm.toFixed(0)} unit="" />
                <TelemetryItem label="Gear" value={selectedCar.gear} unit="" />
                <TelemetryItem label="Throttle" value={selectedCar.throttle.toFixed(0)} unit="%" />
                <TelemetryItem label="Brake" value={selectedCar.brake.toFixed(0)} unit="%" />
                <TelemetryItem label="Fuel" value={selectedCar.fuel.toFixed(0)} unit="%" />
                <TelemetryItem label="Tire Age" value={selectedCar.tireAge} unit="laps" />
                <TelemetryItem label="Position" value={selectedCar.position} unit="" />
            </div>
        </div>
    );
};

const StrategyRecommendationPanel: React.FC<{ recommendation: StrategyRecommendation | null, isLoading: boolean }> = ({ recommendation, isLoading }) => {
    const colorClasses = {
        red: 'border-race-red bg-race-red/10 text-red-300',
        yellow: 'border-race-yellow bg-race-yellow/10 text-yellow-300',
        green: 'border-race-green bg-green-500/10 text-green-300',
    };

    if (isLoading) {
        return (
            <div className="bg-gray-900/50 p-4 rounded-lg border border-dashed border-gray-600 flex items-center justify-center space-x-2">
                 <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-400">AI is thinking...</span>
            </div>
        );
    }
    
    if (!recommendation) {
        return <div className="bg-gray-900/50 p-4 rounded-lg border border-dashed border-gray-600 text-center text-gray-400">AI strategy will appear here.</div>;
    }

    const recText = recommendation.recommendation.replace(/_/g, ' ');

    return (
        <div className={`bg-gray-900/50 p-4 rounded-lg border-2 ${colorClasses[recommendation.color]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold">AI RECOMMENDATION: <span className="uppercase">{recText}</span></h3>
                    <p className="text-sm">{recommendation.reasoning}</p>
                </div>
                <div className="text-right ml-4">
                    <div className="font-bold text-2xl">{recommendation.confidence}%</div>
                    <div className="text-xs">Confidence</div>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

interface DashboardProps {
    simulation: ReturnType<typeof useRaceSimulation>;
    telemetryData: TelemetryPoint[];
}

const Dashboard: React.FC<DashboardProps> = ({ simulation }) => {
    const { lap, raceState, isSimulating, maxLaps, play, pause, reset, goToLap } = simulation;
    const [selectedCar, setSelectedCar] = useState<CarState | null>(null);
    const [recommendation, setRecommendation] = useState<StrategyRecommendation | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Auto-select P1 if no car is selected
    useEffect(() => {
        if (!selectedCar) {
            // FIX: Explicitly type parameter to fix type inference issues on Object.values()
            const leader = Object.values(raceState).find((c: CarState) => c.position === 1);
            if (leader) setSelectedCar(leader);
        } else {
             // Update selected car data
             setSelectedCar(raceState[selectedCar.carNumber] || null);
        }
    }, [raceState, selectedCar]);

    const handleSelectCar = useCallback((car: CarState) => {
        setSelectedCar(car);
    }, []);

    // Fetch AI recommendation every 3 laps for the selected car
    useEffect(() => {
        if (isSimulating && lap % 3 === 0 && selectedCar) {
            const fetchRecommendation = async () => {
                setIsAiLoading(true);
                const result = await generateStrategyRecommendation(selectedCar);
                setRecommendation(result);
                setIsAiLoading(false);
            };
            fetchRecommendation();
        }
    }, [lap, isSimulating, selectedCar]);


    return (
        <div className="space-y-6 font-mono">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <button onClick={isSimulating ? pause : play} className="bg-race-red w-24 text-white font-bold py-2 px-4 rounded transition-transform hover:scale-105">
                        {isSimulating ? 'PAUSE' : 'PLAY'}
                    </button>
                    <button onClick={reset} className="bg-gray-600 w-24 text-white font-bold py-2 px-4 rounded transition-transform hover:scale-105">
                        RESET
                    </button>
                </div>
                <div className="flex flex-col items-center">
                    <label htmlFor="lap-slider" className="text-sm mb-1">LAP: <span className="text-2xl font-bold text-race-red">{lap}</span> / {maxLaps}</label>
                    <input
                        id="lap-slider"
                        type="range"
                        min="1"
                        max={maxLaps}
                        value={lap}
                        onChange={(e) => goToLap(parseInt(e.target.value))}
                        className="w-48 md:w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <LiveLeaderboard raceState={raceState} onSelect={handleSelectCar} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                     <StrategyRecommendationPanel recommendation={recommendation} isLoading={isAiLoading} />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{minHeight: '300px'}}>
                        <TrackMap raceState={raceState} />
                        <LiveTelemetry selectedCar={selectedCar} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
