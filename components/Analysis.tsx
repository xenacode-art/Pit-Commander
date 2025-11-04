import React, { useState, useMemo, useEffect } from 'react';
import { TelemetryPoint } from '../types';
import { generateDriverAnalysis } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRaceContext } from './dashboard/index';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 text-gray-300">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>AI Coach is analyzing telemetry...</span>
    </div>
);

const driverColors = ['#EB0A1E', '#38bdf8', '#fbbf24'];

const Analysis: React.FC = () => {
    const { historicalData, telemetryData } = useRaceContext();
    const [selectedCars, setSelectedCars] = useState<string[]>([historicalData[0].number]);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset analysis when selection changes
    useEffect(() => {
        setAnalysisResult('');
    }, [selectedCars]);

    const handleCarSelectionChange = (carNumber: string) => {
        setSelectedCars(prev => {
            const isSelected = prev.includes(carNumber);
            if (isSelected) {
                return prev.length > 1 ? prev.filter(cn => cn !== carNumber) : prev;
            } else {
                return prev.length < 3 ? [...prev, carNumber] : prev;
            }
        });
    };

    const chartData = useMemo(() => {
        const laps = [...new Set(telemetryData.map(t => t.lap))];
        return laps.map(lap => {
            const lapEntry: { [key: string]: number | string } = { lap };
            selectedCars.forEach(carNumber => {
                const carData = telemetryData.find(t => t.carNumber === carNumber && t.lap === lap);
                if (carData) {
                    lapEntry[`#${carNumber} Lap Time`] = carData.lapTime;
                }
            });
            return lapEntry;
        });
    }, [selectedCars, telemetryData]);
    
    const handleAnalyze = async () => {
        if (selectedCars.length === 0) return;
        setIsLoading(true);
        setAnalysisResult('');
        const result = await generateDriverAnalysis({ carNumbers: selectedCars, telemetry: telemetryData });
        setAnalysisResult(result);
        setIsLoading(false);
    };

    return (
        <div className="font-mono space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-race-red">Driver Performance Analysis</h2>
                        <p className="text-gray-400">Select up to 3 drivers for a comparative analysis.</p>
                    </div>
                     <div className="flex items-center space-x-4">
                        <button onClick={handleAnalyze} disabled={isLoading || selectedCars.length === 0} className="bg-race-red hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap">
                            {isLoading ? 'Analyzing...' : `Analyze ${selectedCars.length} Driver(s)`}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                 <div className="xl:col-span-3 bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">Select Drivers</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        {historicalData.map(driver => (
                            <div 
                                key={driver.number}
                                onClick={() => handleCarSelectionChange(driver.number)}
                                className={`p-2 rounded-md flex items-center cursor-pointer transition-colors ${selectedCars.includes(driver.number) ? 'bg-race-red/80' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}
                            >
                                <input 
                                    type="checkbox" 
                                    readOnly
                                    checked={selectedCars.includes(driver.number)}
                                    className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-race-red focus:ring-race-red"
                                />
                                <span className="ml-3 font-semibold text-sm">{`#${driver.number} ${driver.driverFirstName} ${driver.driverSecondName}`}</span>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="xl:col-span-9 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">Lap Time Comparison</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                                <XAxis dataKey="lap" stroke="#9ca3af" label={{ value: 'Lap', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}/>
                                {/* FIX: Replaced `unknown` with `any` in domain functions to resolve a TypeScript error caused by inaccurate Recharts type definitions, while keeping the runtime safety checks. */}
                                <YAxis 
                                    stroke="#9ca3af" 
                                    domain={[
                                        (dataMin: any) => (typeof dataMin === 'number' && isFinite(dataMin) ? Math.floor(dataMin) - 1 : 90),
                                        (dataMax: any) => (typeof dataMax === 'number' && isFinite(dataMax) ? Math.ceil(dataMax) + 1 : 130),
                                    ]}
                                    label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} 
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5567' }} />
                                <Legend />
                                {selectedCars.map((carNumber, index) => (
                                    <Line key={carNumber} type="monotone" dataKey={`#${carNumber} Lap Time`} stroke={driverColors[index % driverColors.length]} strokeWidth={2} dot={false}/>
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="xl:col-span-12 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">AI Driver Coach Feedback</h3>
                    {isLoading && <LoadingSpinner />}
                    {analysisResult && <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult }} />}
                    {!isLoading && !analysisResult && <p className="text-gray-400">Click the "Analyze" button to receive feedback.</p>}
                 </div>
            </div>
        </div>
    );
};

export default Analysis;