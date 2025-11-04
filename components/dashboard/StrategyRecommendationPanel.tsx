import React, { useState, useEffect } from 'react';
import { CarState, StrategyRecommendation } from '../../types';
import { generateStrategyRecommendation } from '../../services/geminiService';

interface StrategyRecommendationPanelProps {
    carState: CarState;
}

const LoadingSpinner: React.FC = () => (
     <div className="flex items-center justify-center space-x-2 text-gray-300">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Pit Commander is calculating...</span>
    </div>
);


const StrategyRecommendationPanel: React.FC<StrategyRecommendationPanelProps> = ({ carState }) => {
    const [recommendation, setRecommendation] = useState<StrategyRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const getRecommendation = async () => {
            if (!carState) return;
            setIsLoading(true);
            setError(null);
            try {
                const result = await generateStrategyRecommendation(carState);
                setRecommendation(result);
            } catch (err) {
                console.error("Failed to get strategy recommendation:", err);
                setError("Could not fetch AI recommendation.");
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce the API call to avoid spamming on rapid lap changes
        const handler = setTimeout(() => {
            getRecommendation();
        }, 1000); // 1-second debounce

        return () => {
            clearTimeout(handler);
        };

    }, [carState]);

    const colorMap = {
        red: 'border-race-red text-race-red',
        yellow: 'border-race-yellow text-race-yellow',
        green: 'border-green-500 text-green-500',
    };

    const recommendationTextMap = {
        PIT_NOW: 'PIT NOW',
        PIT_IN_2_LAPS: 'PIT IN 2 LAPS',
        STAY_OUT: 'STAY OUT',
        PUSH: 'PUSH',
        CONSERVE_TIRES: 'CONSERVE TIRES'
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 mb-4">AI Strategy Command</h3>
            <div className="min-h-[160px] flex items-center justify-center">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-race-red">{error}</p>}
                {!isLoading && !error && recommendation && (
                    <div className="text-center w-full">
                        <div className={`p-2 border-2 rounded-md inline-block ${colorMap[recommendation.color]}`}>
                            <p className="text-2xl font-black tracking-wider">
                                {recommendationTextMap[recommendation.recommendation] || recommendation.recommendation}
                            </p>
                        </div>
                         <p className="text-sm text-gray-400 mt-3">{recommendation.reasoning}</p>
                         <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${recommendation.confidence}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Confidence: {recommendation.confidence}%</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StrategyRecommendationPanel;
