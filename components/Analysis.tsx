
import React, { useState, useMemo } from 'react';
import { TelemetryPoint } from '../types';
import { useRaceData } from '../hooks/useRaceData';
import { generateDriverAnalysis } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalysisProps {
    telemetryData: TelemetryPoint[];
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 text-gray-300">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>AI Coach is analyzing telemetry...</span>
    </div>
);

const Analysis: React.FC<AnalysisProps> = ({ telemetryData }) => {
    const historicalData = useRaceData();
    const [selectedCar, setSelectedCar] = useState(historicalData[0].number);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const carOptions = useMemo(() => historicalData.map(d => ({
        value: d.number,
        label: `#${d.number} ${d.driverFirstName} ${d.driverSecondName}`
    })), [historicalData]);

    const driverChartData = useMemo(() => {
        return telemetryData
            .filter(t => t.carNumber === selectedCar)
            .map(t => ({
                lap: t.lap,
                'Lap Time': t.lapTime,
                'S1': t.sector1,
                'S2': t.sector2,
                'S3': t.sector3,
            }));
    }, [selectedCar, telemetryData]);
    
    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysisResult('');
        const result = await generateDriverAnalysis({ carNumber: selectedCar, telemetry: telemetryData });
        setAnalysisResult(result);
        setIsLoading(false);
    };

    return (
        <div className="font-mono space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-race-red">Driver Performance Analysis</h2>
                        <p className="text-gray-400">Dive deep into lap times and get AI-powered coaching feedback.</p>
                    </div>
                     <div className="flex items-center space-x-4">
                         <select
                            id="car-selector-analysis"
                            value={selectedCar}
                            onChange={e => setSelectedCar(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-race-red focus:border-race-red block w-full p-2.5"
                        >
                            {carOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <button onClick={handleAnalyze} disabled={isLoading} className="bg-race-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap">
                            {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">Lap & Sector Times</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={driverChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                                <XAxis dataKey="lap" stroke="#9ca3af" label={{ value: 'Lap', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}/>
                                <YAxis stroke="#9ca3af" label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5567' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Lap Time" stroke="#EB0A1E" strokeWidth={2} dot={false}/>
                                <Line type="monotone" dataKey="S1" stroke="#38bdf8" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="S2" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="S3" stroke="#4ade80" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">AI Driver Coach Feedback</h3>
                    {isLoading && <LoadingSpinner />}
                    {analysisResult && <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult }} />}
                    {!isLoading && !analysisResult && <p className="text-gray-400">Click "Get AI Analysis" to receive feedback.</p>}
                 </div>
            </div>
        </div>
    );
};

export default Analysis;
