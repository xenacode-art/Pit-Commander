import React, { useState, useMemo } from 'react';
import { RaceResult } from '../types';
import { generateHistoryAnalysis } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { useRaceContext } from './dashboard/index';


const RaceResultsTable: React.FC<{ data: RaceResult[] }> = ({ data }) => (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700 sticky top-0">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">P</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">#</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Driver</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden md:table-cell">Team</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Gap</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden xl:table-cell">Fastest Lap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-gray-900/50">
          {data.map((result) => (
            <tr key={result.position} className="hover:bg-gray-700/50 transition-colors duration-150">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{result.position}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{result.number}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold">{`${result.driverFirstName} ${result.driverSecondName}`}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 hidden md:table-cell">{result.team}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{result.gapFirst}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 hidden xl:table-cell">{result.fastestLapTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);

const AIPanel: React.FC<{ raceData: RaceResult[] }> = ({ raceData }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    const result = await generateHistoryAnalysis(raceData);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg print-card">
      <h2 className="text-xl font-bold text-race-red mb-4 print-text-header">AI Race Debrief</h2>
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2 no-print">
            <button onClick={handleGenerateAnalysis} disabled={isLoading} className="flex-1 bg-race-red hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold py-2 px-4 rounded transition-colors">
              {isLoading ? 'Analyzing...' : 'Generate Summary'}
            </button>
            <button onClick={() => window.print()} title="Export as PDF" className="bg-gray-600 hover:bg-gray-500 text-white font-bold p-2 rounded transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            </button>
        </div>
        {isLoading && <div className="text-center p-4">Loading Analysis...</div>}
        {analysis && <div className="prose prose-invert max-w-none mt-4" dangerouslySetInnerHTML={{ __html: analysis }} />}
      </div>
    </div>
  );
};

const FastestLapChart: React.FC<{ data: RaceResult[] }> = ({ data }) => {
    const chartData = useMemo(() => {
        const topTen = data.slice(0, 10);
        const leaderTimeStr = topTen[0]?.fastestLapTime;
        if (!leaderTimeStr) return [];
        const [min, sec] = leaderTimeStr.split(':').map(parseFloat);
        const leaderTimeSec = min * 60 + sec;

        return topTen.map(d => {
            const [m, s] = d.fastestLapTime.split(':').map(parseFloat);
            const timeSec = m * 60 + s;
            return {
                name: `#${d.number} ${d.driverSecondName.slice(0,5)}.`,
                delta: timeSec - leaderTimeSec,
                lapTime: d.fastestLapTime,
            };
        });
    }, [data]);
    
    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 50, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis type="number" stroke="#9ca3af" domain={[0, 'dataMax + 0.5']} label={{ value: 'Delta to Best Lap (s)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}/>
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                    <Tooltip
                        cursor={{ fill: 'rgba(235, 10, 30, 0.1)' }}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5567' }}
                        labelStyle={{ color: '#F9FAFB' }}
                        formatter={(value, name, props) => [`+${(value as number).toFixed(3)}s (Lap Time: ${props.payload.lapTime})`, 'Delta']}
                    />
                    <Bar dataKey="delta" fill="#EB0A1E">
                        <LabelList dataKey="delta" position="right" formatter={(value: number) => `+${value.toFixed(3)}`} style={{fill: 'white'}}/>
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main History Component ---

const History: React.FC = () => {
    const { historicalData } = useRaceContext();
    return (
        <div className="font-mono space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-gray-800 p-4 rounded-lg shadow-lg print-card">
                    <h2 className="text-xl font-bold text-race-red mb-4 print-text-header">Final Race Results</h2>
                    <RaceResultsTable data={historicalData} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <AIPanel raceData={historicalData} />
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg print-card">
                        <h2 className="text-xl font-bold text-race-red mb-4 print-text-header">Fastest Lap Comparison (Top 10)</h2>
                        <FastestLapChart data={historicalData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;