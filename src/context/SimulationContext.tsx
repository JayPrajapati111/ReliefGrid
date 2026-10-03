import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Role,
  Hospital,
  Ambulance,
  PatientCluster,
  Depot,
  RoadEdge,
  LedgerBlock,
  AllocationWeights,
  AllocationDecision,
  BenchmarkMetrics,
  Transaction
} from '../types';
import {
  INITIAL_HOSPITALS,
  INITIAL_AMBULANCES,
  INITIAL_CLUSTERS,
  INITIAL_DEPOTS,
  INITIAL_ROAD_EDGES,
  INITIAL_LEDGER_BLOCKS
} from '../data/seedData';
import { runAllocationOptimization, calculateBenchmarkComparison } from '../engine/allocation';
import { verifyChainIntegrity, calculateBlockHash, sha256 } from '../crypto/ledger';

interface SimulationContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeDirective: string;
  setActiveDirective: (dir: string) => void;
  isRunning: boolean;
  setIsRunning: (run: boolean) => void;
  toggleRunning: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  tick: number;
  timeElapsed: number;
  isNaiveMode: boolean;
  setIsNaiveMode: (val: boolean) => void;
  toggleNaiveMode: () => void;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  clusters: PatientCluster[];
  depots: Depot[];
  roads: RoadEdge[];
  ledger: LedgerBlock[];
  decisions: AllocationDecision[];
  weights: AllocationWeights;
  setWeights: (w: AllocationWeights) => void;
  updateWeightKey: (key: keyof AllocationWeights, val: number) => void;
  benchmark: { smart: BenchmarkMetrics; naive: BenchmarkMetrics };
  isTampered: boolean;
  tamperReason: string | null;
  verifyDurationMs: number;
  isVerifying: boolean;
  injectEvent: (type: string) => void;
  lastInjectedEvent: string | null;
  tamperLedger: () => Promise<void>;
  restoreLedger: () => Promise<void>;
  verifyLedger: () => Promise<{ isValid: boolean; brokenBlockIndex: number | null; durationMs: number }>;
  updateHospitalCapacity: (hospitalId: string, updates: Partial<Hospital>) => void;
  confirmFieldDelivery: (ambulanceId: string, clusterId: string, hospitalId: string) => Promise<void>;
  disburseFunds: (origin: string, destination: string, amount: number, purpose: string) => Promise<void>;
  toggleRoadStatus: (roadId: string) => void;
  resetSimulation: () => void;
  selectedAmbulanceId: string;
  setSelectedAmbulanceId: (id: string) => void;
  selectedHospitalId: string;
  setSelectedHospitalId: (id: string) => void;
  selectedClusterId: string;
  setSelectedClusterId: (id: string) => void;
  selectedRoadId: string | null;
  setSelectedRoadId: (id: string | null) => void;
  simulationTimelineHistory: { tick: number; timestamp: string; note: string; eventType?: string }[];
}

