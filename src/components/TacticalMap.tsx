import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

export const TacticalMap: React.FC = () => {
  const {
    hospitals,
    ambulances,
    clusters,
    depots,
    roads,
    selectedAmbulanceId,
    setSelectedAmbulanceId,
    selectedHospitalId,
    setSelectedHospitalId,
    selectedClusterId,
    setSelectedClusterId,
    selectedRoadId,
    setSelectedRoadId,
    updateHospitalCapacity,
    toggleRoadStatus,
    setActiveDirective,
    isNaiveMode,
    toggleNaiveMode,
  } = useSimulation();

  const [activeLayer, setActiveLayer] = useState<'all' | 'hospitals' | 'ambulances' | 'hazards'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeInspectorType, setActiveInspectorType] = useState<'hospital' | 'ambulance' | 'cluster' | 'road' | null>(null);

  // Map geographic bounding box (Mumbai Zone 4) to SVG 800x520 coordinates
  const minLat = 18.93;
  const maxLat = 19.11;
  const minLng = 72.81;
  const maxLng = 72.90;

  const geoToSvg = (lat: number, lng: number) => {
    const normX = (lng - minLng) / (maxLng - minLng);
    const normY = 1 - (lat - minLat) / (maxLat - minLat);
    const x = Math.round(50 + normX * 700);
    const y = Math.round(40 + normY * 440);
    return { x, y };
  };

  const showHospitals = activeLayer === 'all' || activeLayer === 'hospitals';
  const showAmbulances = activeLayer === 'all' || activeLayer === 'ambulances';
  const showHazards = activeLayer === 'all' || activeLayer === 'hazards';

  const inspectHospital = hospitals.find(h => h.id === selectedHospitalId);
  const inspectAmbulance = ambulances.find(a => a.id === selectedAmbulanceId);
  const inspectCluster = clusters.find(c => c.id === selectedClusterId);
  const inspectRoad = roads.find(r => r.id === selectedRoadId);

  return (
    <div className="bg-[#1a1c20] rounded p-4 flex flex-col flex-1 relative overflow-hidden border border-[#232936]">
      {/* HUD Header Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#232936] z-10 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-[#e2e2e8] font-bold uppercase tracking-wider">
            MUMBAI SECTOR 4 TELEMETRY CANVAS
          </span>
          <span className="px-2 py-0.5 rounded bg-[#282a2e] text-[#869397] font-mono text-[10px] border border-[#3d494c]/30">
            1:25000 VECTOR GRID
          </span>
          {isNaiveMode && (
            <span className="px-2 py-0.5 rounded bg-[#93000a]/30 border border-[#ff817a] text-[#ffdad6] font-mono text-[10px] animate-pulse">
              NAIVE FCFS SIMULATION ACTIVE
            </span>
          )}
        </div>

        {/* Map Filter Layer Toggles & Naive Mode Switch */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={toggleNaiveMode}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
              isNaiveMode
                ? 'bg-[#ff817a] text-[#68000a] border-[#ff817a]'
                : 'bg-[#282a2e] text-[#bcc9cd] border-[#3d494c]/40 hover:text-[#4cd7f6]'
            }`}
            title="Toggle between ReliefGrid Smart Bipartite optimization vs Naive FCFS nearest-hospital dispatch"
          >
            {isNaiveMode ? 'NAIVE (FCFS)' : 'SMART (A*)'}
          </button>

          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              activeLayer === 'all' ? 'bg-[#4cd7f6] text-[#003640]' : 'bg-[#282a2e] text-[#bcc9cd] hover:text-[#e2e2e8]'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setActiveLayer('hospitals')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              activeLayer === 'hospitals' ? 'bg-[#4cd7f6] text-[#003640]' : 'bg-[#282a2e] text-[#bcc9cd] hover:text-[#e2e2e8]'
            }`}
          >
            HOSPITALS
          </button>
          <button
            onClick={() => setActiveLayer('ambulances')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              activeLayer === 'ambulances' ? 'bg-[#4cd7f6] text-[#003640]' : 'bg-[#282a2e] text-[#bcc9cd] hover:text-[#e2e2e8]'
            }`}
          >
            AMBULANCES
          </button>
          <button
            onClick={() => setActiveLayer('hazards')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              activeLayer === 'hazards' ? 'bg-[#4cd7f6] text-[#003640]' : 'bg-[#282a2e] text-[#bcc9cd] hover:text-[#e2e2e8]'
            }`}
          >
            HAZARDS
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div className="relative w-full h-[520px] bg-[#0c0e12] rounded mt-3 overflow-hidden flex items-center justify-center select-none border border-[#232936]">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#232936" strokeWidth="0.75" />
              <circle cx="0" cy="0" r="1" fill="#4cd7f6" opacity="0.25" />
            </pattern>
            {/* Glow Filters */}
            <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#tacticalGrid)" />

          {/* Coastline / Mithi River Flood Channel Poly */}
          <path
            d="M -20 120 Q 150 180, 260 140 T 480 320 T 700 480 L 700 600 L -20 600 Z"
            fill="#003640"
            opacity="0.18"
          />
          <path
            d="M 120 40 Q 200 180, 310 260 T 420 540"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeDasharray="6,4"
            opacity="0.35"
          />

          {/* Flooded Zones (Polygons) */}
          {showHazards && (
            <>
              <polygon points="190,140 280,120 330,190 240,210" fill="#93000a" opacity="0.25" />
              <polygon points="340,280 430,260 480,340 390,360" fill="#93000a" opacity="0.22" />
            </>
          )}

          {/* Road Network Lines */}
          {roads.map((road) => {
            const from = geoToSvg(road.fromCoords.lat, road.fromCoords.lng);
            const to = geoToSvg(road.toCoords.lat, road.toCoords.lng);

            if (road.status === 'blocked') {
              return (
                <g
                  key={road.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedRoadId(road.id);
                    setActiveInspectorType('road');
                  }}
                >
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#ff817a"
                    strokeWidth="4"
                    strokeDasharray="8,5"
                    filter="url(#hazardGlow)"
                  />
                  <text
                    x={(from.x + to.x) / 2 - 40}
                    y={(from.y + to.y) / 2 - 8}
                    fill="#ffb4ab"
                    className="font-mono text-[9px] font-bold tracking-wider"
                  >
                    {road.name.split(' ')[0]} SUBMERGED [{road.floodDepthCm}cm]
                  </text>
                </g>
              );
            }

            if (road.status === 'congested') {
              return (
                <line
                  key={road.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                  opacity="0.8"
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedRoadId(road.id);
                    setActiveInspectorType('road');
                  }}
                />
              );
            }

            return (
              <line
                key={road.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#3d494c"
                strokeWidth="2"
                opacity="0.7"
                className="cursor-pointer hover:stroke-[#4cd7f6]"
                onClick={() => {
                  setSelectedRoadId(road.id);
                  setActiveInspectorType('road');
                }}
              />
            );
          })}

          {/* Dynamic A* Reroute Active Path Line */}
          <path
            d="M 140 280 L 180 220 L 240 100 L 390 120 L 490 220"
            fill="none"
            stroke={isNaiveMode ? '#ff817a' : '#4cd7f6'}
            strokeWidth="3"
            strokeDasharray={isNaiveMode ? '3,3' : '6,4'}
            className="animate-pulse"
            filter={isNaiveMode ? undefined : 'url(#cyanGlow)'}
          />

          {/* Relief Depots */}
          {depots.map((depot) => {
            const pos = geoToSvg(depot.location.lat, depot.location.lng);
            return (
              <g key={depot.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <polygon points="0,-12 10,6 -10,6" fill="#06b6d4" />
                <rect x="14" y="-8" width="120" height="18" fill="#111317" rx="2" stroke="#3d494c" strokeWidth="0.5" />
                <text x="20" y="5" fill="#acedff" className="font-mono text-[8px] font-medium">
                  {depot.name.slice(0, 18)}
                </text>
              </g>
            );
          })}

          {/* Hospitals */}
          {showHospitals &&
            hospitals.map((hosp) => {
              const pos = geoToSvg(hosp.location.lat, hosp.location.lng);
              const isSelected = selectedHospitalId === hosp.id;
              const isFull = hosp.icuBedsFree === 0;
              const isBusy = hosp.icuBedsFree <= 2;
              const ringColor = isFull ? '#ff817a' : isBusy ? '#f59e0b' : '#4edea3';

              return (
                <g
                  key={hosp.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    setSelectedHospitalId(hosp.id);
                    setActiveInspectorType('hospital');
                  }}
                >
                  <circle
                    r={isSelected ? 22 : 18}
                    fill={isFull ? '#93000a' : '#1a1c20'}
                    stroke={ringColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  {isBusy && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}
                  <text
                    y="4"
                    textAnchor="middle"
                    fill={isFull ? '#ffffff' : '#e2e2e8'}
                    className="font-mono text-[9px] font-bold"
                  >
                    {hosp.shortName}
                  </text>

                  {/* Hospital Telemetry Tag */}
                  <g transform="translate(24, -16)">
                    <rect
                      x="0"
                      y="0"
                      width="120"
                      height="32"
                      fill="#0c0e12"
                      opacity="0.92"
                      rx="2"
                      stroke={isFull ? '#93000a' : isSelected ? '#4cd7f6' : '#3d494c'}
                      strokeWidth="0.8"
                    />
                    <text x="6" y="12" fill={isFull ? '#ffb4ab' : '#e2e2e8'} className="font-mono text-[8px] font-bold">
                      {hosp.name.slice(0, 19)}
                    </text>
                    <text x="6" y="24" fill={ringColor} className="font-mono text-[8px]">
                      ICU: {hosp.icuBedsFree}/{hosp.icuBedsTotal} FREE {isFull ? '[SATURATED]' : ''}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Patient Clusters */}
          {clusters
            .filter((c) => c.status !== 'evacuated')
            .map((clust) => {
              const pos = geoToSvg(clust.location.lat, clust.location.lng);
              const isSelected = selectedClusterId === clust.id;
              const isCritical = clust.severity >= 4;
              const circleColor = clust.severity === 5 ? '#ffb4ab' : clust.severity >= 4 ? '#ff817a' : clust.severity === 3 ? '#f59e0b' : '#4edea3';

              return (
                <g
                  key={clust.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedClusterId(clust.id);
                    setActiveInspectorType('cluster');
                  }}
                >
                  {isCritical && (
                    <circle r="16" fill="#93000a" opacity="0.4" className="animate-ping" />
                  )}
                  <circle
                    r={clust.severity === 5 ? 11 : 9}
                    fill={clust.severity === 5 ? '#93000a' : '#1e2024'}
                    stroke={circleColor}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text y="3" textAnchor="middle" fill="#ffffff" className="font-mono text-[8px] font-bold">
                    #{clust.id.replace('clust-', '')}
                  </text>

                  {/* Cluster Tag */}
                  {(isCritical || isSelected) && (
                    <g transform="translate(14, -12)">
                      <rect
                        x="0"
                        y="0"
                        width="114"
                        height="26"
                        fill="#111317"
                        rx="2"
                        stroke={circleColor}
                        strokeWidth="0.8"
                      />
                      <text x="6" y="10" fill={circleColor} className="font-mono text-[7px] font-bold">
                        {clust.name.split('(')[0]} [{clust.patientCount} PTS]
                      </text>
                      <text x="6" y="20" fill="#e2e2e8" className="font-mono text-[7px]">
                        URGENCY {clust.severity}.0 ({clust.requiredCapability} REQ)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* Ambulances */}
          {showAmbulances &&
            ambulances.map((amb) => {
              const pos = geoToSvg(amb.location.lat, amb.location.lng);
              const isSelected = selectedAmbulanceId === amb.id;
              const isALS = amb.type === 'ALS';
              const isBroken = amb.status === 'breakdown';
              const ambColor = isBroken ? '#869397' : isALS ? '#4cd7f6' : '#4edea3';

              return (
                <g
                  key={amb.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => {
                    setSelectedAmbulanceId(amb.id);
                    setActiveInspectorType('ambulance');
                  }}
                >
                  <circle
                    r={isSelected ? 13 : 11}
                    fill={isBroken ? '#282a2e' : isALS ? '#003640' : '#003824'}
                    stroke={ambColor}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fill={ambColor}
                    className="font-mono text-[8px] font-bold"
                  >
                    {amb.callsign.replace('AMB-', 'A')}
                  </text>

                  <g transform="translate(16, -12)">
                    <rect
                      x="0"
                      y="0"
                      width="96"
                      height="24"
                      fill="#1a1c20"
                      rx="2"
                      stroke={isSelected ? '#4cd7f6' : '#3d494c'}
                      strokeWidth="0.6"
                    />
                    <text x="6" y="10" fill={ambColor} className="font-mono text-[8px] font-semibold">
                      {amb.callsign} ({amb.type})
                    </text>
                    <text x="6" y="20" fill="#e2e2e8" className="font-mono text-[7px]">
                      {isBroken ? 'ENGINE FAILURE' : amb.status === 'idle' ? 'IDLE STANDBY' : `ETA ${amb.etaMinutes}m → HOSP`}
                    </text>
                  </g>
                </g>
              );
            })}
        </svg>

        {/* Floating Interactive Inspector Panel (Appears on click of any node) */}
        {activeInspectorType && (
          <div className="absolute top-12 left-4 right-4 bg-[#1a1c20]/95 backdrop-blur-md p-3.5 rounded-lg border border-[#4cd7f6]/50 shadow-2xl z-20 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-[#232936] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold tracking-wider">
                  TELEMETRY INSPECTOR: {activeInspectorType.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              </div>
              <button
                onClick={() => setActiveInspectorType(null)}
                className="text-[#869397] hover:text-[#e2e2e8] font-mono text-xs px-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Hospital Detail Drawer */}
            {activeInspectorType === 'hospital' && inspectHospital && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] font-sans">
                <div className="flex flex-col">
                  <span className="font-bold text-[#e2e2e8]">{inspectHospital.name}</span>
                  <span className="text-[#869397] text-[11px] font-mono">
                    ICU: {inspectHospital.icuBedsFree}/{inspectHospital.icuBedsTotal} Free • General: {inspectHospital.generalBedsFree} Free • O- Blood: {inspectHospital.bloodStockUnits['O-']}U
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateHospitalCapacity(inspectHospital.id, { icuBedsFree: inspectHospital.icuBedsFree === 0 ? 5 : 0 })}
                    className="px-2.5 py-1 bg-[#282a2e] hover:bg-[#333539] text-[#ffb3ad] rounded font-mono text-[10px] border border-[#3d494c]/40 cursor-pointer"
                  >
                    {inspectHospital.icuBedsFree === 0 ? 'Restore 5 ICU Beds' : 'Simulate 100% Saturation'}
                  </button>
                  <button
                    onClick={() => setActiveDirective('field-and-hospital-portals')}
                    className="px-2.5 py-1 bg-[#4cd7f6] text-[#003640] rounded font-mono text-[10px] font-bold cursor-pointer"
                  >
                    Open Hospital Console →
                  </button>
                </div>
              </div>
            )}

            {/* Ambulance Detail Drawer */}
            {activeInspectorType === 'ambulance' && inspectAmbulance && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] font-sans">
                <div className="flex flex-col">
                  <span className="font-bold text-[#e2e2e8]">{inspectAmbulance.callsign} ({inspectAmbulance.type} Life Support)</span>
                  <span className="text-[#869397] text-[11px] font-mono">
                    Status: {inspectAmbulance.status} • Speed: {inspectAmbulance.speedKmh} km/h • Battery: {inspectAmbulance.batteryPercent}% • ETA: {inspectAmbulance.etaMinutes}m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDirective('field-and-hospital-portals')}
                    className="px-2.5 py-1 bg-[#4cd7f6] text-[#003640] rounded font-mono text-[10px] font-bold cursor-pointer"
                  >
                    Open Paramedic Mobile HUD →
                  </button>
                </div>
              </div>
            )}

            {/* Cluster Detail Drawer */}
            {activeInspectorType === 'cluster' && inspectCluster && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] font-sans">
                <div className="flex flex-col">
                  <span className="font-bold text-[#e2e2e8]">{inspectCluster.name}</span>
                  <span className="text-[#869397] text-[11px] font-mono">
                    Urgency: {inspectCluster.severity}.0 • Victims: {inspectCluster.patientCount} • Water Depth: {inspectCluster.floodDepthCm}cm • Required: {inspectCluster.requiredCapability}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4edea3] font-mono text-[10px]">
                    Assigned to {inspectCluster.assignedHospitalId?.replace('hosp-', '').toUpperCase() || 'KEM'}
                  </span>
                </div>
              </div>
            )}

            {/* Road Detail Drawer */}
            {activeInspectorType === 'road' && inspectRoad && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] font-sans">
                <div className="flex flex-col">
                  <span className="font-bold text-[#e2e2e8]">{inspectRoad.name}</span>
                  <span className="text-[#869397] text-[11px] font-mono">
                    Status: <strong className={inspectRoad.status === 'blocked' ? 'text-[#ff817a]' : 'text-[#4edea3]'}>{inspectRoad.status.toUpperCase()}</strong> • Water Depth: {inspectRoad.floodDepthCm}cm • Length: {inspectRoad.distanceKm}km
                  </span>
                </div>
                <button
                  onClick={() => toggleRoadStatus(inspectRoad.id)}
                  className={`px-3 py-1 rounded font-mono text-[10px] font-bold cursor-pointer ${
                    inspectRoad.status === 'blocked'
                      ? 'bg-[#4edea3] text-[#003824]'
                      : 'bg-[#ff817a] text-[#68000a]'
                  }`}
                >
                  {inspectRoad.status === 'blocked' ? 'Clear Flood & Open Road' : 'Submerge Road (Block Edge)'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Map HUD Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#282a2e]/90 backdrop-blur-md p-2.5 rounded font-mono text-[10px] flex flex-col gap-1 border border-[#3d494c]/40 shadow-lg pointer-events-none">
          <span className="text-[#869397] uppercase text-[9px] font-bold tracking-wider">
            LEGEND CLASSIFICATION
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></span>
            <span className="text-[#e2e2e8]">Urgency 5 Critical Cluster</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span>
            <span className="text-[#e2e2e8]">ALS Ambulance En Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
            <span className="text-[#e2e2e8]">Capacity &gt;30% Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#ff817a]"></span>
            <span className="text-[#e2e2e8]">Water Depth &gt; 35cm (Blocked)</span>
          </div>
        </div>

        {/* Zoom & Vector GPS Status Tag */}
        <div className="absolute top-3 right-3 bg-[#282a2e]/90 px-2 py-1 rounded font-mono text-[10px] text-[#869397] flex items-center gap-2 border border-[#3d494c]/30">
          <button
            onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
            className="hover:text-[#4cd7f6] px-1 cursor-pointer"
          >
            -
          </button>
          <span>ZOOM: {zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
            className="hover:text-[#4cd7f6] px-1 cursor-pointer"
          >
            +
          </button>
          <span>|</span>
          <button
            onClick={() => setZoomLevel(100)}
            className="hover:text-[#4cd7f6] text-[9px] underline cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Fleet & Resource Status Strip below Map */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-2 border-t border-[#232936]">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#869397]">FLEET TOTAL</span>
          <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold">{ambulances.length} AMBULANCES</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#869397]">ACTIVE IN TRANSIT</span>
          <span className="font-mono text-[12px] text-[#4cd7f6] font-semibold">
            {ambulances.filter((a) => a.status.includes('en_route')).length} ALS / BLS
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#869397]">ICU OCCUPANCY</span>
          <span className="font-mono text-[12px] text-[#ffb3ad] font-semibold">
            {(
              ((hospitals.reduce((acc, h) => acc + h.icuBedsTotal, 0) -
                hospitals.reduce((acc, h) => acc + h.icuBedsFree, 0)) /
                hospitals.reduce((acc, h) => acc + h.icuBedsTotal, 0)) *
              100
            ).toFixed(1)}
            % ({hospitals.reduce((acc, h) => acc + h.icuBedsTotal - h.icuBedsFree, 0)} /{' '}
            {hospitals.reduce((acc, h) => acc + h.icuBedsTotal, 0)})
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#869397]">ACTIVE FLOOD CHANNELS</span>
          <span className="font-mono text-[12px] text-[#ff817a] font-semibold">
            {roads.filter((r) => r.status === 'blocked').length} HAZARD EDGES
          </span>
        </div>
      </div>
    </div>
  );
};
