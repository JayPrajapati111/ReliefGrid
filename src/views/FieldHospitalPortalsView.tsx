import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

export const FieldHospitalPortalsView: React.FC = () => {
  const {
    role,
    hospitals,
    ambulances,
    clusters,
    selectedAmbulanceId,
    setSelectedAmbulanceId,
    selectedHospitalId,
    setSelectedHospitalId,
    updateHospitalCapacity,
    confirmFieldDelivery,
    decisions
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'hospital' | 'field'>(role === 'field' ? 'field' : 'hospital');
  const [deliverySuccessMessage, setDeliverySuccessMessage] = useState<string | null>(null);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState<boolean>(false);

  // Sync tab with role if switched via operator role selector
  useEffect(() => {
    if (role === 'field') setActiveTab('field');
    if (role === 'hosp') setActiveTab('hospital');
  }, [role]);

  const curHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const curAmbulance = ambulances.find(a => a.id === selectedAmbulanceId) || ambulances[0];

  const handleDelivery = async () => {
    const targetClusterId = curAmbulance.targetClusterId || clusters.find(c => c.status !== 'evacuated')?.id || clusters[0].id;
    const targetHospitalId = curAmbulance.targetHospitalId || hospitals[0].id;

    setIsSubmittingDelivery(true);
    await confirmFieldDelivery(curAmbulance.id, targetClusterId, targetHospitalId);
    setIsSubmittingDelivery(false);
    setDeliverySuccessMessage(`Patient handover cryptographically signed and confirmed at ${hospitals.find(h => h.id === targetHospitalId)?.shortName || 'Trauma Bay'}!`);
    setTimeout(() => setDeliverySuccessMessage(null), 5000);
  };

  return (
    <div className="flex flex-col w-full text-[#e2e2e8] p-6 lg:p-8 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#232936]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-widest">
              005 // OPERATIONAL ROLE PORTALS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#869397]"></span>
            <span className="font-mono text-[10px] text-[#869397] uppercase">FIELD TELEMETRY &amp; TRIAGE</span>
          </div>
          <h1 className="font-sans text-[26px] text-[#e2e2e8] font-semibold tracking-tight">
            Hospital Staff &amp; Field Worker Portals
          </h1>
          <p className="font-sans text-[13px] text-[#bcc9cd] max-w-3xl leading-relaxed">
            Real-time interface for triage nurses and frontline paramedics. Updating bed capacity triggers instant global re-balancing; confirming delivery commits proof-of-care blocks to the chain.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#1a1c20] p-1 rounded border border-[#232936] font-mono text-[11px]">
          <button
            onClick={() => setActiveTab('hospital')}
            className={`px-4 py-1.5 rounded font-semibold transition cursor-pointer ${
              activeTab === 'hospital' ? 'bg-[#4cd7f6] text-[#003640]' : 'text-[#bcc9cd] hover:text-[#e2e2e8]'
            }`}
          >
            HOSPITAL STAFF PORTAL
          </button>
          <button
            onClick={() => setActiveTab('field')}
            className={`px-4 py-1.5 rounded font-semibold transition cursor-pointer ${
              activeTab === 'field' ? 'bg-[#4cd7f6] text-[#003640]' : 'text-[#bcc9cd] hover:text-[#e2e2e8]'
            }`}
          >
            FIELD WORKER / AMBULANCE HUD
          </button>
        </div>
      </div>

      {deliverySuccessMessage && (
        <div className="p-3 bg-[#00a572]/20 border border-[#4edea3] text-[#4edea3] rounded font-mono text-[12px] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{deliverySuccessMessage}</span>
          </div>
          <span className="text-[10px]">LEDGER BLOCK COMMITTED</span>
        </div>
      )}

      {/* HOSPITAL STAFF VIEW */}
      {activeTab === 'hospital' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hospital Selector List (4 cols) */}
          <div className="lg:col-span-4 bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-3 border border-[#232936]">
            <span className="font-mono text-[10px] text-[#869397] uppercase font-bold">SELECT FACILITY CONSOLE</span>
            <div className="flex flex-col gap-2">
              {hospitals.map((h) => {
                const isSelected = selectedHospitalId === h.id;
                const isFull = h.icuBedsFree === 0;

                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHospitalId(h.id)}
                    className={`p-3 rounded text-left transition-all border flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#282a2e] border-[#4cd7f6] text-[#e2e2e8]'
                        : 'bg-[#1e2024] border-[#232936] text-[#bcc9cd] hover:border-[#3d494c]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[12px]">
                      <span className="font-bold text-[#e2e2e8]">{h.shortName}</span>
                      <span className={`font-mono text-[10px] font-bold ${isFull ? 'text-[#ff817a]' : 'text-[#4edea3]'}`}>
                        {isFull ? '[SATURATED]' : 'ONLINE'}
                      </span>
                    </div>
                    <span className="font-sans text-[11px] truncate text-[#869397]">{h.name}</span>
                    <div className="flex justify-between font-mono text-[10px] text-[#869397] mt-1 pt-1 border-t border-[#3d494c]/20">
                      <span>ICU: {h.icuBedsFree}/{h.icuBedsTotal} FREE</span>
                      <span>O- Blood: {h.bloodStockUnits['O-']}U</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hospital Live Capacity Controller (8 cols) */}
          <div className="lg:col-span-8 bg-[#1a1c20] rounded-lg p-6 flex flex-col gap-5 border border-[#232936]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#232936]">
              <div>
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">FACILITY TELEMETRY TERMINAL</span>
                <h3 className="font-sans text-[20px] text-[#e2e2e8] font-bold">{curHospital.name}</h3>
                <span className="font-mono text-[11px] text-[#869397]">{curHospital.address}</span>
              </div>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#282a2e] text-[#4edea3] self-start border border-[#3d494c]/30">
                ACTIVE TRIAGE LINK
              </span>
            </div>

            <p className="font-sans text-[13px] text-[#bcc9cd]">
              Changes made here immediately re-weight the global Hungarian solver. Decreasing ICU beds to 0 will cascade inbound ambulances to alternate facilities.
            </p>

            {/* Sliders for Beds and Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ICU Beds Free */}
              <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[11px] text-[#869397]">FREE ICU BEDS</span>
                  <span className={`text-[18px] font-bold ${curHospital.icuBedsFree === 0 ? 'text-[#ff817a]' : 'text-[#4cd7f6]'}`}>
                    {curHospital.icuBedsFree} / {curHospital.icuBedsTotal}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={curHospital.icuBedsTotal}
                  value={curHospital.icuBedsFree}
                  onChange={(e) => updateHospitalCapacity(curHospital.id, { icuBedsFree: Number(e.target.value) })}
                  className="w-full accent-[#4cd7f6] cursor-pointer bg-[#282a2e] h-2 rounded appearance-none"
                />
                <button
                  onClick={() => updateHospitalCapacity(curHospital.id, { icuBedsFree: 0, status: 'saturated' })}
                  className="text-left font-mono text-[10px] text-[#ff817a] hover:underline cursor-pointer"
                >
                  Mark 100% Saturated (0 Free)
                </button>
              </div>

              {/* General Beds Free */}
              <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[11px] text-[#869397]">GENERAL BEDS FREE</span>
                  <span className="text-[18px] font-bold text-[#4edea3]">
                    {curHospital.generalBedsFree} / {curHospital.generalBedsTotal}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={curHospital.generalBedsTotal}
                  value={curHospital.generalBedsFree}
                  onChange={(e) => updateHospitalCapacity(curHospital.id, { generalBedsFree: Number(e.target.value) })}
                  className="w-full accent-[#4edea3] cursor-pointer bg-[#282a2e] h-2 rounded appearance-none"
                />
                <span className="font-mono text-[10px] text-[#869397]">General admission ward</span>
              </div>

              {/* O- Blood Units */}
              <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-3 border border-[#232936]/40">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[11px] text-[#869397]">O- NEG BLOOD UNITS</span>
                  <span className={`text-[18px] font-bold ${curHospital.bloodStockUnits['O-'] === 0 ? 'text-[#ff817a]' : 'text-[#ffb3ad]'}`}>
                    {curHospital.bloodStockUnits['O-']} Units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={curHospital.bloodStockUnits['O-']}
                  onChange={(e) =>
                    updateHospitalCapacity(curHospital.id, {
                      bloodStockUnits: { ...curHospital.bloodStockUnits, 'O-': Number(e.target.value) }
                    })
                  }
                  className="w-full accent-[#ff817a] cursor-pointer bg-[#282a2e] h-2 rounded appearance-none"
                />
                <span className="font-mono text-[10px] text-[#869397]">Critical universal plasma</span>
              </div>
            </div>

            {/* Specialties & Capabilities Display */}
            <div className="bg-[#1e2024] p-4 rounded flex flex-col gap-2 border border-[#232936]/40">
              <span className="font-mono text-[10px] text-[#869397] uppercase">ACTIVE ON-CALL SPECIALTIES</span>
              <div className="flex flex-wrap gap-2">
                {curHospital.specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#282a2e] text-[#4cd7f6] font-mono text-[11px] rounded border border-[#3d494c]/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIELD WORKER / AMBULANCE HUD */}
      {activeTab === 'field' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ambulance Selector (4 cols) */}
          <div className="lg:col-span-4 bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-3 border border-[#232936]">
            <span className="font-mono text-[10px] text-[#869397] uppercase font-bold">ACTIVE MOBILE FLEET UNITS</span>
            <div className="flex flex-col gap-2">
              {ambulances.map((a) => {
                const isSelected = selectedAmbulanceId === a.id;
                const isALS = a.type === 'ALS';

                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAmbulanceId(a.id)}
                    className={`p-3 rounded text-left transition-all border flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#282a2e] border-[#4cd7f6] text-[#e2e2e8]'
                        : 'bg-[#1e2024] border-[#232936] text-[#bcc9cd] hover:border-[#3d494c]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[12px]">
                      <span className="font-bold text-[#e2e2e8]">{a.callsign}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${isALS ? 'bg-[#003640] text-[#4cd7f6]' : 'bg-[#003824] text-[#4edea3]'}`}>
                        {a.type}
                      </span>
                    </div>
                    <span className="font-sans text-[11px] text-[#869397]">
                      Status: {a.status.replace('_', ' ')}
                    </span>
                    <div className="flex justify-between font-mono text-[10px] text-[#869397] mt-1 pt-1 border-t border-[#3d494c]/20">
                      <span>Battery: {a.batteryPercent}%</span>
                      <span>Speed: {a.speedKmh} km/h</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Mission HUD Card (8 cols) */}
          <div className="lg:col-span-8 bg-[#1a1c20] rounded-lg p-6 flex flex-col gap-5 border border-[#232936]">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">PARAMEDIC TACTICAL TERMINAL</span>
                <h3 className="font-sans text-[20px] text-[#e2e2e8] font-bold">
                  {curAmbulance.callsign} ({curAmbulance.type} Life Support)
                </h3>
              </div>
              <span className="font-mono text-[11px] px-3 py-1 rounded bg-[#003640] text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold">
                GPS SYNC ACTIVE
              </span>
            </div>

            {/* Mission Details Box */}
            <div className="bg-[#1e2024] p-5 rounded-lg border border-[#232936]/60 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#4cd7f6] font-bold uppercase tracking-wider">
                  CURRENT DISPATCH ASSIGNMENT
                </span>
                <span className="font-mono text-[11px] text-[#e2e2e8]">
                  ETA: <strong className="text-[#4edea3]">{curAmbulance.etaMinutes || 4} MINS</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0c0e12] p-3 rounded border border-[#232936] flex flex-col gap-1">
                  <span className="font-mono text-[9px] text-[#869397] uppercase">PICKUP CLUSTER</span>
                  <span className="font-sans text-[14px] text-[#e2e2e8] font-semibold">
                    {clusters.find(c => c.id === curAmbulance.targetClusterId)?.name || 'Cluster #24 (Kurla Hub)'}
                  </span>
                  <span className="font-mono text-[11px] text-[#ff817a]">
                    Severity: Urgent Triage 5.0 (ALS Required)
                  </span>
                </div>

                <div className="bg-[#0c0e12] p-3 rounded border border-[#232936] flex flex-col gap-1">
                  <span className="font-mono text-[9px] text-[#869397] uppercase">DESTINATION HOSPITAL</span>
                  <span className="font-sans text-[14px] text-[#e2e2e8] font-semibold">
                    {hospitals.find(h => h.id === curAmbulance.targetHospitalId)?.name || 'KEM Hospital & Research Centre'}
                  </span>
                  <span className="font-mono text-[11px] text-[#4edea3]">
                    Emergency Trauma Bay Reserved
                  </span>
                </div>
              </div>

              {/* Turn-by-Turn Instruction */}
              <div className="p-3 bg-[#0c0e12] rounded border border-[#3d494c]/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[20px] mt-0.5">navigation</span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#e2e2e8] font-semibold">
                    ROUTING ADVISORY (A* DYNAMIC ENGINE)
                  </span>
                  <span className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">
                    Avoid S.V. Road &amp; Hindmata Underpass due to flash flooding (&gt;80cm). Proceed via elevated Western Express Flyover to Parel corridor.
                  </span>
                </div>
              </div>
            </div>

            {/* Field Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDelivery}
                disabled={isSubmittingDelivery}
                className="flex-1 py-3 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] rounded font-mono text-[12px] font-bold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(78,222,163,0.35)] transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>
                  {isSubmittingDelivery
                    ? 'Writing Cryptographic Receipt to Ledger...'
                    : 'Confirm Patient Delivery at Hospital (Signs Ledger)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
