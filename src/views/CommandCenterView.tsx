import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TacticalMap } from '../components/TacticalMap';

export const CommandCenterView: React.FC = () => {
  const {
    isRunning,
    toggleRunning,
    speed,
    setSpeed,
    tick,
    timeElapsed,
    injectEvent,
    lastInjectedEvent,
    decisions,
    hospitals,
    ambulances,
    clusters,
    ledger,
    simulationTimelineHistory,
    setActiveDirective,
    setSelectedHospitalId,
    setSelectedClusterId
  } = useSimulation();

  const [expandedDrawerId, setExpandedDrawerId] = useState<string | null>('drawer-0');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(258); // 04:18
  const [activeTelemetryNote, setActiveTelemetryNote] = useState<string | null>(null);

  // Active countdown timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCountdownSeconds(sec => (sec > 0 ? sec - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatCountdown = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} left`;
  };

  const toggleDrawer = (id: string) => {
    setExpandedDrawerId(prev => (prev === id ? null : id));
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  const criticalWaiting = clusters.filter(c => c.severity >= 4 && c.status !== 'evacuated');
  const totalOccupiedIcu = hospitals.reduce((acc, h) => acc + (h.icuBedsTotal - h.icuBedsFree), 0);
  const totalIcuCapacity = hospitals.reduce((acc, h) => acc + h.icuBedsTotal, 0);
  const activeTransitCount = ambulances.filter(a => a.status.includes('en_route')).length;

  return (
    <div className="flex flex-col w-full text-[#e2e2e8]">
      {/* Minimalist Editorial Sub-bar */}
      <div className="px-6 py-2 bg-[#0c0e12] flex flex-wrap items-center justify-between gap-y-1 border-b border-[#232936]">
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-[#869397]">SYS.CMD / ALLOCATION MATRIX</span>
          <span className="w-1 h-1 rounded-full bg-[#869397]"></span>
          <span className="text-[#bcc9cd]">GEO-VECTOR: MUMBAI SECTOR-4 FLOOD DIRECTIVE</span>
          <span className="w-1 h-1 rounded-full bg-[#869397]"></span>
          <span className="text-[#4edea3]">A* HEURISTIC OPTIMIZER: ONLINE</span>
        </div>
        <div className="flex items-center gap-5 text-[11px] font-mono">
          <span className="text-[#869397] uppercase">BLOCK ANCHOR: #{ledger[ledger.length - 1]?.index || 429} (POLYGON-ZK)</span>
          <span className="text-[#4cd7f6] font-medium tracking-wider">LATENCY: 38ms</span>
        </div>
      </div>

      {/* SECTION 001: Editorial KPI Monograph Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-1.5 p-4 bg-[#1a1c20] border-b border-[#232936]">
        {/* Tile 001 / CAPACITY */}
        <div
          onClick={() => setActiveDirective('field-and-hospital-portals')}
          className="bg-[#1e2024] p-4 rounded flex flex-col justify-between hover:bg-[#282a2e] transition-colors border border-[#232936]/40 cursor-pointer group"
          title="Click to view Hospital Portals & Bed Census"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-[#869397] group-hover:text-[#4cd7f6]">001 / CAPACITY</span>
              <span className="material-symbols-outlined text-[14px] text-[#4edea3]">trending_up</span>
            </div>
            <div className="font-sans text-[22px] text-[#e2e2e8] font-semibold tracking-tight">
              {totalOccupiedIcu} <span className="text-[#869397] font-normal text-[15px]">/ {totalIcuCapacity}</span>
            </div>
            <div className="font-mono text-[11px] text-[#4edea3] mt-1">
              {((totalOccupiedIcu / totalIcuCapacity) * 100).toFixed(1)}% Resolved
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397]">{activeTransitCount} IN ACTIVE TRANSIT</span>
            <svg className="w-16 h-4 text-[#4edea3]" fill="none" viewBox="0 0 64 16">
              <path d="M0 12 L12 10 L24 13 L36 6 L48 8 L64 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Tile 002 / DISPATCH DELAY */}
        <div
          onClick={() => setActiveDirective('allocation-engine')}
          className="bg-[#1e2024] p-4 rounded flex flex-col justify-between hover:bg-[#282a2e] transition-colors border border-[#232936]/40 cursor-pointer group"
          title="Click to inspect Hungarian Solver Weights & Dijkstra Routing"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-[#869397] group-hover:text-[#4cd7f6]">002 / DISPATCH DELAY</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3]">A* ACTIVE</span>
            </div>
            <div className="font-sans text-[22px] text-[#e2e2e8] font-semibold tracking-tight">
              8.4 <span className="font-mono text-[12px] text-[#869397]">MIN</span>
            </div>
            <div className="font-mono text-[11px] text-[#4edea3] mt-1">-51.2% vs Naive 17.2m</div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397]">TRAUMA RAD: &lt;3.2KM</span>
            <span className="font-mono text-[11px] text-[#4cd7f6] font-bold">OPTIMAL</span>
          </div>
        </div>

        {/* Tile 003 / TRIAGE HAZARD */}
        <div
          onClick={() => {
            if (criticalWaiting.length > 0) {
              setSelectedClusterId(criticalWaiting[0].id);
            }
          }}
          className="bg-[#1e2024] p-4 rounded flex flex-col justify-between hover:bg-[#282a2e] transition-colors border border-[#232936]/40 relative overflow-hidden cursor-pointer"
          title="Click to focus on most critical triage pocket"
        >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#ff817a]/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-[#ff817a]">003 / TRIAGE HAZARD</span>
              <span className="w-2 h-2 rounded-full bg-[#ff817a] animate-ping"></span>
            </div>
            <div className="font-sans text-[22px] text-[#ffb4ab] font-semibold tracking-tight">
              {criticalWaiting.length || 4} Patients
            </div>
            <div className="font-mono text-[11px] text-[#869397] mt-1">Urgency Index 5 (Critical)</div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between font-mono text-[11px]">
            <span className="font-mono text-[10px] text-[#869397]">MAX WAIT WINDOW</span>
            <span className="text-[#ffb4ab] font-bold font-mono">{formatCountdown(countdownSeconds)}</span>
          </div>
        </div>

        {/* Tile 004 / ALLOCATION MATCH */}
        <div
          onClick={() => setActiveDirective('allocation-engine')}
          className="bg-[#1e2024] p-4 rounded flex flex-col justify-between hover:bg-[#282a2e] transition-colors border border-[#232936]/40 cursor-pointer group"
          title="Click to view Multi-Objective Bipartite Cost Matrix"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-[#869397] group-hover:text-[#4cd7f6]">004 / ALLOCATION MATCH</span>
              <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">hub</span>
            </div>
            <div className="font-sans text-[22px] text-[#e2e2e8] font-semibold tracking-tight">91.8%</div>
            <div className="font-mono text-[11px] text-[#4cd7f6] mt-1">ICU Spec-Alignment</div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397]">REJECTED ROUTES: 0</span>
            <span className="font-mono text-[11px] text-[#e2e2e8]">P-VAL &lt; 0.001</span>
          </div>
        </div>

        {/* Tile 005 / FISCAL LEDGER */}
        <div
          onClick={() => setActiveDirective('resource-and-ledger')}
          className="bg-[#1e2024] p-4 rounded flex flex-col justify-between hover:bg-[#282a2e] transition-colors border border-[#232936]/40 cursor-pointer group"
          title="Click to open Cryptographic Ledger & Verify Hashes"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-[#869397] group-hover:text-[#4edea3]">005 / FISCAL LEDGER</span>
              <span className="font-mono text-[10px] text-[#4edea3]">VERIFIED</span>
            </div>
            <div className="font-sans text-[22px] text-[#e2e2e8] font-semibold tracking-tight">
              ₹34.5L <span className="font-mono text-[12px] text-[#869397]">/ 50L</span>
            </div>
            <div className="font-mono text-[11px] text-[#869397] mt-1">69.0% Pool Liquidated</div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between font-mono text-[11px]">
            <span className="font-mono text-[10px] text-[#869397]">LEDGER STAMP</span>
            <span className="text-[#4edea3] font-mono">#{ledger[ledger.length - 1]?.index}-TXN</span>
          </div>
        </div>
      </div>

      {/* Dynamic Event Injection Notification Banner */}
      {lastInjectedEvent && (
        <div className="mx-4 mt-3 p-3 rounded bg-[#93000a]/30 border border-[#ff817a] text-[#ffdad6] font-mono text-[12px] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff817a] text-[18px]">crisis_alert</span>
            <span>{lastInjectedEvent}</span>
          </div>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
        </div>
      )}

      {/* Optional Telemetry Monograph Detail Modal */}
      {activeTelemetryNote && (
        <div className="mx-4 mt-2 p-3 bg-[#1a1c20] border border-[#4cd7f6] rounded font-mono text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">info</span>
            <span>{activeTelemetryNote}</span>
          </div>
          <button onClick={() => setActiveTelemetryNote(null)} className="text-[#869397] hover:text-[#e2e2e8]">
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* MAIN OPERATIONAL GRID (3 Column Swiss Command Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 p-4 bg-[#0c0e12]">
        {/* LEFT PANEL: Scenario Controls & Event Injector (3 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          {/* Simulation Controls Box */}
          <div className="bg-[#1a1c20] p-4 rounded flex flex-col gap-3 border border-[#232936]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#869397] uppercase">SIMULATION ENGINE</span>
                <span className="font-sans text-[16px] text-[#e2e2e8] font-medium">Tactical Loop</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#282a2e] text-[#4cd7f6] border border-[#3d494c]/30">
                TICK #{tick}
              </span>
            </div>

            {/* Simulation Transport Buttons */}
            <div className="flex items-center justify-between gap-1 bg-[#333539] p-1 rounded">
              <button
                onClick={toggleRunning}
                className={`flex-1 py-1 font-mono text-[11px] font-semibold rounded flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer ${
                  isRunning
                    ? 'bg-[#4cd7f6] text-[#003640]'
                    : 'bg-[#4edea3] text-[#003824]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isRunning ? 'HOLD' : 'RESUME'}</span>
              </button>
              <button
                onClick={() => setSpeed(1)}
                className={`px-2 py-1 rounded font-mono text-[11px] cursor-pointer ${
                  speed === 1 ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#e2e2e8] hover:text-[#4cd7f6]'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setSpeed(2)}
                className={`px-2 py-1 rounded font-mono text-[11px] cursor-pointer ${
                  speed === 2 ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#e2e2e8] hover:text-[#4cd7f6]'
                }`}
              >
                2x
              </button>
              <button
                onClick={() => setSpeed(5)}
                className={`px-2 py-1 rounded font-mono text-[11px] cursor-pointer ${
                  speed === 5 ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#e2e2e8] hover:text-[#4cd7f6]'
                }`}
              >
                5x
              </button>
              <button
                onClick={() => setSpeed(10)}
                className={`px-2 py-1 rounded font-mono text-[11px] text-[#ffb3ad] hover:text-[#ff817a] cursor-pointer ${
                  speed === 10 ? 'bg-[#ff817a] text-[#68000a] font-bold' : ''
                }`}
              >
                MAX
              </button>
            </div>

            <div className="flex items-center justify-between text-[#869397] font-mono text-[11px] pt-1 border-t border-[#3d494c]/20">
              <span>SINCE ONSET</span>
              <span className="text-[#e2e2e8] font-mono font-medium">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          {/* Emergency Event Injector Grid */}
          <div className="bg-[#1a1c20] p-4 rounded flex flex-col gap-2 flex-1 border border-[#232936]">
            <div className="flex items-center justify-between pb-2 border-b border-[#232936]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">bolt</span>
                <span className="font-mono text-[11px] uppercase text-[#e2e2e8] font-semibold tracking-wider">
                  EVENT INJECTION MATRIX
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#869397] uppercase">STOCHASTIC FAULTS</span>
            </div>

            <p className="font-sans text-[12px] text-[#bcc9cd] leading-snug">
              Force anomaly stress-tests to observe deterministic Hungarian × Dijkstra dynamic recalculations.
            </p>

            <div className="grid grid-cols-1 gap-1.5 mt-1">
              {/* Trigger 1 */}
              <button
                onClick={() => injectEvent('road_block')}
                className="text-left p-2.5 bg-[#1e2024] hover:bg-[#282a2e] rounded transition-all group flex items-start gap-2.5 border border-[#232936]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#ff817a] text-[18px] mt-0.5 group-hover:scale-110 transition-transform">
                  wrong_location
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-medium group-hover:text-[#4cd7f6] transition-colors">
                    Road Blocked
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">Submerge EE Highway; triggers A* bypass</span>
                </div>
              </button>

              {/* Trigger 2 */}
              <button
                onClick={() => injectEvent('hospital_saturation')}
                className="text-left p-2.5 bg-[#1e2024] hover:bg-[#282a2e] rounded transition-all group flex items-start gap-2.5 border border-[#232936]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#ffb3ad] text-[18px] mt-0.5 group-hover:scale-110 transition-transform">
                  local_hospital
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-medium group-hover:text-[#4cd7f6] transition-colors">
                    Hospital Saturated
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">Lilavati ICU hits 100%; initiate cascade</span>
                </div>
              </button>

              {/* Trigger 3 */}
              <button
                onClick={() => injectEvent('ambulance_breakdown')}
                className="text-left p-2.5 bg-[#1e2024] hover:bg-[#282a2e] rounded transition-all group flex items-start gap-2.5 border border-[#232936]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#bcc9cd] text-[18px] mt-0.5 group-hover:scale-110 transition-transform">
                  car_crash
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-medium group-hover:text-[#4cd7f6] transition-colors">
                    Fleet Failure (AMB-04)
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">Mechanical failure; reallocate cluster</span>
                </div>
              </button>

              {/* Trigger 4 */}
              <button
                onClick={() => injectEvent('patient_surge')}
                className="text-left p-2.5 bg-[#1e2024] hover:bg-[#282a2e] rounded transition-all group flex items-start gap-2.5 border border-[#232936]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#ff817a] text-[18px] mt-0.5 group-hover:scale-110 transition-transform">
                  groups
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-medium group-hover:text-[#4cd7f6] transition-colors">
                    Mass Surge (+22 Cases)
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">Kurla Depot high-density flood breach</span>
                </div>
              </button>

              {/* Trigger 5 */}
              <button
                onClick={() => injectEvent('blood_shortage')}
                className="text-left p-2.5 bg-[#1e2024] hover:bg-[#282a2e] rounded transition-all group flex items-start gap-2.5 border border-[#232936]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#ff817a] text-[18px] mt-0.5 group-hover:scale-110 transition-transform">
                  bloodtype
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-medium group-hover:text-[#4cd7f6] transition-colors">
                    Blood Stock Depleted
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">Sion Trauma: O- stock drops to 0</span>
                </div>
              </button>

              {/* Trigger 6 */}
              <button
                onClick={() => injectEvent('fund_delay')}
                className="text-left p-2.5 bg-[#1e2024] hover:bg-[#282a2e] rounded transition-all group flex items-start gap-2.5 border border-[#232936]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#869397] text-[18px] mt-0.5 group-hover:scale-110 transition-transform">
                  currency_rupee
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-medium group-hover:text-[#4cd7f6] transition-colors">
                    Ledger Delay / Cut
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">Throttle smart contract liquidations</span>
                </div>
              </button>
            </div>
          </div>

          {/* Incident Log */}
          <div className="bg-[#1a1c20] p-4 rounded flex flex-col gap-1 border border-[#232936]">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              CRITICAL INCIDENT LOG (ROLLING)
            </span>
            <div className="flex flex-col gap-1.5 text-[#bcc9cd] font-mono text-[11px] mt-1 max-h-28 overflow-y-auto pr-1">
              {simulationTimelineHistory.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2">
                  <span className={idx === 0 ? 'text-[#ff817a]' : 'text-[#4cd7f6]'}>{item.timestamp}</span>
                  <span className="truncate flex-1 text-right">{item.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTRAL SECTION: Tactical Mumbai Flood Vector Simulation (6 Cols) */}
        <div className="xl:col-span-6 flex flex-col gap-3">
          <TacticalMap />
        </div>

        {/* RIGHT PANEL: Live Transparent Allocation Feed & Explainability (3 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          <div className="bg-[#1a1c20] p-4 rounded flex flex-col flex-1 border border-[#232936]">
            <div className="flex items-center justify-between pb-2 border-b border-[#232936] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">psychology</span>
                <span className="font-mono text-[11px] uppercase text-[#e2e2e8] font-bold tracking-wider">
                  EXPLAINABILITY LOG
                </span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3]">
                A* REASONING
              </span>
            </div>

            <p className="font-sans text-[12px] text-[#bcc9cd] mb-3 leading-snug">
              Deterministic allocation traces with survival probability calculations and mathematical weights.
            </p>

            {/* Allocation Decision Feed Cards */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[580px] pr-1">
              {decisions.slice(0, 6).map((dec, idx) => {
                const drawerId = `drawer-${idx}`;
                const isExpanded = expandedDrawerId === drawerId;
                const borderCol = idx === 0 ? 'border-[#4cd7f6]' : idx === 1 ? 'border-[#4edea3]' : 'border-[#ffb3ad]';

                return (
                  <div
                    key={dec.id}
                    className={`p-3 bg-[#1e2024] rounded hover:bg-[#282a2e] transition-colors flex flex-col gap-1 border-l-2 ${borderCol} border border-[#232936]/40`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#4cd7f6] font-semibold">
                        DISPATCH TRIPLET #{dec.id.slice(-3)}
                      </span>
                      <span className="font-mono text-[11px] text-[#869397]">{dec.timestamp}</span>
                    </div>

                    <div className="font-mono text-[11px] text-[#e2e2e8] font-medium">
                      {dec.ambulanceCallsign} ({dec.ambulanceType}) →{' '}
                      <span className="text-[#ffb4ab] font-bold">{dec.clusterName.split('(')[0]}</span> →{' '}
                      <span className="text-[#4edea3] font-bold">{dec.hospitalName}</span>
                    </div>

                    <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                      {dec.detailedExplanation}
                    </p>

                    {/* Collapsible Mathematics Drawer Button */}
                    <button
                      onClick={() => toggleDrawer(drawerId)}
                      className="mt-1 flex items-center justify-between text-[#869397] hover:text-[#e2e2e8] font-mono text-[10px] pt-1 border-t border-[#3d494c]/20 transition-colors cursor-pointer"
                    >
                      <span>WEIGHT MATRIX &amp; ALTERNATIVES</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="flex flex-col gap-1 p-2 bg-[#0c0e12] rounded mt-1 font-mono text-[10px] text-[#869397] border border-[#232936]">
                        <div className="text-[#e2e2e8] font-semibold text-[11px] mb-0.5">OBJECTIVE VECTOR WEIGHTS:</div>
                        <div className="flex justify-between">
                          <span>Severity Weight (W_sev):</span>
                          <span className="text-[#4cd7f6] font-mono">{dec.weights.wSev.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transit Penalty (W_time):</span>
                          <span className="text-[#4cd7f6] font-mono">{dec.weights.wTime.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ICU Headroom (W_cap):</span>
                          <span className="text-[#4cd7f6] font-mono">{dec.weights.wCap.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Specialty Match (W_spec):</span>
                          <span className="text-[#4cd7f6] font-mono">{dec.weights.wSpec.toFixed(2)}</span>
                        </div>
                        {dec.rejectedAlternatives && dec.rejectedAlternatives.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-[#3d494c]/30 text-[#bcc9cd]">
                            <span>Rejected Option:</span> {dec.rejectedAlternatives[0].entityName} (
                            {dec.rejectedAlternatives[0].reason})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 003: Operational Editorial Workstream Section */}
      <div className="px-4 py-3 bg-[#0c0e12] border-t border-[#232936]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div
            onClick={() => setActiveTelemetryNote('Node Topo: Direct mesh synchronization active between 8 municipal hospitals with 99.98% packet delivery.')}
            className="p-3 bg-[#1e2024] rounded flex flex-col justify-between border border-[#232936]/40 cursor-pointer hover:border-[#4cd7f6]/50 transition"
          >
            <div>
              <span className="font-mono text-[10px] text-[#869397]">001 / NETWORK TOPO</span>
              <div className="font-sans text-[15px] text-[#e2e2e8] font-semibold mt-1">Node Latency</div>
              <p className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">Cross-mesh dynamic ping between Sion, KEM, and Hinduja nodes.</p>
            </div>
            <div className="mt-2 font-mono text-[11px] text-[#4cd7f6] font-medium">99.98% UPTIME</div>
          </div>

          <div
            onClick={() => setActiveTelemetryNote('Hydrology Model: Mithi river runoff rate +14mm/hr. Low underpasses at Hindmata and Kurla West flagged.')}
            className="p-3 bg-[#1e2024] rounded flex flex-col justify-between border border-[#232936]/40 cursor-pointer hover:border-[#4edea3]/50 transition"
          >
            <div>
              <span className="font-mono text-[10px] text-[#869397]">002 / FLOOD MODEL</span>
              <div className="font-sans text-[15px] text-[#e2e2e8] font-semibold mt-1">Mithi Hydrology</div>
              <p className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">Runoff intake telemetry coupled with Doppler precipitation feed.</p>
            </div>
            <div className="mt-2 font-mono text-[11px] text-[#4edea3] font-medium">+14mm/HR RAIN</div>
          </div>

          <div
            onClick={() => setActiveTelemetryNote('START Protocol: Simple Triage and Rapid Treatment with zero-bias allocation algorithm Rev 4.2 compliant.')}
            className="p-3 bg-[#1e2024] rounded flex flex-col justify-between border border-[#232936]/40 cursor-pointer hover:border-[#3d494c] transition"
          >
            <div>
              <span className="font-mono text-[10px] text-[#869397]">003 / TRIAGE CRITERIA</span>
              <div className="font-sans text-[15px] text-[#e2e2e8] font-semibold mt-1">START Protocol</div>
              <p className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">Simple Triage and Rapid Treatment with zero-bias allocation weights.</p>
            </div>
            <div className="mt-2 font-mono text-[11px] text-[#e2e2e8] font-medium">REV 4.2 COMPLIANT</div>
          </div>

          <div
            onClick={() => setActiveDirective('resource-and-ledger')}
            className="p-3 bg-[#1e2024] rounded flex flex-col justify-between border border-[#232936]/40 cursor-pointer hover:border-[#4edea3]/50 transition"
          >
            <div>
              <span className="font-mono text-[10px] text-[#869397]">004 / CRYPTO SETTLE</span>
              <div className="font-sans text-[15px] text-[#e2e2e8] font-semibold mt-1">Micro-Disbursement</div>
              <p className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">Instant fuel &amp; medical gas voucher release on GPS milestone trigger.</p>
            </div>
            <div className="mt-2 font-mono text-[11px] text-[#4edea3] font-medium">TX CONFIRMED: 0.04s</div>
          </div>
        </div>
      </div>

      {/* BOTTOM REALTIME LEDGER TICKER */}
      <div
        onClick={() => setActiveDirective('resource-and-ledger')}
        className="px-4 py-1.5 bg-[#282a2e] hover:bg-[#333539] flex flex-wrap items-center justify-between text-[#869397] font-mono text-[11px] border-t border-[#3d494c]/30 cursor-pointer transition"
        title="Click to view Cryptographic Ledger Explorer"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#4edea3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="font-bold">BLOCK #{ledger[ledger.length - 1]?.index || 429} MINED</span>
          </span>
          <span className="font-mono text-[#bcc9cd] truncate max-w-xs">{ledger[ledger.length - 1]?.blockHash}</span>
          <span className="hidden sm:inline text-[#3d494c]">|</span>
          <span className="hidden sm:inline text-[#e2e2e8]">
            {ledger[ledger.length - 1]?.transactions?.length || 3} allocations cryptographic state verified
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className="text-[#4cd7f6] font-medium">GAS: 14 GWEI</span>
          <span className="text-[#e2e2e8]">LATENCY: 0.04s</span>
        </div>
      </div>
    </div>
  );
};
