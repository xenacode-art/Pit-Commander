
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TelemetryPoint, RaceState, CarState } from '../types';
import { useRaceData } from './useRaceData'; // To get team/driver names

const SIMULATION_SPEED_MS = 500; // Update twice per second

export const useRaceSimulation = (telemetryData: TelemetryPoint[]) => {
  const [lap, setLap] = useState(1);
  const [raceState, setRaceState] = useState<RaceState>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const historicalData = useRaceData();

  const carInfo = useRef(
      Object.fromEntries(
          historicalData.map(d => [d.number, { team: d.team, driverFullName: `${d.driverFirstName} ${d.driverSecondName}` }])
      )
  );

  const maxLaps = useMemo(() => {
    return telemetryData.reduce((max, p) => p.lap > max ? p.lap : max, 0);
  }, [telemetryData]);

  const updateRaceStateForLap = useCallback((currentLap: number) => {
    const lapData = telemetryData.filter(p => p.lap === currentLap);
    const newState: RaceState = {};
    for (const point of lapData) {
      newState[point.carNumber] = {
        ...point,
        team: carInfo.current[point.carNumber]?.team || 'N/A',
        driverFullName: carInfo.current[point.carNumber]?.driverFullName || 'N/A',
      };
    }
    setRaceState(newState);
  }, [telemetryData]);
  
  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  useEffect(() => {
    updateRaceStateForLap(1); // Initialize with lap 1 data
  }, [updateRaceStateForLap]);

  useEffect(() => {
      if (isSimulating) {
          intervalRef.current = window.setInterval(() => {
              setLap(prevLap => {
                  const nextLap = prevLap + 1;
                  if (nextLap > maxLaps) {
                      stopSimulation();
                      return maxLaps;
                  }
                  updateRaceStateForLap(nextLap);
                  return nextLap;
              });
          }, SIMULATION_SPEED_MS);
      } else {
          stopSimulation();
      }

      return () => {
          stopSimulation();
      };
  }, [isSimulating, maxLaps, stopSimulation, updateRaceStateForLap]);

  const play = () => setIsSimulating(true);
  const pause = () => setIsSimulating(false);

  const reset = useCallback(() => {
    pause();
    setLap(1);
    updateRaceStateForLap(1);
  }, [pause, updateRaceStateForLap]);

  const goToLap = useCallback((targetLap: number) => {
    pause();
    const newLap = Math.max(1, Math.min(targetLap, maxLaps));
    setLap(newLap);
    updateRaceStateForLap(newLap);
  }, [pause, maxLaps, updateRaceStateForLap]);


  return { lap, raceState, isSimulating, maxLaps, play, pause, reset, goToLap };
};
