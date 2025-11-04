
import { useMemo } from 'react';
import { RaceResult, TelemetryPoint } from '../types';

const csvData = `POSITION;NUMBER;STATUS;LAPS;TOTAL_TIME;GAP_FIRST;GAP_PREVIOUS;FL_LAPNUM;FL_TIME;FL_KPH;TEAM;CLASS;GROUP;DIVISION;VEHICLE;TIRES;ECM Participant Id;ECM Team Id;ECM Category Id;ECM Car Id;ECM Brand Id;ECM Country Id;*Extra 7;*Extra 8;*Extra 9;Sort Key;DRIVER_FIRSTNAME;DRIVER_SECONDNAME;DRIVER_LICENSE;DRIVER_HOMETOWN;DRIVER_COUNTRY;DRIVER_SHORTNAME;DRIVER_ECM Driver Id;DRIVER_ECM Country Id;DRIVER_*Extra 3;DRIVER_*Extra 4;DRIVER_*Extra 5;
1;13;Classified;23;45:30.694;-;-;13;1:40.747;140.3;BSI Racing;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Westin;Workman;;;USA;WRK;;;;;;
2;55;Classified;23;45:30.850;+0.156;+0.156;12;1:40.409;140.7;RVA Graphics Motorsports by Speed Syndicate;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Spike;Kohlbecker;;;USA;KHL;;;;;;
3;7;Classified;23;45:31.601;+0.907;+0.751;13;1:40.801;140.2;Copeland Motorsports;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Jaxon;Bell;;;USA;BEL;;;;;;
4;2;Classified;23;45:32.333;+1.639;+0.732;12;1:41.003;139.9;RVA Graphics Motorsports by Speed Syndicate;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Will;Robusto;;;USA;ROB;;;;;;
5;88;Classified;23;45:32.711;+2.017;+0.378;13;1:41.112;139.8;PT Autosport with Copeland Motorsports;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Henry;Drury;;;GBR;DRU;;;;;;
6;21;Classified;23;45:34.615;+3.921;+1.904;11;1:42.056;138.5;Copeland Motorsports;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Ford;Koch;;;USA;KCH;;;;;;
7;51;Classified;23;45:35.290;+4.596;+0.675;13;1:41.567;139.1;BSI Racing;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Massimo;Sunseri;;;USA;SUN;;;;;;
8;111;Classified;23;45:35.662;+4.968;+0.372;13;1:41.721;138.9;RVA Graphics Motorsports by Speed Syndicate;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Isabella;Robusto;;;USA;RBT;;;;;;
9;89;Classified;23;45:36.357;+5.663;+0.695;13;1:42.585;137.7;Eagles Canyon Racing Powered by Fast Track;Am;Legends;GR Cup;Toyota GR86;;;;;;;;;;;;Livio;Galanti;;;ITA;GAL;;;;;;
10;93;Classified;23;45:36.669;+5.975;+0.312;12;1:42.610;137.7;Eagles Canyon Racing Powered by Fast Track;Am;;GR Cup;Toyota GR86;;;;;;;;;;;;Patrick;Brunson;;;USA;BRN;;;;;;
`;

export const useRaceData = (): RaceResult[] => {
  return useMemo(() => {
    const lines = csvData.trim().split('\n');
    const data = lines.slice(1).map(line => {
      const values = line.split(';');
      return {
        position: parseInt(values[0], 10),
        number: values[1],
        status: values[2],
        laps: parseInt(values[3], 10),
        totalTime: values[4],
        gapFirst: values[5],
        gapPrevious: values[6],
        fastestLapNum: parseInt(values[7], 10),
        fastestLapTime: values[8],
        fastestLapKph: parseFloat(values[9]),
        team: values[10],
        class: values[11],
        group: values[12] || null,
        division: values[13],
        vehicle: values[14],
        tires: values[15] || null,
        driverFirstName: values[26],
        driverSecondName: values[27],
        driverCountry: values[30],
      };
    });
    return data;
  }, []);
};


// Mock Telemetry Data for Simulation
const generateMockTelemetry = (): TelemetryPoint[] => {
    const data: TelemetryPoint[] = [];
    const cars = [
        { carNumber: '13', driverShortName: 'WRK' },
        { carNumber: '55', driverShortName: 'KHL' },
        { carNumber: '7', driverShortName: 'BEL' },
        { carNumber: '2', driverShortName: 'ROB' },
        { carNumber: '88', driverShortName: 'DRU' },
    ];
    const totalLaps = 23;

    let carStates = cars.map(c => ({
        ...c,
        lapTime: 101 + Math.random() * 2,
        totalTime: 0,
        tireAge: 0,
        fuel: 100,
        isPitting: false,
    }));

    for (let lap = 1; lap <= totalLaps; lap++) {
        // Sort cars by totalTime to determine position
        carStates.sort((a, b) => a.totalTime - b.totalTime);
        const leaderTotalTime = carStates[0].totalTime;

        for (let i = 0; i < carStates.length; i++) {
            const car = carStates[i];

            // Simulate pit stop logic
            if ((car.carNumber === '88' && lap === 10) || (car.carNumber === '2' && lap === 12)) {
                car.isPitting = true;
            }

            let lapTimeVariation = (Math.random() - 0.5) * 1.5; // Natural variation
            lapTimeVariation += car.tireAge * 0.05; // Tire degradation
            let currentLapTime = car.lapTime + lapTimeVariation;

            if (car.isPitting) {
                currentLapTime += 25; // Pit stop time loss
                car.tireAge = 0; // New tires
                car.fuel = 100; // Refuel
                car.isPitting = false;
            }

            car.totalTime += currentLapTime;
            car.tireAge += 1;
            car.fuel = Math.max(0, car.fuel - 4.3); // Fuel consumption

            const sector1 = currentLapTime * 0.35 + (Math.random() - 0.5);
            const sector2 = currentLapTime * 0.33 + (Math.random() - 0.5);
            const sector3 = currentLapTime - sector1 - sector2;

            data.push({
                carNumber: car.carNumber,
                driverShortName: car.driverShortName,
                lap: lap,
                lapTime: currentLapTime,
                sector1,
                sector2,
                sector3,
                position: i + 1,
                gapToLeader: i === 0 ? 0 : car.totalTime - leaderTotalTime,
                gapToAhead: i === 0 ? 0 : car.totalTime - carStates[i - 1].totalTime,
                speed: 250 + (Math.random() - 0.5) * 40,
                rpm: 7500 + Math.random() * 1000,
                gear: 6,
                throttle: 90 + Math.random() * 10,
                brake: Math.random() > 0.8 ? Math.random() * 20 : 0,
                tireAge: car.tireAge,
                fuel: car.fuel,
                lapDistance: 100, // Simplified for lap-end data
            });
        }
    }
    return data;
};

const mockTelemetry = generateMockTelemetry();

export const useTelemetryData = (): TelemetryPoint[] => {
    return useMemo(() => mockTelemetry, []);
};
