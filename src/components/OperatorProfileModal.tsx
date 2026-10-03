import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Role } from '../types';

export const OperatorProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { role, setRole, tick, ledger } = useSimulation();

  if (!isOpen) return null;

  const roleLabels: Record<Role, { title: string; desc: string; clearance: string }> = {
    cmd: {
      title: 'COMMAND CENTER / ADMIN',
      desc: 'Full read/write orchestration rights, event injection matrix, and algorithm hyperparameter configuration.',
      clearance: 'LEVEL-5 TACTICAL DIRECTIVE',
    },
    hosp: {
      title: 'HOSPITAL STAFF (TRIAGE NURSE)',
      desc: 'Facility bed census authority, ICU saturation alerts, and local blood inventory re-weighting.',
      clearance: 'LEVEL-3 CLINICAL HEADROOM',
    },
    field: {
      title: 'FIELD WORKER / AMBULANCE PARAMEDIC',
      desc: 'Mobile triage dispatch receipt, turn-by-turn route telemetry, and cryptographic handover signatures.',
      clearance: 'LEVEL-2 FRONTLINE LOGISTICS',
    },
    ngo: {
      title: 'NGO / DONOR OBSERVER',
      desc: 'Transparent grant tracking, procurement verification, and downstream medical supply audits.',
      clearance: 'LEVEL-1 PUBLIC ESCROW PROVENANCE',
    },
    audit: {
      title: 'PUBLIC AUDITOR (LEDGER VERIFIER)',
      desc: 'Read-only Merkle state verification, Web Crypto SHA-256 integrity diagnostics, and zero-knowledge proof audits.',
      clearance: 'READ-ONLY STATUTORY LEDGER',
    },
  };

  const cur = roleLabels[role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#1a1c20] border border-[#232936] rounded-xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4cd7f6] text-[#003640] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[13px] text-[#e2e2e8] font-bold uppercase tracking-wider">
                OPERATOR CREDENTIALS
              </span>
              <span className="font-mono text-[10px] text-[#4edea3]">AUTHENTICATED • BMC SECTOR-4</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#869397] hover:text-[#e2e2e8] font-mono text-sm p-1 rounded hover:bg-[#282a2e] transition"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 font-mono text-[11px]">
          <div className="bg-[#0c0e12] p-3 rounded border border-[#232936] flex flex-col gap-1">
            <span className="text-[#869397] text-[9px] uppercase">ACTIVE OPERATOR ROLE</span>
            <span className="text-[#4cd7f6] font-bold text-[13px]">{cur.title}</span>
            <span className="font-sans text-[11px] text-[#bcc9cd] mt-0.5">{cur.desc}</span>
            <span className="text-[#4edea3] text-[10px] mt-1 pt-1 border-t border-[#3d494c]/20 font-bold">
              {cur.clearance}
            </span>
          </div>

          <div className="bg-[#0c0e12] p-3 rounded border border-[#232936] flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-[#869397]">OPERATOR UID:</span>
              <span className="text-[#e2e2e8]">OP-MUM-89240</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">SESSION LATENCY:</span>
              <span className="text-[#4edea3]">38ms (Web Crypto Optimal)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">SIMULATION TICK:</span>
              <span className="text-[#e2e2e8]">#{tick}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">CRYPTOGRAPHIC ANCHOR:</span>
              <span className="text-[#4cd7f6]">#{ledger[ledger.length - 1]?.index} (Polygon-ZK)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#869397] text-[10px] uppercase">SWITCH ROLE CREDENTIAL</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="p-2 bg-[#282a2e] border border-[#3d494c] rounded text-[#e2e2e8] font-mono text-[11px] cursor-pointer focus:outline-none focus:border-[#4cd7f6]"
            >
              <option value="cmd">COMMAND CENTER / ADMIN</option>
              <option value="hosp">HOSPITAL STAFF (TRIAGE)</option>
              <option value="field">FIELD WORKER / AMBULANCE</option>
              <option value="ngo">NGO / DONOR OBSERVER</option>
              <option value="audit">PUBLIC AUDITOR</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-[#232936] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#4cd7f6] text-[#003640] rounded font-mono text-[11px] font-bold cursor-pointer hover:bg-[#acedff] transition"
          >
            Confirm &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
