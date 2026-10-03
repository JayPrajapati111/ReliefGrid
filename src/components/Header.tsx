import React from 'react';
import { useSimulation } from '../context/SimulationContext';

interface HeaderProps {
  onOpenQuickInjector?: () => void;
  onOpenCriticalModal?: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickInjector,
  onOpenCriticalModal,
  onOpenProfileModal,
}) => {
  const {
    isRunning,
    toggleRunning,
    speed,
    setSpeed,
    tick,
    clusters,
    injectEvent
  } = useSimulation();

  const criticalWaitingCount = clusters.filter(c => c.severity >= 4 && c.status !== 'evacuated').length;

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#1a1c20]/95 backdrop-blur-xl z-40 px-6 flex items-center justify-between border-b border-[#232936] shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      {/* Left: Disaster Sector Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span className="font-mono text-[12px] text-[#e2e2e8] font-medium uppercase tracking-wide">
            MONSOON FLOOD DISASTER • MUMBAI ZONE-4
          </span>
        </div>
        <button
          onClick={toggleRunning}
          className="hidden xl:flex items-center gap-2 bg-[#282a2e] hover:bg-[#333539] px-2.5 py-1 rounded border border-[#3d494c]/40 cursor-pointer transition"
          title="Click to pause or resume simulation"
        >
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#4cd7f6] animate-ping' : 'bg-[#ffb4ab]'}`}></span>
          <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider">
            {isRunning ? `SIMULATION RUNNING • TICK #${tick}` : `SIMULATION PAUSED • TICK #${tick}`}
          </span>
        </button>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Speed Controls */}
        <div className="hidden md:flex items-center bg-[#282a2e] p-1 rounded gap-1 font-mono text-[11px] border border-[#3d494c]/30">
          <span className="px-1.5 text-[#869397] text-[10px]">SPEED</span>
          <button
            onClick={() => setSpeed(1)}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              speed === 1 ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#e2e2e8] hover:text-[#4cd7f6]'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setSpeed(2)}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              speed === 2 ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#e2e2e8] hover:text-[#4cd7f6]'
            }`}
          >
            2x
          </button>
          <button
            onClick={() => setSpeed(5)}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              speed === 5 ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#e2e2e8] hover:text-[#4cd7f6]'
            }`}
          >
            5x
          </button>
          <button
            onClick={toggleRunning}
            className={`px-2.5 py-0.5 rounded transition-colors font-medium cursor-pointer ${
              isRunning
                ? 'text-[#ffb3ad] hover:text-[#ff817a]'
                : 'bg-[#4edea3] text-[#003824] font-bold'
            }`}
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Urgent Critical Pending Badge */}
        <button
          onClick={onOpenCriticalModal}
          className="flex items-center gap-1.5 bg-[#93000a]/40 hover:bg-[#93000a]/70 border border-[#ff817a]/40 text-[#ffdad6] px-3 py-1 rounded font-mono text-[11px] font-medium transition cursor-pointer"
          title="Inspect Critical Pending triage queue"
        >
          <span className="material-symbols-outlined text-[15px] text-[#ff817a]">warning</span>
          <span>{criticalWaitingCount || 3} Critical Pending</span>
        </button>

        {/* Emergency Event Injector Button */}
        <button
          onClick={() => {
            if (onOpenQuickInjector) {
              onOpenQuickInjector();
            } else {
              injectEvent('road_block');
            }
          }}
          className="flex items-center gap-1.5 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] px-3 py-1.5 rounded font-mono text-[11px] font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] cursor-pointer"
          title="Open Emergency Event Injector Matrix"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span className="hidden sm:inline">Emergency Event Injector</span>
        </button>

        {/* Operator Profile */}
        <button
          onClick={onOpenProfileModal}
          className="w-8 h-8 rounded-full bg-[#4cd7f6] hover:bg-[#acedff] flex items-center justify-center text-[#003640] shadow-sm font-bold text-sm cursor-pointer transition"
          title="View Operator Credentials & Session"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
        </button>
      </div>
    </header>
  );
};
