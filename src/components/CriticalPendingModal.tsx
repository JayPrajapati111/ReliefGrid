import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export const CriticalPendingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { clusters, ambulances, setSelectedClusterId, setSelectedAmbulanceId, setActiveDirective } = useSimulation();

  if (!isOpen) return null;

  const criticalClusters = clusters.filter(c => c.severity >= 4 && c.status !== 'evacuated');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#1a1c20] border border-[#ff817a]/50 rounded-xl max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff817a] text-[22px] animate-pulse">warning</span>
            <div className="flex flex-col">
              <span className="font-mono text-[13px] text-[#ffdad6] font-bold uppercase tracking-wider">
                CRITICAL TRIAGE QUEUE (URGENCY LEVEL 4 - 5)
              </span>
              <span className="font-sans text-[11px] text-[#869397]">
                Patients facing acute hypothermia, submersion risk, or severe trauma requiring immediate ALS evacuation.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#869397] hover:text-[#e2e2e8] font-mono text-sm p-1 rounded hover:bg-[#282a2e] transition"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
          {criticalClusters.length === 0 ? (
            <div className="p-6 text-center text-[#4edea3] font-mono text-xs bg-[#0c0e12] rounded border border-[#232936]">
              All critical patient clusters have been successfully evacuated or assigned.
            </div>
          ) : (
            criticalClusters.map(c => {
              const assignedAmb = ambulances.find(a => a.id === c.assignedAmbulanceId);
              return (
                <div
                  key={c.id}
                  className="p-3.5 bg-[#1e2024] rounded-lg border border-[#232936] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#ff817a]/50 transition"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[10px] font-bold">
                        SEVERITY {c.severity}.0
                      </span>
                      <span className="font-sans text-[13px] text-[#e2e2e8] font-bold">{c.name}</span>
                    </div>
                    <span className="font-sans text-[11px] text-[#bcc9cd]">{c.notes}</span>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-[#869397] mt-0.5">
                      <span>Victims: <strong className="text-[#e2e2e8]">{c.patientCount}</strong></span>
                      <span>Flood Depth: <strong className="text-[#ff817a]">{c.floodDepthCm}cm</strong></span>
                      <span>Wait Time: <strong className="text-[#f59e0b]">{c.waitingMinutes}m</strong></span>
                      <span>Required: <strong className="text-[#4cd7f6]">{c.requiredCapability}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        setSelectedClusterId(c.id);
                        if (c.assignedAmbulanceId) setSelectedAmbulanceId(c.assignedAmbulanceId);
                        setActiveDirective('command-center');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#282a2e] hover:bg-[#4cd7f6] hover:text-[#003640] rounded font-mono text-[11px] text-[#e2e2e8] transition cursor-pointer border border-[#3d494c]/40"
                    >
                      View on Vector Map
                    </button>
                    {assignedAmb && (
                      <span className="px-2 py-1 bg-[#003640] text-[#4cd7f6] rounded font-mono text-[10px] font-bold border border-[#4cd7f6]/40">
                        {assignedAmb.callsign} EN ROUTE
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-[#232936] flex justify-between items-center font-mono text-[10px] text-[#869397]">
          <span>TOTAL WAITING CRITICAL: {criticalClusters.length} CLUSTERS</span>
          <button
            onClick={() => {
              setActiveDirective('allocation-engine');
              onClose();
            }}
            className="text-[#4cd7f6] hover:underline"
          >
            Review Bipartite Multi-Objective Weights →
          </button>
        </div>
      </div>
    </div>
  );
};
