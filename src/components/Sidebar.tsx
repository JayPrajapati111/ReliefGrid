import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Role } from '../types';

export const Sidebar: React.FC = () => {
  const { role, setRole, activeDirective, setActiveDirective } = useSimulation();

  const directives = [
    { id: 'command-center', index: '001', label: '01 Command Center' },
    { id: 'allocation-engine', index: '002', label: '02 Allocation Engine' },
    { id: 'scenario-timeline', index: '003', label: '03 Scenario Timeline' },
    { id: 'resource-and-ledger', index: '004', label: '04 Resource & Ledger' },
    { id: 'field-and-hospital-portals', index: '005', label: '05 Field & Hospital Portals' },
    { id: 'architecture-and-report', index: '006', label: '06 Architecture & Report' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0c0e12] z-50 flex flex-col justify-between border-r border-[#232936] shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between bg-[#1a1c20] border-b border-[#232936]">
          <div className="flex flex-col">
            <span className="font-mono text-[14px] text-[#4cd7f6] tracking-wider font-semibold">RELIEFGRID / 01</span>
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-widest">TACTICAL ALLOCATION HUB</span>
          </div>
          <span className="material-symbols-outlined text-[#869397] text-[18px]">grid_view</span>
        </div>

        {/* Operator Role Selector */}
        <div className="px-4 py-2.5 bg-[#1a1c20]/40 border-b border-[#232936]/60">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">OPERATOR ROLE</span>
            <span className="font-mono text-[10px] text-[#4edea3] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              AUTH: OK
            </span>
          </div>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-[#282a2e] text-[#e2e2e8] font-mono text-[11px] py-1.5 px-2.5 rounded border border-[#3d494c]/50 appearance-none cursor-pointer focus:outline-none focus:border-[#4cd7f6] transition-colors"
            >
              <option value="cmd">COMMAND CENTER / ADMIN</option>
              <option value="hosp">HOSPITAL STAFF (TRIAGE)</option>
              <option value="field">FIELD WORKER / AMBULANCE</option>
              <option value="ngo">NGO / DONOR OBSERVER</option>
              <option value="audit">PUBLIC AUDITOR</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#869397] pointer-events-none text-[16px]">
              unfold_more
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="px-4 pt-4 pb-1">
          <span className="font-mono text-[10px] text-[#869397] uppercase tracking-widest">DIRECTIVES</span>
        </div>

        {/* Directives Navigation */}
        <nav className="flex flex-col px-2 gap-1 mt-1">
          {directives.map((dir) => {
            const isActive = activeDirective === dir.id;
            return (
              <button
                key={dir.id}
                onClick={() => setActiveDirective(dir.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
                  isActive
                    ? 'bg-[#282a2e] text-[#4cd7f6] font-medium border-l-2 border-[#4cd7f6]'
                    : 'text-[#bcc9cd] hover:bg-[#1e2024] hover:text-[#e2e2e8]'
                }`}
              >
                <span className="font-mono text-[10px] text-[#869397]">{dir.index}</span>
                <span className="font-mono text-[12px] uppercase tracking-wide truncate">{dir.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="p-4 bg-[#0c0e12] border-t border-[#232936] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[#869397] font-mono text-[10px]">
          <span>LEDGER ANCHOR</span>
          <span className="text-[#4edea3] font-mono text-[11px]">#0x8F9C...3A</span>
        </div>
        <div className="flex items-center justify-between text-[#869397] font-mono text-[10px]">
          <span>GEO TELEMETRY</span>
          <span className="text-[#e2e2e8] font-mono text-[11px]">18.9220°N 72.8347°E</span>
        </div>
      </div>
    </aside>
  );
};
