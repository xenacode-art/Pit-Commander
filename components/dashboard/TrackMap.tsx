import React from 'react';
import { RaceState, CarState } from '../../types';

interface TrackMapProps {
    raceState: RaceState;
    selectedCarNumber: string | null;
}

// A more detailed, stylized SVG path for the Indianapolis road course, split for gradients.
const trackPaths = {
    mainStraight: "M 90,280 V 50",
    topSection: "M 90,50 H 320 C 350,50 360,80 330,90",
    infield1: "M 330,90 L 260,90 C 250,90 250,100 260,110 L 330,110 C 360,120 350,150 320,150",
    backStraight: "M 320,150 H 180",
    infield2: "M 180,150 C 150,150 140,170 160,190 L 320,190",
    finalTurns: "M 320,190 C 350,190 360,220 330,230 L 90,230",
};

// Key points along the track with distance for interpolation.
// d = distance from start
const trackPoints = [
    {d: 0,     x: 90,  y: 280},
    {d: 230,   x: 90,  y: 50},
    {d: 460,   x: 320, y: 50},
    {d: 550,   x: 330, y: 90},
    {d: 620,   x: 260, y: 90},
    {d: 700,   x: 260, y: 110},
    {d: 770,   x: 330, y: 110},
    {d: 850,   x: 320, y: 150},
    {d: 990,   x: 180, y: 150},
    {d: 1150,  x: 160, y: 190},
    {d: 1300,  x: 320, y: 190},
    {d: 1380,  x: 330, y: 230},
    {d: 1620,  x: 90,  y: 230},
    {d: 1670,  x: 90,  y: 280},
];
const totalPathLength = trackPoints[trackPoints.length - 1].d;

const getCarPositionAndAngleOnTrack = (lapDistance: number) => {
    const distance = (lapDistance / 100) * totalPathLength;

    for (let i = 0; i < trackPoints.length - 1; i++) {
        const p1 = trackPoints[i];
        const p2 = trackPoints[i + 1];

        if (distance >= p1.d && distance < p2.d) {
            const segmentDist = distance - p1.d;
            const segmentLen = p2.d - p1.d;
            const t = segmentLen === 0 ? 0 : segmentDist / segmentLen;

            const x = p1.x + (p2.x - p1.x) * t;
            const y = p1.y + (p2.y - p1.y) * t;
            
            // Calculate angle based on the direction of the current segment
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            return { x, y, angle };
        }
    }

    // Fallback for the very last point
    const lastPoint = trackPoints[trackPoints.length - 1];
    return { x: lastPoint.x, y: lastPoint.y, angle: 90 };
};


const TrackMap: React.FC<TrackMapProps> = ({ raceState, selectedCarNumber }) => {
    const cars = (Object.values(raceState) as CarState[]).sort((a,b) => b.position - a.position);

    const getLapDistance = (position: number, gapToLeader: number) => {
        const base = (new Date().getTime() / 20) % 100;
        const offset = (position * 3 + gapToLeader * 1.5) % 100;
        return (base - offset + 100) % 100;
    };
    
    // Car icon shape (a simple triangle pointer)
    const carIconPath = "M 0 -6 L 5 4 L -5 4 Z";

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 mb-4">Track Map</h3>
            <div className="flex justify-center items-center">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                    <defs>
                        <linearGradient id="trackGradientH" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4A5568" />
                            <stop offset="50%" stopColor="#606B80" />
                            <stop offset="100%" stopColor="#4A5568" />
                        </linearGradient>
                         <linearGradient id="trackGradientV" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#424B5A" />
                            <stop offset="100%" stopColor="#556073" />
                        </linearGradient>
                    </defs>
                    
                    {/* Track Base with Gradients */}
                    <g strokeWidth="12" fill="none">
                        <path d={trackPaths.mainStraight} stroke="url(#trackGradientV)" />
                        <path d={trackPaths.topSection} stroke="url(#trackGradientH)" />
                        <path d={trackPaths.infield1} stroke="url(#trackGradientV)" />
                        <path d={trackPaths.backStraight} stroke="url(#trackGradientH)" />
                        <path d={trackPaths.infield2} stroke="url(#trackGradientV)" />
                        <path d={trackPaths.finalTurns} stroke="url(#trackGradientH)" />
                        <path d="M 90,230 V 280" stroke="url(#trackGradientV)" />
                    </g>

                    {/* Track Detail Line */}
                     <g stroke="#667185" strokeWidth="1" fill="none">
                        <path d={Object.values(trackPaths).join(" ")} />
                        <path d="M 90,230 V 280" />
                     </g>

                    {/* Start/Finish Line */}
                    <line x1="90" y1="265" x2="110" y2="265" stroke="white" strokeWidth="1.5" />
                    <line x1="90" y1="275" x2="110" y2="275" stroke="white" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="90" y1="285" x2="110" y2="285" stroke="white" strokeWidth="1.5" />
                    
                    {cars.map(car => {
                        const { x, y, angle } = getCarPositionAndAngleOnTrack(getLapDistance(car.position, car.gapToLeader));
                        const isSelected = car.carNumber === selectedCarNumber;

                        return (
                             <g 
                                key={car.carNumber} 
                                transform={`translate(${x}, ${y}) rotate(${angle + 90})`} // Add 90 because icon points 'up'
                             >
                                <path
                                    d={carIconPath}
                                    fill={isSelected ? '#FBBF24' : '#EB0A1E'} // Yellow for selected, red for others
                                    stroke={isSelected ? 'white' : 'black'}
                                    strokeWidth={isSelected ? 0.8 : 0.5}
                                    transform="scale(1.4)"
                                />
                                <text
                                    x={12}
                                    y={4}
                                    fontSize="10"
                                    fill="white"
                                    className="font-bold"
                                    transform={`rotate(${-angle - 90})`} // Counter-rotate text to keep it upright
                                >
                                    {car.carNumber}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default TrackMap;