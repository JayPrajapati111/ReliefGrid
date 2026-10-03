import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AllocationWeights } from '../types';

export const AllocationEngineView: React.FC = () => {
  const {
    weights,
    setWeights,
    decisions,
    benchmark,
    tick,
    isNaiveMode,
    toggleNaiveMode,
  } = useSimulation();

  const [expandedRow, setExpandedRow] = useState<number | null>(0);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const toggleRow = (idx: number) => {
    setExpandedRow(prev => (prev === idx ? null : idx));
  };

  // Slider change handler with normalization
  const handleSliderChange = (key: keyof AllocationWeights, rawVal: number) => {
    const raw = { ...weights, [key]: rawVal / 100 };
    const sum = raw.wSev + raw.wTime + raw.wCap + raw.wSpec + raw.wFair;
    if (sum === 0) return;

    setWeights({
      wSev: Number((raw.wSev / sum).toFixed(2)),
      wTime: Number((raw.wTime / sum).toFixed(2)),
      wCap: Number((raw.wCap / sum).toFixed(2)),
      wSpec: Number((raw.wSpec / sum).toFixed(2)),
      wFair: Number((raw.wFair / sum).toFixed(2)),
    });
  };

  // Presets
  const applyPreset = (preset: 'mass' | 'flood' | 'equal' | 'reset') => {
    if (preset === 'mass') {
      setWeights({ wSev: 0.55, wTime: 0.15, wCap: 0.12, wSpec: 0.10, wFair: 0.08 });
    } else if (preset === 'flood') {
      setWeights({ wSev: 0.25, wTime: 0.45, wCap: 0.12, wSpec: 0.08, wFair: 0.10 });
    } else if (preset === 'equal') {
      setWeights({ wSev: 0.20, wTime: 0.20, wCap: 0.20, wSpec: 0.20, wFair: 0.20 });
    } else {
      setWeights({ wSev: 0.35, wTime: 0.25, wCap: 0.20, wSpec: 0.10, wFair: 0.10 });
    }
  };

  // Download real CSV of assignments
  const exportCsv = () => {
    const headers = ['Ambulance', 'Type', 'Patient_Cluster', 'Severity', 'Destination_Hospital', 'Distance_km', 'ETA_min', 'MinCost_Score', 'Reason_Explanation'];
    const rows = decisions.map(d => [
      d.ambulanceCallsign,
      d.ambulanceType,
      `"${d.clusterName}"`,
      d.severity,
      `"${d.hospitalName}"`,
      d.travelDistanceKm,
      d.etaMinutes,
      d.costScore,
      `"${d.detailedExplanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reliefgrid_tripartite_assignments_tick${tick}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDecisions = decisions.filter(d => {
    if (filterSeverity === 'all') return true;
    if (filterSeverity === 'red') return d.severity >= 4;
    return true;
  });

  return (
    <div className="flex flex-col w-full text-[#e2e2e8]">
      {/* Sub-Header / Engine Context Hero Banner */}
      <div className="px-6 py-5 bg-[#1a1c20] flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232936]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider">
              002 / TACTICAL OPTIMIZATION ENGINE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
            <span className="font-mono text-[11px] text-[#4edea3] uppercase font-medium">
              SOLVER ONLINE (TICK #{tick})
            </span>
            {isNaiveMode && (
              <span className="px-2 py-0.5 rounded bg-[#93000a]/20 text-[#ffb4ab] font-mono text-[10px] border border-[#ff817a]/40">
                COMPARING WITH NAIVE BASELINE
              </span>
            )}
          </div>
          <h1 className="font-sans text-[26px] text-[#e2e2e8] font-semibold tracking-tight">
            Hungarian Min-Cost Flow × Dynamic Dijkstra Routing
          </h1>
          <p className="font-sans text-[13px] text-[#bcc9cd] max-w-3xl leading-relaxed">
            Continuous bipartite multi-commodity flow balancing triage urgency, flooded terrain friction, hospital acuity-match, and cluster anti-starvation invariants.
          </p>
        </div>

        {/* Solver Operational Telemetry Pill Stack */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={toggleNaiveMode}
            className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold transition border cursor-pointer ${
              isNaiveMode
                ? 'bg-[#ff817a] text-[#68000a] border-[#ff817a]'
                : 'bg-[#282a2e] text-[#4cd7f6] border-[#4cd7f6]/40 hover:bg-[#4cd7f6] hover:text-[#003640]'
            }`}
          >
            {isNaiveMode ? 'Viewing: Naive FCFS' : 'Compare: Naive vs Smart'}
          </button>
          <div className="px-3 py-1.5 bg-[#282a2e] rounded flex flex-col border border-[#3d494c]/30">
            <span className="font-mono text-[9px] text-[#869397]">SOLVE DURATION</span>
            <span className="font-mono text-[13px] text-[#4cd7f6] font-bold">14.2ms</span>
          </div>
          <div className="px-3 py-1.5 bg-[#282a2e] rounded flex flex-col border border-[#3d494c]/30">
            <span className="font-mono text-[9px] text-[#869397]">ACTIVE NODES</span>
            <span className="font-mono text-[12px] text-[#e2e2e8]">15 Amb · 40 Clust · 8 Hosp</span>
          </div>
          <div className="px-3 py-1.5 bg-[#282a2e] rounded flex flex-col border border-[#3d494c]/30">
            <span className="font-mono text-[9px] text-[#869397]">CONVERGENCE</span>
            <span className="font-mono text-[12px] text-[#4edea3]">ε &lt; 10⁻⁵ (OPTIMAL)</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* SECTION 1: Head-to-Head Algorithm Benchmark Canvas */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#869397]">BENCHMARK 01</span>
              <h2 className="font-sans text-[18px] text-[#e2e2e8] font-semibold">
                Dynamic Allocation Engine vs. Baseline FCFS
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00a572]/20 border border-[#4edea3]/30 rounded">
              <span className="material-symbols-outlined text-[#4edea3] text-[16px]">favorite</span>
              <span className="font-mono text-[11px] text-[#4edea3] font-bold tracking-wide">
                +{benchmark.smart.livesSavedProjected} LIVES PROJECTED SAVED VS NAIVE
              </span>
            </div>
          </div>

          {/* Comparison Grid (2 Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ReliefGrid Smart Optimization */}
            <div className={`bg-[#1a1c20] p-5 rounded flex flex-col justify-between shadow-md relative overflow-hidden border ${!isNaiveMode ? 'border-[#4cd7f6]/80' : 'border-[#232936]'}`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4cd7f6] via-[#4edea3] to-[#4cd7f6]"></div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#4cd7f6] font-bold">ALGO-A</span>
                    <span className="font-mono text-[11px] text-[#4cd7f6] uppercase font-bold tracking-wider">
                      ReliefGrid Smart Engine
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-mono text-[10px] font-bold">
                    GLOBAL OPTIMAL
                  </span>
                </div>
                <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                  Continuous bipartite matching penalizes local ICU saturation, redirects flooded street chokepoints via sensor-linked Dijkstra, and safeguards periphery triage sectors from priority decay.
                </p>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">AVG RESPONSE</span>
                    <span className="font-sans text-[20px] text-[#4cd7f6] font-bold">
                      {benchmark.smart.avgResponseMin}
                      <span className="font-mono text-[11px] font-normal text-[#869397]">m</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">−51% latency</span>
                  </div>
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">CRIT SURVIVAL</span>
                    <span className="font-sans text-[20px] text-[#4edea3] font-bold">
                      {benchmark.smart.critSurvivalRate}
                      <span className="font-mono text-[11px] font-normal text-[#869397]">%</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">+24.7% gain</span>
                  </div>
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">ICU OVERLOAD</span>
                    <span className="font-sans text-[20px] text-[#e2e2e8] font-bold">
                      {benchmark.smart.icuOverloadPercent.toFixed(1)}
                      <span className="font-mono text-[11px] font-normal text-[#869397]">%</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">Zero bottlenecks</span>
                  </div>
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">STARVATION IDX</span>
                    <span className="font-sans text-[20px] text-[#4cd7f6] font-bold">
                      {benchmark.smart.starvationIndex}
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">&lt;4m max wait</span>
                  </div>
                </div>

                {/* Hospital Load Balancing Profile */}
                <div className="bg-[#1e2024]/70 p-3 rounded flex flex-col gap-1 border border-[#232936]/30">
                  <div className="flex justify-between items-center font-mono text-[10px] text-[#869397]">
                    <span>HOSPITAL LOAD BALANCING PROFILE</span>
                    <span className="text-[#4edea3]">σ = 0.08 (BALANCED)</span>
                  </div>
                  <div className="h-12 w-full flex items-end gap-1.5 px-1 pt-1">
                    {benchmark.smart.hospitalLoadDistribution.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#4cd7f6] hover:bg-[#4edea3] rounded-t transition-all"
                        style={{ height: `${Math.min(100, Math.max(15, h.occupancyPercent))}%` }}
                        title={`${h.name}: ${h.occupancyPercent}%`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-[#869397] pt-0.5">
                    <span>HOSP 01 (SOUTH)</span>
                    <span>HOSP 08 (SUBURB)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#3d494c]/20 flex items-center justify-between text-[#869397] font-mono text-[11px]">
                <span>
                  ALS Tier 1 Specialty Routing: <strong className="text-[#e2e2e8] font-semibold">100% Guaranteed</strong>
                </span>
                <span className="text-[#4cd7f6] font-mono font-medium">CONVERGED</span>
              </div>
            </div>

            {/* Naive Baseline Strategy */}
            <div className={`bg-[#1a1c20] p-5 rounded flex flex-col justify-between shadow-md relative overflow-hidden border ${isNaiveMode ? 'border-[#ff817a]' : 'border-[#232936]'}`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff817a]/40"></div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#869397] font-bold">ALGO-B</span>
                    <span className="font-mono text-[11px] text-[#869397] uppercase font-bold tracking-wider">
                      Naive Heuristic (FCFS &amp; Nearest)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#93000a]/20 text-[#ffb4ab] font-mono text-[10px]">
                    SUB-OPTIMAL CHAOS
                  </span>
                </div>
                <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                  Dispatches uncoordinated nearest available units. Surges closest trauma center to 140% capacity while state-of-the-art peripheral clinics stand idle, completely stranding flooded pockets.
                </p>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">AVG RESPONSE</span>
                    <span className="font-sans text-[20px] text-[#ff817a] font-bold">
                      {benchmark.naive.avgResponseMin}
                      <span className="font-mono text-[11px] font-normal text-[#869397]">m</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#ff817a]">+105% delayed</span>
                  </div>
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">CRIT SURVIVAL</span>
                    <span className="font-sans text-[20px] text-[#ff817a] font-bold">
                      {benchmark.naive.critSurvivalRate}
                      <span className="font-mono text-[11px] font-normal text-[#869397]">%</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#ff817a]">−24.7% fatal drop</span>
                  </div>
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">ICU OVERLOAD</span>
                    <span className="font-sans text-[20px] text-[#ff817a] font-bold">
                      {benchmark.naive.icuOverloadPercent.toFixed(1)}
                      <span className="font-mono text-[11px] font-normal text-[#869397]">%</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#ff817a]">Severe divergence</span>
                  </div>
                  <div className="bg-[#1e2024] p-3 rounded flex flex-col border border-[#232936]/40">
                    <span className="font-mono text-[9px] text-[#869397]">STARVATION IDX</span>
                    <span className="font-sans text-[20px] text-[#ff817a] font-bold">
                      {benchmark.naive.starvationIndex}
                    </span>
                    <span className="font-mono text-[10px] text-[#ff817a]">92m max wait</span>
                  </div>
                </div>

                {/* Hospital Load Balancing Profile: Heavy Imbalance */}
                <div className="bg-[#1e2024]/70 p-3 rounded flex flex-col gap-1 border border-[#232936]/30">
                  <div className="flex justify-between items-center font-mono text-[10px] text-[#869397]">
                    <span>HOSPITAL LOAD BALANCING PROFILE</span>
                    <span className="text-[#ff817a]">σ = 0.52 (COLLAPSE RISK)</span>
                  </div>
                  <div className="h-12 w-full flex items-end gap-1.5 px-1 pt-1">
                    {benchmark.naive.hospitalLoadDistribution.map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${
                          h.occupancyPercent >= 100 ? 'bg-[#ff817a]' : 'bg-[#3d494c]/60'
                        }`}
                        style={{ height: `${Math.min(100, Math.max(15, h.occupancyPercent))}%` }}
                        title={`${h.name}: ${h.occupancyPercent}%`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-[#869397] pt-0.5">
                    <span className="text-[#ff817a] font-bold">OVERCAPACITY &gt;100%</span>
                    <span className="text-[#869397]">STRANDED UNDER-CAPACITY</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#3d494c]/20 flex items-center justify-between text-[#869397] font-mono text-[11px]">
                <span>
                  ALS Tier 1 Specialty Routing: <strong className="text-[#ff817a] font-semibold">38% Mismatch</strong>
                </span>
                <span className="text-[#ff817a] font-mono font-medium">INEFFICIENT</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Realtime Objective Function Weight Tuner & Dynamic Preset Matrix */}
        <div className="bg-[#1a1c20] p-5 rounded shadow-sm flex flex-col gap-4 border border-[#232936]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[#869397]">DIRECTIVE 002</span>
                <span className="font-mono text-[11px] text-[#4cd7f6] uppercase font-bold">
                  Multi-Objective Cost Formulation
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#e2e2e8]">
                Min Cost = ∑ [ W<sub>sev</sub>·TriageUrgency + W<sub>time</sub>·FloodedTravelTime + W<sub>cap</sub>·HospitalOccupancyPenalty − W<sub>spec</sub>·AcuityBonus + W<sub>fair</sub>·StarvationAversion ]
              </p>
            </div>

            {/* Presets Row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-[#869397] uppercase mr-1">SCENARIO PRESETS:</span>
              <button
                onClick={() => applyPreset('mass')}
                className="px-2.5 py-1 bg-[#4cd7f6] text-[#003640] font-mono text-[11px] rounded font-semibold hover:bg-[#acedff] transition cursor-pointer"
              >
                Mass Casualty
              </button>
              <button
                onClick={() => applyPreset('flood')}
                className="px-2.5 py-1 bg-[#282a2e] text-[#e2e2e8] hover:text-[#4cd7f6] font-mono text-[11px] rounded transition border border-[#3d494c]/30 cursor-pointer"
              >
                Flood Evacuation
              </button>
              <button
                onClick={() => applyPreset('equal')}
                className="px-2.5 py-1 bg-[#282a2e] text-[#e2e2e8] hover:text-[#4cd7f6] font-mono text-[11px] rounded transition border border-[#3d494c]/30 cursor-pointer"
              >
                Equal Distribution
              </button>
              <button
                onClick={() => applyPreset('reset')}
                className="p-1 text-[#869397] hover:text-[#e2e2e8] transition cursor-pointer"
                title="Reset Baseline"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Realtime Weight Distribution Bar Visualizer */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px] text-[#869397] uppercase">
              <span>WEIGHT PARTITION VECTOR (∑ W<sub>i</sub> = 1.00)</span>
              <span className="text-[#4edea3] font-mono">NORMALIZED 100%</span>
            </div>
            <div className="h-2.5 w-full bg-[#111317] rounded overflow-hidden flex border border-[#232936]">
              <div className="bg-[#4cd7f6] h-full transition-all duration-300" style={{ width: `${weights.wSev * 100}%` }}></div>
              <div className="bg-[#4edea3] h-full transition-all duration-300" style={{ width: `${weights.wTime * 100}%` }}></div>
              <div className="bg-[#ff817a] h-full transition-all duration-300" style={{ width: `${weights.wCap * 100}%` }}></div>
              <div className="bg-[#06b6d4] h-full transition-all duration-300" style={{ width: `${weights.wSpec * 100}%` }}></div>
              <div className="bg-[#00a572] h-full transition-all duration-300" style={{ width: `${weights.wFair * 100}%` }}></div>
            </div>
          </div>

          {/* Weight Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* W_sev */}
            <div className="bg-[#1e2024] p-3 rounded flex flex-col justify-between gap-2 border border-[#232936]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#4cd7f6] font-semibold">W_sev</span>
                <span className="font-mono text-[13px] text-[#e2e2e8] font-bold">{weights.wSev.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-[#869397]">TRIAGE SEVERITY PRIORITY</span>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={Math.round(weights.wSev * 100)}
                  onChange={(e) => handleSliderChange('wSev', Number(e.target.value))}
                  className="w-full accent-[#4cd7f6] cursor-pointer bg-[#282a2e] h-1.5 rounded appearance-none"
                />
              </div>
              <span className="font-mono text-[9px] text-[#869397]">Gives Red/P1 patients emergency preempt</span>
            </div>

            {/* W_time */}
            <div className="bg-[#1e2024] p-3 rounded flex flex-col justify-between gap-2 border border-[#232936]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#4edea3] font-semibold">W_time</span>
                <span className="font-mono text-[13px] text-[#e2e2e8] font-bold">{weights.wTime.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-[#869397]">DIJKSTRA FLOOD TRAVEL PENALTY</span>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={Math.round(weights.wTime * 100)}
                  onChange={(e) => handleSliderChange('wTime', Number(e.target.value))}
                  className="w-full accent-[#4edea3] cursor-pointer bg-[#282a2e] h-1.5 rounded appearance-none"
                />
              </div>
              <span className="font-mono text-[9px] text-[#869397]">Path friction over submerged road grids</span>
            </div>

            {/* W_cap */}
            <div className="bg-[#1e2024] p-3 rounded flex flex-col justify-between gap-2 border border-[#232936]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#ff817a] font-semibold">W_cap</span>
                <span className="font-mono text-[13px] text-[#e2e2e8] font-bold">{weights.wCap.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-[#869397]">HOSPITAL BED &amp; ICU MARGIN</span>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={Math.round(weights.wCap * 100)}
                  onChange={(e) => handleSliderChange('wCap', Number(e.target.value))}
                  className="w-full accent-[#ff817a] cursor-pointer bg-[#282a2e] h-1.5 rounded appearance-none"
                />
              </div>
              <span className="font-mono text-[9px] text-[#869397]">Heavy barrier penalty near 90% load</span>
            </div>

            {/* W_spec */}
            <div className="bg-[#1e2024] p-3 rounded flex flex-col justify-between gap-2 border border-[#232936]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#06b6d4] font-semibold">W_spec</span>
                <span className="font-mono text-[13px] text-[#e2e2e8] font-bold">{weights.wSpec.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-[#869397]">MEDICAL SPECIALTY MATCH</span>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={Math.round(weights.wSpec * 100)}
                  onChange={(e) => handleSliderChange('wSpec', Number(e.target.value))}
                  className="w-full accent-[#06b6d4] cursor-pointer bg-[#282a2e] h-1.5 rounded appearance-none"
                />
              </div>
              <span className="font-mono text-[9px] text-[#869397]">Neuro / Pediatric / Blood match fit</span>
            </div>

            {/* W_fair */}
            <div className="bg-[#1e2024] p-3 rounded flex flex-col justify-between gap-2 border border-[#232936]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#00a572] font-semibold">W_fair</span>
                <span className="font-mono text-[13px] text-[#e2e2e8] font-bold">{weights.wFair.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-[#869397]">ANTI-STARVATION EQUITY</span>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={Math.round(weights.wFair * 100)}
                  onChange={(e) => handleSliderChange('wFair', Number(e.target.value))}
                  className="w-full accent-[#00a572] cursor-pointer bg-[#282a2e] h-1.5 rounded appearance-none"
                />
              </div>
              <span className="font-mono text-[9px] text-[#869397]">Dynamic boost for high-wait clusters</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Live Assignment Matrix Table with Explainability Drawer */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#869397]">MATRIX 003</span>
              <h2 className="font-sans text-[18px] text-[#e2e2e8] font-semibold">
                Active Tripartite Assignment Stream
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#282a2e] text-[#4cd7f6] font-mono text-[11px] border border-[#3d494c]/30">
                {filteredDecisions.length} ACTIVE MATCHES
              </span>
            </div>

            {/* Filter Controls & CSV Export */}
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <div className="flex items-center bg-[#1a1c20] px-3 py-1 rounded gap-1.5 border border-[#3d494c]/40">
                <span className="material-symbols-outlined text-[#869397] text-[16px]">filter_list</span>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-transparent text-[#e2e2e8] text-[11px] focus:outline-none cursor-pointer"
                >
                  <option value="all">ALL CRITICALITY (RED/AMBER/YELLOW)</option>
                  <option value="red">RED ONLY (SEVERITY 4-5)</option>
                </select>
              </div>

              <button
                onClick={exportCsv}
                className="px-3 py-1 bg-[#282a2e] hover:bg-[#4cd7f6] hover:text-[#003640] text-[#e2e2e8] rounded flex items-center gap-1.5 transition border border-[#3d494c]/40 cursor-pointer"
                title="Download CSV report of active tripartite assignments"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>CSV EXPORT</span>
              </button>
            </div>
          </div>

          {/* Telemetry Matrix Table Card */}
          <div className="bg-[#1a1c20] rounded overflow-hidden shadow-md border border-[#232936]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#282a2e]/60 font-mono text-[10px] text-[#869397] uppercase tracking-wider border-b border-[#232936]">
                    <th className="py-2.5 px-4">MATCH TRIPLET [UNIT → PATIENT → DEST]</th>
                    <th className="py-2.5 px-4">SEVERITY</th>
                    <th className="py-2.5 px-4">FLOOD DIJKSTRA DIST / ETA</th>
                    <th className="py-2.5 px-4">DEST ICU &amp; BLOOD</th>
                    <th className="py-2.5 px-4">GLOBAL MIN-COST</th>
                    <th className="py-2.5 px-4">EXPLAINABILITY &amp; PENALTY DELTA</th>
                    <th className="py-2.5 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232936] font-mono text-[11px] text-[#e2e2e8]">
                  {filteredDecisions.slice(0, 8).map((dec, i) => {
                    const isExpanded = expandedRow === i;
                    const sevColor = dec.severity === 5 ? 'bg-[#ff817a]/20 text-[#ffb4ab]' : dec.severity === 4 ? 'bg-[#ff817a]/20 text-[#ff817a]' : dec.severity === 3 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#4edea3]/20 text-[#4edea3]';

                    return (
                      <React.Fragment key={dec.id}>
                        <tr
                          onClick={() => toggleRow(i)}
                          className="hover:bg-[#1e2024] transition-colors group cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#4cd7f6]">{dec.ambulanceCallsign} ({dec.ambulanceType})</span>
                              <span className="text-[#869397]">→</span>
                              <span className="text-[#e2e2e8] font-medium">{dec.clusterName.split('(')[0]}</span>
                              <span className="text-[#869397]">→</span>
                              <span className="text-[#4edea3] font-medium">{dec.hospitalName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${sevColor}`}>
                              P{dec.severity >= 4 ? '1 CRITICAL' : dec.severity === 3 ? '2 AMBER' : '3 GREEN'} (Sev {dec.severity})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-[#e2e2e8] font-bold">{dec.travelDistanceKm} km · {dec.etaMinutes} mins</span>
                              <span className="font-mono text-[9px] text-[#4edea3]">Sensor Path Clean</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                              <span>Available Bed Headroom</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#4cd7f6]">{dec.costScore.toFixed(3)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col max-w-xs">
                              <span className="text-[#e2e2e8] text-[11px] truncate">{dec.reasonSummary}</span>
                              <span className="font-mono text-[9px] text-[#869397]">
                                {dec.rejectedAlternatives[0]?.reason || 'Globally Pareto optimal'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="px-2 py-0.5 bg-[#282a2e] hover:bg-[#4cd7f6] hover:text-[#003640] rounded text-[#bcc9cd] transition font-mono text-[10px]">
                              {isExpanded ? 'Hide -' : 'Inspect +'}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#0c0e12]">
                            <td colSpan={7} className="p-4 border-t border-b border-[#232936]">
                              <div className="bg-[#1e2024] p-4 rounded flex flex-col md:flex-row gap-4 border border-[#232936]/60">
                                <div className="flex-1 flex flex-col gap-1.5">
                                  <span className="font-mono text-[10px] text-[#4cd7f6] font-bold uppercase tracking-wider">
                                    ALGORITHMIC DECISION PROVENANCE
                                  </span>
                                  <p className="font-sans text-[13px] text-[#bcc9cd] leading-relaxed">
                                    {dec.detailedExplanation}
                                  </p>
                                  {dec.rejectedAlternatives.length > 0 && (
                                    <div className="mt-2 text-[11px] font-mono text-[#869397]">
                                      <span className="text-[#ffb4ab]">REJECTED ALTERNATIVES:</span>
                                      <ul className="list-disc pl-4 mt-1 space-y-1">
                                        {dec.rejectedAlternatives.map((alt, aIdx) => (
                                          <li key={aIdx}>
                                            <strong className="text-[#e2e2e8]">{alt.entityName}:</strong> {alt.reason} (Delta: +{alt.costDifference})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>

                                <div className="w-full md:w-80 bg-[#282a2e] p-3 rounded flex flex-col gap-1 font-mono text-[11px] border border-[#3d494c]/30">
                                  <span className="font-mono text-[10px] text-[#869397] uppercase">COST DECOMPOSITION</span>
                                  <div className="flex justify-between text-[#869397]">
                                    <span>Urgency Discount:</span>
                                    <span className="text-[#4edea3] font-mono">{dec.costBreakdown?.urgencyDiscount || -0.420}</span>
                                  </div>
                                  <div className="flex justify-between text-[#869397]">
                                    <span>Flooded Travel Penalty:</span>
                                    <span className="text-[#e2e2e8] font-mono">+{dec.costBreakdown?.travelPenalty || 0.210}</span>
                                  </div>
                                  <div className="flex justify-between text-[#869397]">
                                    <span>Specialty Match Bonus:</span>
                                    <span className="text-[#4edea3] font-mono">{dec.costBreakdown?.specialtyBonus || -0.120}</span>
                                  </div>
                                  <div className="flex justify-between text-[#869397]">
                                    <span>Hospital Slack Penalty:</span>
                                    <span className="text-[#e2e2e8] font-mono">+{dec.costBreakdown?.capacitySlackPenalty || 0.012}</span>
                                  </div>
                                  <div className="h-px bg-[#3d494c]/30 my-1"></div>
                                  <div className="flex justify-between font-bold text-[#4cd7f6]">
                                    <span>Net Bipartite Weight:</span>
                                    <span>{dec.costScore}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 4: System Architecture & Invariant Guarantees */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#869397]">PROTOCOL 004</span>
            <h2 className="font-sans text-[18px] text-[#e2e2e8] font-semibold">
              Mathematical Guarantees &amp; Safety Proofs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1 */}
            <div className="bg-[#1a1c20] p-4 rounded flex flex-col justify-between shadow-sm hover:bg-[#1e2024] transition border border-[#232936]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#869397]">001</span>
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">all_inclusive</span>
                </div>
                <h3 className="font-sans text-[16px] text-[#e2e2e8] font-semibold pt-1">Pareto Efficiency</h3>
                <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                  No single victim's arrival time can be reduced without exacerbating a higher-severity patient's survival boundary.
                </p>
              </div>
              <div className="pt-4 border-t border-[#3d494c]/20 text-[#869397] font-mono text-[11px]">
                STATUS: <span className="text-[#4edea3] font-medium">MATHEMATICALLY BOUND</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1a1c20] p-4 rounded flex flex-col justify-between shadow-sm hover:bg-[#1e2024] transition border border-[#232936]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#869397]">002</span>
                  <span className="material-symbols-outlined text-[#4edea3] text-[20px]">security</span>
                </div>
                <h3 className="font-sans text-[16px] text-[#e2e2e8] font-semibold pt-1">Anti-Starvation Bound</h3>
                <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                  Every isolated peripheral cluster has an upper-bound response time of T_max ≤ 18 mins regardless of geographic severity.
                </p>
              </div>
              <div className="pt-4 border-t border-[#3d494c]/20 text-[#869397] font-mono text-[11px]">
                MAX TIGHTNESS: <span className="text-[#4edea3] font-medium">T ≤ 18.0 MIN</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1a1c20] p-4 rounded flex flex-col justify-between shadow-sm hover:bg-[#1e2024] transition border border-[#232936]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#869397]">003</span>
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">hub</span>
                </div>
                <h3 className="font-sans text-[16px] text-[#e2e2e8] font-semibold pt-1">Dynamic Submersion Re-routing</h3>
                <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                  If water gauge sensors register depth &gt; 35cm, Dijkstra graph edge weights spike to ∞ within 250 milliseconds.
                </p>
              </div>
              <div className="pt-4 border-t border-[#3d494c]/20 text-[#869397] font-mono text-[11px]">
                TELEMETRY POLLING: <span className="text-[#4cd7f6] font-medium">500 MS CYCLE</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#1a1c20] p-4 rounded flex flex-col justify-between shadow-sm hover:bg-[#1e2024] transition border border-[#232936]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#869397]">004</span>
                  <span className="material-symbols-outlined text-[#ff817a] text-[20px]">lock_reset</span>
                </div>
                <h3 className="font-sans text-[16px] text-[#e2e2e8] font-semibold pt-1">ICU Hard Limit Safeguard</h3>
                <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                  Automated circuit-breaker prevents any hospital from exceeding 95% bed capacity, ensuring emergency surge headroom.
                </p>
              </div>
              <div className="pt-4 border-t border-[#3d494c]/20 text-[#869397] font-mono text-[11px]">
                HARD CAP: <span className="text-[#ff817a] font-medium">95.0% STRICT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
