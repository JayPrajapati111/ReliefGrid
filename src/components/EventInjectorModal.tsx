import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export const EventInjectorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { injectEvent } = useSimulation();

  if (!isOpen) return null;

  const handleInject = (type: string) => {
    injectEvent(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1a1c20] border border-[#232936] rounded-xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[22px]">bolt</span>
            <span className="font-mono text-[14px] text-[#e2e2e8] font-bold uppercase tracking-wider">
              EMERGENCY EVENT INJECTOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#869397] hover:text-[#e2e2e8] font-mono text-sm p-1 rounded hover:bg-[#282a2e] transition"
          >
            ✕
          </button>
        </div>

        <p className="font-sans text-[13px] text-[#bcc9cd] leading-relaxed">
          Inject real-time disaster anomalies to observe deterministic Hungarian bipartite re-optimization and explainability traces across the network.
        </p>

        <div className="grid grid-cols-1 gap-2 mt-1">
          <button
            onClick={() => handleInject('road_block')}
            className="p-3 bg-[#1e2024] hover:bg-[#282a2e] rounded text-left border border-[#232936] flex items-start gap-3 transition group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#ff817a] text-[20px] mt-0.5 group-hover:scale-110 transition-transform">
              wrong_location
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold group-hover:text-[#4cd7f6] transition-colors">
                Road Blocked (Eastern Express Hwy)
              </span>
              <span className="font-sans text-[11px] text-[#869397]">
                Submerges key arterial; tests dynamic Dijkstra rerouting.
              </span>
            </div>
          </button>

          <button
            onClick={() => handleInject('hospital_saturation')}
            className="p-3 bg-[#1e2024] hover:bg-[#282a2e] rounded text-left border border-[#232936] flex items-start gap-3 transition group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#ffb3ad] text-[20px] mt-0.5 group-hover:scale-110 transition-transform">
              local_hospital
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold group-hover:text-[#4cd7f6] transition-colors">
                Hospital Saturation (Lilavati ICU Full)
              </span>
              <span className="font-sans text-[11px] text-[#869397]">
                Forces dynamic load balancing to KEM and Hinduja.
              </span>
            </div>
          </button>

          <button
            onClick={() => handleInject('ambulance_breakdown')}
            className="p-3 bg-[#1e2024] hover:bg-[#282a2e] rounded text-left border border-[#232936] flex items-start gap-3 transition group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#bcc9cd] text-[20px] mt-0.5 group-hover:scale-110 transition-transform">
              car_crash
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold group-hover:text-[#4cd7f6] transition-colors">
                Fleet Failure (AMB-04 Engine Stall)
              </span>
              <span className="font-sans text-[11px] text-[#869397]">
                Takes unit offline; reassigns victim to nearest active ALS vehicle.
              </span>
            </div>
          </button>

          <button
            onClick={() => handleInject('patient_surge')}
            className="p-3 bg-[#1e2024] hover:bg-[#282a2e] rounded text-left border border-[#232936] flex items-start gap-3 transition group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#ff817a] text-[20px] mt-0.5 group-hover:scale-110 transition-transform">
              groups
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold group-hover:text-[#4cd7f6] transition-colors">
                Mass Patient Surge (+22 Cases at Kurla)
              </span>
              <span className="font-sans text-[11px] text-[#869397]">
                Triggers triage escalation and reserve fleet mobilization.
              </span>
            </div>
          </button>

          <button
            onClick={() => handleInject('blood_shortage')}
            className="p-3 bg-[#1e2024] hover:bg-[#282a2e] rounded text-left border border-[#232936] flex items-start gap-3 transition group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#ff817a] text-[20px] mt-0.5 group-hover:scale-110 transition-transform">
              bloodtype
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold group-hover:text-[#4cd7f6] transition-colors">
                Blood Stock Depletion (Sion O- Stock Drops to 0)
              </span>
              <span className="font-sans text-[11px] text-[#869397]">
                Triggers drone supply rebalancing from Central Depot-1.
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