const DEFAULT_WEIGHTS: AllocationWeights = {
  wSev: 0.35,
  wTime: 0.25,
  wCap: 0.20,
  wSpec: 0.10,
  wFair: 0.10,
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('cmd');
  const [activeDirective, setActiveDirective] = useState<string>('command-center');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(2);
  const [tick, setTick] = useState<number>(142);
  const [timeElapsed, setTimeElapsed] = useState<number>(16692); // 4h 38m 12s
  const [isNaiveMode, setIsNaiveMode] = useState<boolean>(false);

  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [clusters, setClusters] = useState<PatientCluster[]>(INITIAL_CLUSTERS);
  const [depots, setDepots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [roads, setRoads] = useState<RoadEdge[]>(INITIAL_ROAD_EDGES);
  const [ledger, setLedger] = useState<LedgerBlock[]>(INITIAL_LEDGER_BLOCKS);
  const [weights, setWeights] = useState<AllocationWeights>(DEFAULT_WEIGHTS);

  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>('amb-04');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-kem');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('clust-24');
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);

  const [lastInjectedEvent, setLastInjectedEvent] = useState<string | null>(null);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperReason, setTamperReason] = useState<string | null>(null);
  const [verifyDurationMs, setVerifyDurationMs] = useState<number>(38);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [simulationTimelineHistory, setSimulationTimelineHistory] = useState<{ tick: number; timestamp: string; note: string; eventType?: string }[]>([
    { tick: 100, timestamp: '14:00:00', note: 'Monsoon Flood Alert issued by Disaster Management Authority' },
    { tick: 115, timestamp: '14:15:00', note: 'Hindmata Underpass submerged (95cm depth); R-08 traffic suspended' },
    { tick: 130, timestamp: '14:20:00', note: 'Kurla Hub water breach reported; +12 emergency SOS calls queued' },
    { tick: 142, timestamp: '14:27:04', note: 'Current Simulation Tip: 15 Ambulances actively synchronized' },
  ]);

  // Role switching helper
  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
    if (newRole === 'hosp') {
      setActiveDirective('field-and-hospital-portals');
    } else if (newRole === 'field') {
      setActiveDirective('field-and-hospital-portals');
    } else if (newRole === 'ngo' || newRole === 'audit') {
      setActiveDirective('resource-and-ledger');
    }
  }, []);

  // Compute decisions with reactive weights or naive mode
  const { decisions } = useMemo(() => {
    // If naive mode is active, set weights heavily to nearest without capacity penalty
    const activeWeights = isNaiveMode
      ? { wSev: 0.10, wTime: 0.85, wCap: 0.0, wSpec: 0.0, wFair: 0.05 }
      : weights;
    return runAllocationOptimization(ambulances, clusters, hospitals, roads, activeWeights, tick);
  }, [ambulances, clusters, hospitals, roads, weights, isNaiveMode, tick]);

  // Compute benchmark
  const benchmark = useMemo(() => {
    return calculateBenchmarkComparison(hospitals, clusters, decisions);
  }, [hospitals, clusters, decisions]);

  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const toggleNaiveMode = useCallback(() => {
    setIsNaiveMode(prev => !prev);
  }, []);

  const updateWeightKey = useCallback((key: keyof AllocationWeights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  }, []);

  // Simulation loop tick
  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = Math.max(150, Math.floor(1000 / speed));
    const timer = setInterval(() => {
      setTick(t => t + 1);
      setTimeElapsed(s => s + 1);

      // Micro movement simulation for in-transit ambulances
      setAmbulances(prevAmbs =>
        prevAmbs.map(amb => {
          if (amb.status === 'en_route_pickup' || amb.status === 'en_route_hospital') {
            const deltaLat = (Math.random() - 0.5) * 0.0003;
            const deltaLng = (Math.random() - 0.5) * 0.0003;
            const newBattery = Math.max(18, amb.batteryPercent - (Math.random() > 0.85 ? 1 : 0));
            return {
              ...amb,
              location: {
                lat: Number((amb.location.lat + deltaLat).toFixed(5)),
                lng: Number((amb.location.lng + deltaLng).toFixed(5)),
              },
              batteryPercent: newBattery,
            };
          }
          return amb;
        })
      );
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isRunning, speed]);

  // Toggle Road Status (Open vs Blocked)
  const toggleRoadStatus = useCallback((roadId: string) => {
    setRoads(prev =>
      prev.map(r => {
        if (r.id === roadId) {
          const nextStatus = r.status === 'blocked' ? 'open' : 'blocked';
          const nextDepth = nextStatus === 'blocked' ? 95 : 0;
          return { ...r, status: nextStatus, floodDepthCm: nextDepth };
        }
        return r;
      })
    );
  }, []);

  // Event Injection Handlers
  const injectEvent = useCallback((type: string) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour12: false });

    if (type === 'road_block') {
      setRoads(prev =>
        prev.map(r => (r.id === 'road-eeh' ? { ...r, status: 'blocked', floodDepthCm: 140 } : r))
      );
      setLastInjectedEvent('ROAD BLOCKED: Eastern Express Hwy submerged (140cm). Triggered A* bypass routing.');
      setSimulationTimelineHistory(h => [
        { tick: tick + 1, timestamp: timeStr, note: 'Eastern Express Hwy flooded; 4 ambulances rerouted via LBS Marg', eventType: 'road_block' },
        ...h,
      ]);
    } else if (type === 'hospital_saturation') {
      setHospitals(prev =>
        prev.map(h => (h.id === 'hosp-lilavati' ? { ...h, icuBedsFree: 0, status: 'saturated' } : h))
      );
      setLastInjectedEvent('HOSPITAL SATURATED: Lilavati ICU hits 100%. Reallocating trauma queue to KEM & Hinduja.');
      setSimulationTimelineHistory(h => [
        { tick: tick + 1, timestamp: timeStr, note: 'Lilavati ICU saturated; cascade load-balancing initiated', eventType: 'hospital_saturation' },
        ...h,
      ]);
    } else if (type === 'ambulance_breakdown') {
      setAmbulances(prev =>
        prev.map(a => (a.id === 'amb-04' ? { ...a, status: 'breakdown', speedKmh: 0 } : a))
      );
      setLastInjectedEvent('FLEET BREAKDOWN: Unit AMB-04 waterlogged engine failure in Kurla. Cluster reassigned.');
      setSimulationTimelineHistory(h => [
        { tick: tick + 1, timestamp: timeStr, note: 'AMB-04 mechanical breakdown in flooded underpass', eventType: 'ambulance_breakdown' },
        ...h,
      ]);
    } else if (type === 'patient_surge') {
      const newCluster: PatientCluster = {
        id: `clust-surge-${Date.now()}`,
        name: 'Cluster #44 (Kurla Station East Surge +22)',
        location: { lat: 19.0675, lng: 72.8810 },
        patientCount: 22,
        severity: 5,
        floodDepthCm: 115,
        waitingMinutes: 1,
        status: 'waiting',
        requiredCapability: 'ALS',
        notes: 'High-density wall collapse + flash flood surge. Immediate ALS dispatch requested.',
      };
      setClusters(prev => [newCluster, ...prev]);
      setLastInjectedEvent('MASS PATIENT SURGE: +22 cases reported at Kurla Station East. High-priority dispatch triggered.');
      setSimulationTimelineHistory(h => [
        { tick: tick + 1, timestamp: timeStr, note: 'Mass surge breach at Kurla (+22 victims)', eventType: 'patient_surge' },
        ...h,
      ]);
    } else if (type === 'blood_shortage') {
      setHospitals(prev =>
        prev.map(h =>
          h.id === 'hosp-sion'
            ? { ...h, bloodStockUnits: { ...h.bloodStockUnits, 'O-': 0 } }
            : h
        )
      );
      setLastInjectedEvent('CRITICAL DEFICIT: Sion Trauma O-negative blood stock at 0 units. Drone dispatch initiated from Depot-1.');
      setSimulationTimelineHistory(h => [
        { tick: tick + 1, timestamp: timeStr, note: 'Sion Hospital O- blood stock depleted to 0', eventType: 'blood_shortage' },
        ...h,
      ]);
    } else if (type === 'fund_delay') {
      setLastInjectedEvent('FISCAL DELAY: Autonomous treasury throttles non-urgent transfers to prioritize emergency ICU power.');
      setSimulationTimelineHistory(h => [
        { tick: tick + 1, timestamp: timeStr, note: 'Smart contract liquidity rebalance executed', eventType: 'fund_delay' },
        ...h,
      ]);
    }

    setTimeout(() => {
      setLastInjectedEvent(null);
    }, 6000);
  }, [tick]);

  // Cryptographic Ledger Verification
  const verifyLedger = useCallback(async () => {
    setIsVerifying(true);
    const result = await verifyChainIntegrity(ledger);
    setVerifyDurationMs(result.durationMs);
    setIsVerifying(false);
    return result;
  }, [ledger]);

  // Malicious Tampering Demo
  const tamperLedger = useCallback(async () => {
    setIsTampered(true);
    setTamperReason('Block #426 state mutation detected: Merkle root mismatch cascades to invalid block #427, #428, #429.');

    setLedger(prev =>
      prev.map(block => {
        if (block.index === 426) {
          const mutatedTx = block.transactions.map(t => ({
            ...t,
            payload: '₹12,50,000 Diesel Alloc (UNAUTHORIZED EDIT)',
            valueINR: 1250000,
            verified: false,
          }));
          return {
            ...block,
            status: 'tampered',
            payloadSummary: '₹12,50,000 Diesel procurement [UNAUTHORIZED TAMPERING]',
            totalValueINR: 1250000,
            blockHash: '0xFA17e88c09a2b849102830192840192840192840192840192840192840199999',
            transactions: mutatedTx,
          };
        }
        if (block.index > 426) {
          return {
            ...block,
            status: 'tampered',
          };
        }
        return block;
      })
    );
  }, []);

  // Consensus Heal / Restore
  const restoreLedger = useCallback(async () => {
    setIsTampered(false);
    setTamperReason(null);
    setLedger(INITIAL_LEDGER_BLOCKS);
    setVerifyDurationMs(28);
  }, []);

  // Hospital staff portal updates
  const updateHospitalCapacity = useCallback((hospitalId: string, updates: Partial<Hospital>) => {
    setHospitals(prev =>
      prev.map(h => (h.id === hospitalId ? { ...h, ...updates } : h))
    );
  }, []);

  // Confirm Delivery -> commits new block to ledger
  const confirmFieldDelivery = useCallback(async (ambulanceId: string, clusterId: string, hospitalId: string) => {
    const amb = ambulances.find(a => a.id === ambulanceId);
    const clust = clusters.find(c => c.id === clusterId);
    const hosp = hospitals.find(h => h.id === hospitalId);

    const prevTip = ledger[ledger.length - 1];
    const newIndex = prevTip.index + 1;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const nonce = Math.floor(Math.random() * 900000) + 100000;

    const newTx: Transaction = {
      id: `tx-${newIndex}-1`,
      blockIndex: newIndex,
      timestamp: timeStr,
      type: 'AMBULANCE',
      payload: `${amb?.callsign || 'AMB'} delivered ${clust?.patientCount || 4} patients to ${hosp?.shortName || 'Hospital'} Emergency Bay`,
      originEntity: amb?.callsign || 'Ambulance Field Unit',
      destinationEntity: hosp?.name || 'Emergency Trauma Bay',
      zkSubjectHash: `pat_anon_${Math.random().toString(36).substring(2, 7)}`,
      verified: true,
      txHash: await sha256(`TX_DELIVERY_${newIndex}_${Date.now()}`),
    };

    const blockHash = await calculateBlockHash(newIndex, prevTip.blockHash, timeStr, [newTx], nonce);

    const newBlock: LedgerBlock = {
      index: newIndex,
      timestamp: timeStr,
      previousHash: prevTip.blockHash,
      blockHash,
      nonce,
      status: 'verified',
      payloadSummary: `Field receipt: ${amb?.callsign} patient handover verified on-chain at ${hosp?.shortName}.`,
      transactions: [newTx],
    };

    setLedger(prev => [...prev, newBlock]);

    setAmbulances(prev =>
      prev.map(a => (a.id === ambulanceId ? { ...a, status: 'idle', assignedPatientsCount: 0 } : a))
    );
    setClusters(prev =>
      prev.map(c => (c.id === clusterId ? { ...c, status: 'evacuated' } : c))
    );
  }, [ambulances, clusters, hospitals, ledger]);

  // Disburse Funds -> commits new block to ledger
  const disburseFunds = useCallback(async (origin: string, destination: string, amount: number, purpose: string) => {
    const prevTip = ledger[ledger.length - 1];
    const newIndex = prevTip.index + 1;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const nonce = Math.floor(Math.random() * 900000) + 100000;

    const newTx: Transaction = {
      id: `tx-${newIndex}-fund`,
      blockIndex: newIndex,
      timestamp: timeStr,
      type: 'FUNDS',
      payload: `₹${amount.toLocaleString('en-IN')} - ${purpose}`,
      originEntity: origin,
      destinationEntity: destination,
      zkSubjectHash: 'n/a (audit-fund)',
      valueINR: amount,
      verified: true,
      txHash: await sha256(`TX_FUND_${newIndex}_${Date.now()}`),
    };

    const blockHash = await calculateBlockHash(newIndex, prevTip.blockHash, timeStr, [newTx], nonce);

    const newBlock: LedgerBlock = {
      index: newIndex,
      timestamp: timeStr,
      previousHash: prevTip.blockHash,
      blockHash,
      nonce,
      status: 'verified',
      payloadSummary: `Liquid grant disbursement: ₹${amount.toLocaleString('en-IN')} to ${destination}.`,
      totalValueINR: amount,
      transactions: [newTx],
    };

    setLedger(prev => [...prev, newBlock]);
  }, [ledger]);

  const resetSimulation = useCallback(() => {
    setHospitals(INITIAL_HOSPITALS);
    setAmbulances(INITIAL_AMBULANCES);
    setClusters(INITIAL_CLUSTERS);
    setDepots(INITIAL_DEPOTS);
    setRoads(INITIAL_ROAD_EDGES);
    setLedger(INITIAL_LEDGER_BLOCKS);
    setWeights(DEFAULT_WEIGHTS);
    setTick(142);
    setTimeElapsed(16692);
    setIsTampered(false);
    setIsNaiveMode(false);
    setTamperReason(null);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        role,
        setRole,
        activeDirective,
        setActiveDirective,
        isRunning,
        setIsRunning,
        toggleRunning,
        speed,
        setSpeed,
        tick,
        timeElapsed,
        isNaiveMode,
        setIsNaiveMode,
        toggleNaiveMode,
        hospitals,
        ambulances,
        clusters,
        depots,
        roads,
        ledger,
        decisions,
        weights,
        setWeights,
        updateWeightKey,
        benchmark,
        isTampered,
        tamperReason,
        verifyDurationMs,
        isVerifying,
        injectEvent,
        lastInjectedEvent,
        tamperLedger,
        restoreLedger,
        verifyLedger,
        updateHospitalCapacity,
        confirmFieldDelivery,
        disburseFunds,
        toggleRoadStatus,
        resetSimulation,
        selectedAmbulanceId,
        setSelectedAmbulanceId,
        selectedHospitalId,
        setSelectedHospitalId,
        selectedClusterId,
        setSelectedClusterId,
        selectedRoadId,
        setSelectedRoadId,
        simulationTimelineHistory,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
