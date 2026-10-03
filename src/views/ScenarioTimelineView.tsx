import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

export const ScenarioTimelineView: React.FC = () => {
  const { hospitals, ambulances, clusters, depots } = useSimulation();

  const [scrubberMinute, setScrubberMinute] = useState<number>(27);
  const [isPlayingScrubber, setIsPlayingScrubber] = useState<boolean>(false);

  // Auto-play scrubber timer
  useEffect(() => {
    if (!isPlayingScrubber) return;
    const interval = setInterval(() => {
      setScrubberMinute(m => {
        if (m >= 60) {
          setIsPlayingScrubber(false);
          return 60;
        }
        return m + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isPlayingScrubber]);

  // Timeline events
  const timelineMilestones = [
    { minute: 0, title: 'T+00m: Heavy Precipitation Influx', desc: 'Monsoon rainfall crosses 45mm/hr in Kurla-Sion basin.' },
    { minute: 8, title: 'T+08m: Initial Ambulance Sorties Dispatched', desc: 'Central Fleet Reserve mobilizes 12 emergency vehicles.' },
    { minute: 15, title: 'T+15m: Hindmata Underpass Flooded (95cm)', desc: 'Road R-08 blocked. A* heuristic forces diversion via Dadar flyovers.' },
    { minute: 20, title: 'T+20m: Kurla Transit Hub Flood Wall Breach', desc: 'Cluster #24 water ingress rate reaches 1.2m depth. 6 critical cases queued.' },
    { minute: 27, title: 'T+27m: Lilavati ICU Saturation Cascade', desc: '100% capacity reached. 5 inbound transports reallocated to KEM & Hinduja.' },
    { minute: 40, title: 'T+40m: Anti-Starvation Preemption Invoked', desc: 'Peripheral clusters in Dharavi & Byculla receive priority boost.' },
    { minute: 55, title: 'T+55m: Emergency Drone Blood Delivery Confirmed', desc: 'O- whole blood delivered from Depot-1 to Sion Trauma on-chain.' },
  ];

  // Active milestone for current scrubber minute
  const currentMilestone = timelineMilestones
    .slice()
    .reverse()
    .find(m => scrubberMinute >= m.minute) || timelineMilestones[0];

  return (
    <div className="flex flex-col w-full text-[#e2e2e8] p-6 lg:p-8 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#232936]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-widest">
              003 // SCENARIO TIMELINE &amp; REPLAY VISUALIZER
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#869397]"></span>
            <span className="font-mono text-[10px] text-[#869397] uppercase">DYNAMIC FLOW MATRIX</span>
          </div>
          <h1 className="font-sans text-[26px] text-[#e2e2e8] font-semibold tracking-tight">
            Disaster Event Timeline &amp; Allocation Replay
          </h1>
          <p className="font-sans text-[13px] text-[#bcc9cd] max-w-3xl leading-relaxed">
            Scrub through simulation history to analyze how real-time anomalies (road blockages, hospital saturation, patient surges) forced global re-optimization.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-[#1a1c20] p-2 rounded border border-[#232936]">
          <span className="text-[#869397]">CURRENT SCRUB:</span>
          <span className="text-[#4cd7f6] font-bold text-[14px]">T+{scrubberMinute}m</span>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Bar */}
      <div className="bg-[#1a1c20] p-5 rounded-lg flex flex-col gap-3 border border-[#232936]">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingScrubber(!isPlayingScrubber)}
              className="px-3 py-1 bg-[#4cd7f6] text-[#003640] rounded font-semibold flex items-center gap-1 hover:bg-[#acedff] transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPlayingScrubber ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlayingScrubber ? 'Pause Replay' : 'Play Timeline'}</span>
            </button>
            <button
              onClick={() => setScrubberMinute(0)}
              className="px-2.5 py-1 bg-[#282a2e] text-[#bcc9cd] rounded hover:text-[#e2e2e8] transition"
            >
              Rewind T+00
            </button>
            <span className="text-[#869397] text-[10px]">SCRUB TIMELINE: 0 TO 60 MINUTES</span>
          </div>
          <span className="text-[#4edea3] font-bold">EVENT TICKS SYNCHRONIZED</span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="60"
          value={scrubberMinute}
          onChange={(e) => setScrubberMinute(Number(e.target.value))}
          className="w-full accent-[#4cd7f6] cursor-pointer bg-[#282a2e] h-2.5 rounded appearance-none"
        />

        {/* Current Scrubbed Event Card */}
        <div className="p-3 bg-[#0c0e12] rounded border border-[#4cd7f6]/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">
              ACTIVE TIMELINE INCIDENT ({currentMilestone.title})
            </span>
            <span className="font-sans text-[12px] text-[#e2e2e8] mt-0.5">
              {currentMilestone.desc}
            </span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3]">
            SYNCHRONIZED
          </span>
        </div>

        {/* Milestone Marks */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {timelineMilestones.map((m) => {
            const isPassed = scrubberMinute >= m.minute;
            return (
              <button
                key={m.minute}
                onClick={() => setScrubberMinute(m.minute)}
                className={`p-2 rounded text-left transition-all border cursor-pointer ${
                  isPassed
                    ? 'bg-[#1e2024] border-[#4cd7f6]/60 text-[#e2e2e8]'
                    : 'bg-[#111317] border-[#232936] text-[#869397] opacity-60'
                }`}
              >
                <div className="font-mono text-[10px] text-[#4cd7f6] font-semibold">T+{m.minute}m</div>
                <div className="font-sans text-[11px] font-medium truncate mt-0.5">{m.title.split(':')[1]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sankey / Multi-Stage Flow Diagram */}
      <div className="bg-[#1a1c20] p-5 rounded-lg flex flex-col gap-4 border border-[#232936]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">RESOURCE SANKEY FLOW</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#869397]"></span>
            <h3 className="font-sans text-[17px] text-[#e2e2e8] font-semibold">
              Live Allocation Flow Network
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#4edea3]">CONVERGED EQUILIBRIUM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Column 1: Depots (Supplies) */}
          <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
            <div className="flex items-center justify-between border-b border-[#232936] pb-2">
              <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">1. RELIEF DEPOTS (6)</span>
              <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">warehouse</span>
            </div>
            <div className="flex flex-col gap-2">
              {depots.slice(0, 4).map((d) => (
                <div key={d.id} className="p-2.5 bg-[#0c0e12] rounded border border-[#232936]">
                  <div className="font-mono text-[11px] text-[#e2e2e8] font-semibold">{d.name.split('(')[0]}</div>
                  <div className="font-mono text-[10px] text-[#869397] mt-1 flex justify-between">
                    <span>O- Blood: {d.inventory.bloodUnitsO_Neg}U</span>
                    <span className="text-[#4edea3]">{d.activeCouriers} Couriers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Ambulances (Transport) */}
          <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
            <div className="flex items-center justify-between border-b border-[#232936] pb-2">
              <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">2. FLEET UNITS (15)</span>
              <span className="material-symbols-outlined text-[16px] text-[#4edea3]">ambulance</span>
            </div>
            <div className="flex flex-col gap-2">
              {ambulances.slice(0, 4).map((a) => (
                <div key={a.id} className="p-2.5 bg-[#0c0e12] rounded border border-[#232936]">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#4edea3] font-bold">{a.callsign} ({a.type})</span>
                    <span className="text-[#869397]">{a.speedKmh} km/h</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#bcc9cd] mt-1 truncate">
                    {a.status === 'en_route_hospital' ? `En route ${a.targetHospitalId?.replace('hosp-', '')}` : 'Assigned to Cluster'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Patient Clusters (Demand) */}
          <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
            <div className="flex items-center justify-between border-b border-[#232936] pb-2">
              <span className="font-mono text-[10px] text-[#ff817a] uppercase font-bold">3. PATIENT CLUSTERS</span>
              <span className="material-symbols-outlined text-[16px] text-[#ff817a]">groups</span>
            </div>
            <div className="flex flex-col gap-2">
              {clusters.slice(0, 4).map((c) => (
                <div key={c.id} className="p-2.5 bg-[#0c0e12] rounded border border-[#232936]">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#e2e2e8] font-bold">{c.name.split('(')[0]}</span>
                    <span className="text-[#ffb4ab]">P{c.severity}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#869397] mt-1 flex justify-between">
                    <span>{c.patientCount} patients</span>
                    <span>Flood: {c.floodDepthCm}cm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Hospitals (Care & ICU) */}
          <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
            <div className="flex items-center justify-between border-b border-[#232936] pb-2">
              <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">4. DESTINATION HOSPITALS</span>
              <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">local_hospital</span>
            </div>
            <div className="flex flex-col gap-2">
              {hospitals.slice(0, 4).map((h) => (
                <div key={h.id} className="p-2.5 bg-[#0c0e12] rounded border border-[#232936]">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#4cd7f6] font-bold">{h.shortName}</span>
                    <span className={h.icuBedsFree === 0 ? 'text-[#ff817a]' : 'text-[#4edea3]'}>
                      ICU: {h.icuBedsFree}/{h.icuBedsTotal}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#869397] mt-1 truncate">
                    {h.specialties[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Snapshot Comparator */}
      <div className="bg-[#1a1c20] p-5 rounded-lg flex flex-col gap-4 border border-[#232936]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#869397]">COMPARATIVE REASONING</span>
          <h3 className="font-sans text-[17px] text-[#e2e2e8] font-semibold">
            Before vs. After Anomaly Re-allocation Snapshot
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0c0e12] rounded border border-[#ff817a]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#ff817a]">
              <span>BEFORE: ANOMALY OCCURRENCE</span>
              <span>T+26m</span>
            </div>
            <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
              Lilavati Hospital ICU operating at 100% capacity; S.V. Road submerged by 85cm flood water. Inbound Ambulance AMB-07 headed directly toward full facility with estimated triage queue delay of 45 minutes, reducing survival probability to 48%.
            </p>
          </div>

          <div className="p-4 bg-[#0c0e12] rounded border border-[#4edea3]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#4edea3]">
              <span>AFTER: DYNAMIC A* RE-ALLOCATION</span>
              <span>T+27m</span>
            </div>
            <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
              Engine autonomously triggers bipartite re-matching. AMB-07 redirected to KEM Hospital (+3.8 min transit via flyover bypass). Calculated survival probability jumps from 48% to 94.2%. Zero hospital overload generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
