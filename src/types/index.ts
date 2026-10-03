export type Role = 'cmd' | 'hosp' | 'field' | 'ngo' | 'audit';

export type TriageSeverity = 1 | 2 | 3 | 4 | 5;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  location: GeoPoint;
  icuBedsTotal: number;
  icuBedsFree: number;
  generalBedsTotal: number;
  generalBedsFree: number;
  bloodStockUnits: {
    'O-': number;
    'O+': number;
    'A+': number;
    'AB-': number;
  };
  specialties: string[];
  status: 'normal' | 'busy' | 'saturated';
  address: string;
  currentInboundAmbulances: number;
}

export interface Ambulance {
  id: string;
  callsign: string;
  type: 'ALS' | 'BLS';
  location: GeoPoint;
  status: 'idle' | 'en_route_pickup' | 'en_route_hospital' | 'breakdown';
  targetClusterId?: string;
  targetHospitalId?: string;
  speedKmh: number;
  batteryPercent: number;
  assignedPatientsCount: number;
  etaMinutes: number;
  routeCoordinates?: GeoPoint[];
}

export interface PatientCluster {
  id: string;
  name: string;
  location: GeoPoint;
  patientCount: number;
  severity: TriageSeverity; // 5 is Critical, 1 is Minor
  floodDepthCm: number;
  waitingMinutes: number;
  status: 'waiting' | 'assigned' | 'evacuated';
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  requiredCapability: 'ALS' | 'BLS';
  notes: string;
}

export interface Depot {
  id: string;
  name: string;
  location: GeoPoint;
  inventory: {
    bloodUnitsO_Neg: number;
    oxygenCylinders: number;
    traumaKits: number;
    dieselLiters: number;
  };
  activeCouriers: number;
}

export interface RoadEdge {
  id: string;
  name: string;
  fromNode: string;
  toNode: string;
  fromCoords: GeoPoint;
  toCoords: GeoPoint;
  distanceKm: number;
  baseTimeMin: number;
  status: 'open' | 'congested' | 'blocked';
  floodDepthCm: number;
}

export interface AllocationWeights {
  wSev: number;   // Triage severity weight (default 0.35)
  wTime: number;  // Dijkstra travel time penalty (default 0.25)
  wCap: number;   // Hospital ICU/bed capacity margin (default 0.20)
  wSpec: number;  // Specialty & blood match bonus (default 0.10)
  wFair: number;  // Anti-starvation equity (default 0.10)
}

export interface RejectedAlternative {
  entityName: string;
  entityType: 'hospital' | 'route' | 'ambulance';
  costDifference: number;
  reason: string;
}

export interface AllocationDecision {
  id: string;
  timestamp: string;
  tick: number;
  ambulanceId: string;
  ambulanceCallsign: string;
  ambulanceType: 'ALS' | 'BLS';
  clusterId: string;
  clusterName: string;
  hospitalId: string;
  hospitalName: string;
  severity: TriageSeverity;
  costScore: number;
  travelDistanceKm: number;
  etaMinutes: number;
  weights: AllocationWeights;
  costBreakdown: {
    urgencyDiscount: number;
    travelPenalty: number;
    specialtyBonus: number;
    capacitySlackPenalty: number;
    starvationDiscount: number;
  };
  reasonSummary: string;
  detailedExplanation: string;
  rejectedAlternatives: RejectedAlternative[];
  isReroute?: boolean;
  preemptedClusterId?: string;
}

export interface Transaction {
  id: string;
  blockIndex: number;
  timestamp: string;
  type: 'FUNDS' | 'BLOOD' | 'AMBULANCE' | 'MEDICAL_KITS';
  payload: string;
  originEntity: string;
  destinationEntity: string;
  zkSubjectHash: string; // HIPAA anonymized patient or internal token
  valueINR?: number;
  verified: boolean;
  txHash: string;
}

export interface LedgerBlock {
  index: number;
  timestamp: string;
  previousHash: string;
  blockHash: string;
  transactions: Transaction[];
  nonce: number;
  status: 'verified' | 'tampered';
  payloadSummary: string;
  totalValueINR?: number;
}

export interface BenchmarkMetrics {
  avgResponseMin: number;
  critSurvivalRate: number;
  icuOverloadPercent: number;
  starvationIndex: number;
  livesSavedProjected: number;
  hospitalLoadDistribution: { name: string; occupancyPercent: number }[];
  alsSpecialtyMatchRate: number;
}
