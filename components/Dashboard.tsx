import React, { useState, useEffect, useRef } from 'react';
import { CarState } from '../types';
import LiveLeaderboard from './dashboard/LiveLeaderboard';
import LiveTelemetry from './dashboard/LiveTelemetry';
import StrategyRecommendationPanel from './dashboard/StrategyRecommendationPanel';
import TrackMap from './dashboard/TrackMap';
import { useRaceContext } from './dashboard/index';
import { askAIRaceEngineer } from '../services/geminiService';


const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l1.5 1.5A9 9 0 0121 12a9 9 0 01-2.636 6.364M20 20l-1.5-1.5A9 9 0 003 12a9 9 0 002.636-6.364" /></svg>;

const SendIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>;
const AiIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-race-red" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;


const AIConversationalPanel: React.FC = () => {
    const { raceState, lap } = useRaceContext();
    const [history, setHistory] = useState<{ user: string, ai: string }[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [history]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        
        setIsLoading(true);
        const currentQuery = query;
        setQuery('');

        const responseHtml = await askAIRaceEngineer(currentQuery, raceState, lap);
        setHistory(prev => [...prev, { user: currentQuery, ai: responseHtml }]);
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 mb-4">AI Race Engineer</h3>
            <div className="flex flex-col h-[280px]">
                <div ref={scrollRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {history.map((entry, index) => (
                        <div key={index}>
                            <p className="text-sm text-gray-400 font-semibold text-right">You:</p>
                            <p className="p-2 bg-gray-700/50 rounded-lg text-sm text-right">{entry.user}</p>
                            <p className="text-sm text-race-red font-semibold mt-2 flex items-center gap-1"><AiIcon /> Pit Commander:</p>
                            <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.ai }} />
                        </div>
                    ))}
                    {isLoading && <p className="text-center text-sm text-gray-400">AI is thinking...</p>}
                </div>
                <form onSubmit={handleAsk} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Ask about the race..."
                        className="flex-grow bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-race-red focus:border-race-red block w-full p-2"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="bg-race-red hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold p-2 rounded-lg transition-colors">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { lap, raceState, isSimulating, maxLaps, play, pause, reset, goToLap } = useRaceContext();
    const [selectedCarNumber, setSelectedCarNumber] = useState<string | null>(null);

    useEffect(() => {
        // FIX: This effect now reliably selects the lead car on the first load without causing state issues.
        // It correctly sorts the car objects by position instead of sorting their string keys.
        // This ensures the initial state is stable, allowing the component to correctly receive updates from the simulation.
        if (!selectedCarNumber && Object.values(raceState).length > 0) {
            const leader = (Object.values(raceState) as CarState[]).sort((a, b) => a.position - b.position)[0];
            if (leader) {
                setSelectedCarNumber(leader.carNumber);
            }
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
                    <AIConversationalPanel />
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