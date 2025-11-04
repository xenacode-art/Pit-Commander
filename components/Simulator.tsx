import React, { useState, useMemo, useCallback } from 'react';
import { TelemetryPoint } from '../types';
import { runWhatIfSimulation } from '../services/geminiService';
import { useRaceContext } from './dashboard/index';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Simulating Alternate Reality...</span>
    </div>
);


const Simulator: React.FC = () => {
    const { historicalData, telemetryData, maxLaps } = useRaceContext();
    
    const [selectedLap, setSelectedLap] = useState(10);
    const [selectedCar, setSelectedCar] = useState(historicalData[0].number);
    const [simulationResult, setSimulationResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const carOptions = useMemo(() => historicalData.map(d => ({
        value: d.number,
        label: `#${d.number} ${d.driverFirstName} ${d.driverSecondName}`
    })), [historicalData]);

    const stateAtLap = useMemo(() => {
        const lapData = telemetryData.filter(t => t.lap === selectedLap && t.carNumber === selectedCar);
        return lapData[0];
    }, [selectedLap, selectedCar, telemetryData]);
    
    const originalFinish = useMemo(() => {
        return historicalData.find(d => d.number === selectedCar)?.position || 0;
    }, [selectedCar, historicalData]);


    const handleSimulate = async (action: string) => {
        setIsLoading(true);
        setSimulationResult('');
        const scenario = {
            carNumber: selectedCar,
            decisionLap: selectedLap,
            action,
            originalFinish,
            telemetry: telemetryData
        };
        const result = await runWhatIfSimulation(scenario);
        setSimulationResult(result);
        setIsLoading(false);
    };

    return (
        <div className="font-mono space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-race-red mb-4">"What-If" Scenario Simulator</h2>
                <p className="text-gray-400 mb-6">Go back in time. Make a different call. See what could have been.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Lap Selector */}
                    <div className="flex flex-col">
                        <label htmlFor="lap-selector" className="text-sm mb-2 text-gray-300">1. Select Decision Lap</label>
                        <div className="flex items-center space-x-4">
                            <input
                                id="lap-selector"
                                type="range"
                                min="1"
                                max={maxLaps}
                                value={selectedLap}
                                onChange={e => setSelectedLap(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="font-bold text-xl text-race-red w-10 text-center">{selectedLap}</span>
                        </div>
                    </div>
                    
                    {/* Car Selector */}
                     <div className="flex flex-col">
                        <label htmlFor="car-selector" className="text-sm mb-2 text-gray-300">2. Select Driver</label>
                         <select
                            id="car-selector"
                            value={selectedCar}
                            onChange={e => setSelectedCar(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-race-red focus:border-race-red block w-full p-2.5"
                        >
                            {carOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* Action Buttons */}
                     <div className="flex flex-col">
                        <label className="text-sm mb-2 text-gray-300">3. Choose Alternate Strategy</label>
                        <div className="flex space-x-2">
                            <button onClick={() => handleSimulate('Pit for new tires')} disabled={isLoading} className="flex-1 bg-race-yellow/80 hover:bg-race-yellow text-black font-bold py-2 px-4 rounded transition-colors">
                                Pit Now
                            </button>
                            <button onClick={() => handleSimulate('Stay out and conserve tires')} disabled={isLoading} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                                Stay Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-300 mb-2">State at Lap {selectedLap}</h3>
                    {stateAtLap ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Position:</span> <span className="font-bold">P{stateAtLap.position}</span></div>
                            <div className="flex justify-between"><span>Tire Age:</span> <span className="font-bold">{stateAtLap.tireAge} laps</span></div>
                            <div className="flex justify-between"><span>Fuel:</span> <span className="font-bold">{stateAtLap.fuel.toFixed(1)}%</span></div>
                            <div className="flex justify-between"><span>Gap to P1:</span> <span className="font-bold">{stateAtLap.gapToLeader.toFixed(2)}s</span></div>
                        </div>
                    ) : <p className="text-gray-400">No data for this selection.</p>}
                </div>
                <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg min-h-[150px]">
                    <h3 className="text-lg font-bold text-gray-300 mb-2">AI Simulation Result</h3>
                    {isLoading && <LoadingSpinner />}
                    {simulationResult && <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: simulationResult }} />}
                    {!isLoading && !simulationResult && <p className="text-gray-400">Your simulation results will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

export default Simulator;