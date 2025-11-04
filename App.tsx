import React, { useState } from 'react';
import Header from './components/Header';
import History from './components/History';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import Analysis from './components/Analysis';
import { useRaceData, useTelemetryData } from './hooks/useRaceData';

type Tab = 'live' | 'history' | 'simulator' | 'analysis';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('live');
    const historicalData = useRaceData();
    const telemetryData = useTelemetryData();

    const renderContent = () => {
        switch (activeTab) {
            case 'history':
                return <History historicalData={historicalData} />;
            case 'live':
                return <Dashboard telemetryData={telemetryData} />;
            case 'simulator':
                return <Simulator telemetryData={telemetryData} />;
            case 'analysis':
                return <Analysis telemetryData={telemetryData} />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors focus:outline-none ${
                activeTab === tab 
                ? 'bg-gray-800 text-race-red border-b-2 border-race-red' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto p-4 lg:p-6">
                <Header />
                <main className="mt-6">
                    <nav className="flex border-b border-gray-700 mb-6">
                        <TabButton tab="live" label="Live Race Dashboard" />
                        <TabButton tab="history" label="Race History" />
                        <TabButton tab="simulator" label="What-If Simulator" />
                        <TabButton tab="analysis" label="Driver Analysis" />
                    </nav>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
