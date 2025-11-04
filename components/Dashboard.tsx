import React, { useState, useEffect } from 'react';
import { useRaceSimulation } from '../hooks/useRaceSimulation';
import { TelemetryPoint } from '../types';
import LiveLeaderboard from './dashboard/LiveLeaderboard';
import LiveTelemetry from './dashboard/LiveTelemetry';
import StrategyRecommendationPanel from './dashboard/StrategyRecommendationPanel';
import TrackMap from './dashboard/TrackMap';

interface DashboardProps {
    telemetryData: TelemetryPoint[];
}

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l1.5 1.5A9 9 0 0121 12a9 9 0 01-2.636 6.364M20 20l-1.5-1.5A9 9 0 003 12a9 9 0 002.636-6.364" /></svg>;


const Dashboard: React.FC<DashboardProps> = ({ telemetryData }) => {
    const { lap, raceState, isSimulating, maxLaps, play, pause, reset, goToLap } = useRaceSimulation(telemetryData);
    const [selectedCarNumber, setSelectedCarNumber] = useState<string | null>(null);

    useEffect(() => {
        // Select the first car by default when raceState is populated
        if (!selectedCarNumber && Object.keys(raceState).length > 0) {
            setSelectedCarNumber(Object.keys(raceState).sort((a,b) => raceState[a].position - raceState[b].position)[0]);
        }
    }, [raceState, selectedCarNumber]);


    const handleSelectCar = (carNumber: string) => {
        setSelectedCarNumber(carNumber);
    };
    
    const selectedCarState = selectedCarNumber ? raceState[selectedCarNumber] : null;

    return (
        <div className="font-mono space-y-6">
            {/* Simulation Controls */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                     <h2 className="text-xl font-bold text-race-red">Live Simulation</h2>
                     <div className="flex items-center gap-3">
                        <button onClick={reset} className="text-gray-400 hover:text-white transition-colors" title="Reset"><ResetIcon /></button>
                        <button onClick={isSimulating ? pause : play} className="text-gray-400 hover:text-white transition-colors" title={isSimulating ? 'Pause' : 'Play'}>
                            {isSimulating ? <PauseIcon /> : <PlayIcon />}
                        </button>
                     </div>
                 </div>
                 <div className="w-full sm:w-auto flex-grow flex items-center gap-4">
                     <span className="text-sm">LAP</span>
                     <input
                         type="range"
                         min="1"
                         max={maxLaps}
                         value={lap}
                         onChange={(e) => goToLap(parseInt(e.target.value))}
                         className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="font-bold text-xl text-race-red w-12 text-center">{lap}/{maxLaps}</span>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-6">
                     <LiveLeaderboard
                        raceState={raceState}
                        onSelectCar={handleSelectCar}
                        selectedCarNumber={selectedCarNumber}
                    />
                    {selectedCarState && <StrategyRecommendationPanel carState={selectedCarState} />}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-6">
                    <TrackMap raceState={raceState} selectedCarNumber={selectedCarNumber} />
                    {selectedCarState && <LiveTelemetry carState={selectedCarState} />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
