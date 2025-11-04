import React from 'react';
import { CarState } from '../../types';

interface LiveTelemetryProps {
    carState: CarState;
}

const TelemetryGauge: React.FC<{ label: string; value: number; max: number; unit: string }> = ({ label, value, max, unit }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-24 h-12">
            <svg className="w-full h-full" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#4A5568" strokeWidth="8" />
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#EB0A1E"
                    strokeWidth="8"
                    strokeDasharray={`${(value / max) * 125.6}, 125.6`}
                    style={{ transition: 'stroke-dasharray 0.3s ease-in-out' }}
                />
            </svg>
            <div className="absolute w-full text-center bottom-0">
                <span className="text-xl font-bold">{Math.round(value)}</span>
                <span className="text-xs text-gray-400">{unit}</span>
            </div>
        </div>
        <div className="text-xs font-semibold text-gray-300 mt-1">{label}</div>
    </div>
);


const LiveTelemetry: React.FC<LiveTelemetryProps> = ({ carState }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 mb-4">
                Live Telemetry - #{carState.carNumber} {carState.driverFullName}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center text-center">
                <TelemetryGauge label="Speed" value={carState.speed} max={300} unit="kph" />
                <TelemetryGauge label="RPM" value={carState.rpm} max={9000} unit="" />
                <TelemetryGauge label="Throttle" value={carState.throttle} max={100} unit="%" />
                <TelemetryGauge label="Brake" value={carState.brake} max={100} unit="%" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-700 text-center">
                 <div>
                    <p className="text-xs text-gray-400">Gear</p>
                    <p className="text-3xl font-bold">{carState.gear}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Tire Age</p>
                    <p className="text-3xl font-bold">{carState.tireAge} <span className="text-base font-normal">laps</span></p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Fuel</p>
                    <p className="text-3xl font-bold">{carState.fuel.toFixed(1)}<span className="text-base font-normal">%</span></p>
                </div>
            </div>
        </div>
    );
};

export default LiveTelemetry;
