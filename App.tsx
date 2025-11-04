
import React, { useState } from 'react';
import { useRaceData, useTelemetryData } from './hooks/useRaceData';
import { useRaceSimulation } from './hooks/useRaceSimulation';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import Analysis from './components/Analysis';
import History from './components/History';
import { RaceResult } from './types';

type View = 'DASHBOARD' | 'SIMULATOR' | 'ANALYSIS' | 'HISTORY';

const TABS: { id: View; label: string }[] = [
    { id: 'DASHBOARD', label: 'Live Dashboard' },
    { id: 'SIMULATOR', label: 'What-If Simulator' },
    { id: 'ANALYSIS', label: 'Driver Analysis' },
    { id: 'HISTORY', label: 'Race History' },
];

export default function App() {
  const [activeView, setActiveView] = useState<View>('DASHBOARD');
  const historicalData = useRaceData();
  const telemetryData = useTelemetryData();
  const simulation = useRaceSimulation(telemetryData);

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard simulation={simulation} telemetryData={telemetryData} />;
      case 'SIMULATOR':
        return <Simulator telemetryData={telemetryData} />;
      case 'ANALYSIS':
        return <Analysis telemetryData={telemetryData} />;
      case 'HISTORY':
        return <History historicalData={historicalData} />;
      default:
        return <Dashboard simulation={simulation} telemetryData={telemetryData} />;
    }
  };

  return (
    <div className="min-h-screen bg-race-gray-dark text-gray-200 p-4 lg:p-6">
      <Header />
      <nav className="mt-6">
        <div className="flex space-x-2 md:space-x-4 border-b border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-3 py-2 md:px-4 md:py-3 font-mono font-bold text-sm md:text-base transition-colors duration-200 focus:outline-none ${
                activeView === tab.id
                  ? 'border-b-2 border-race-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="mt-6">
        {renderView()}
      </main>
    </div>
  );
}
