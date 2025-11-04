
export interface RaceResult {
  position: number;
  number: string;
  status: string;
  laps: number;
  totalTime: string;
  gapFirst: string;
  gapPrevious: string;
  fastestLapNum: number;
  fastestLapTime: string;
  fastestLapKph: number;
  team: string;
  class: string;
  group: string | null;
  division: string;
  vehicle: string;
  tires: string | null;
  driverFirstName: string;
  driverSecondName: string;
  driverCountry: string;
}

export interface TelemetryPoint {
  carNumber: string;
  driverShortName: string;
  lap: number;
  lapTime: number; // in seconds
  sector1: number;
  sector2: number;
  sector3: number;
  position: number;
  gapToLeader: number;
  gapToAhead: number;
  speed: number; // km/h
  rpm: number;
  gear: number;
  throttle: number; // %
  brake: number; // %
  tireAge: number; // laps
  fuel: number; // %
  lapDistance: number; // % of lap completed
}

export interface CarState extends TelemetryPoint {
  team: string;
  driverFullName: string;
}

export interface RaceState {
  [carNumber: string]: CarState;
}

export interface StrategyRecommendation {
  recommendation: 'PIT_NOW' | 'PIT_IN_2_LAPS' | 'STAY_OUT' | 'PUSH' | 'CONSERVE_TIRES';
  confidence: number;
  reasoning: string;
  color: 'red' | 'yellow' | 'green';
}
