/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EventInjectorModal } from './components/EventInjectorModal';
import { CriticalPendingModal } from './components/CriticalPendingModal';
import { OperatorProfileModal } from './components/OperatorProfileModal';
import { CommandCenterView } from './views/CommandCenterView';
import { AllocationEngineView } from './views/AllocationEngineView';
import { ScenarioTimelineView } from './views/ScenarioTimelineView';
import { ResourceLedgerView } from './views/ResourceLedgerView';
import { FieldHospitalPortalsView } from './views/FieldHospitalPortalsView';
import { ArchitectureReportView } from './views/ArchitectureReportView';

const MainContent: React.FC = () => {
  const { activeDirective } = useSimulation();
  const [isInjectorOpen, setIsInjectorOpen] = useState<boolean>(false);
  const [isCriticalOpen, setIsCriticalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#111317] text-[#e2e2e8] flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Command Canvas */}
      <div className="pl-72 flex flex-col flex-1 min-h-screen">
        <Header
          onOpenQuickInjector={() => setIsInjectorOpen(true)}
          onOpenCriticalModal={() => setIsCriticalOpen(true)}
          onOpenProfileModal={() => setIsProfileOpen(true)}
        />

        <main className="w-full pt-16 bg-[#111317] flex-1">
          {activeDirective === 'command-center' && <CommandCenterView />}
          {activeDirective === 'allocation-engine' && <AllocationEngineView />}
          {activeDirective === 'scenario-timeline' && <ScenarioTimelineView />}
          {activeDirective === 'resource-and-ledger' && <ResourceLedgerView />}
          {activeDirective === 'field-and-hospital-portals' && <FieldHospitalPortalsView />}
          {activeDirective === 'architecture-and-report' && <ArchitectureReportView />}
        </main>
      </div>

      {/* Modal Dialog for Emergency Event Injector */}
      <EventInjectorModal
        isOpen={isInjectorOpen}
        onClose={() => setIsInjectorOpen(false)}
      />

      {/* Modal Dialog for Critical Pending Triage Patients */}
      <CriticalPendingModal
        isOpen={isCriticalOpen}
        onClose={() => setIsCriticalOpen(false)}
      />

      {/* Modal Dialog for Operator Profile Credentials */}
      <OperatorProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <MainContent />
    </SimulationProvider>
  );
}
