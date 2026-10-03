import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

export const ResourceLedgerView: React.FC = () => {
  const {
    ledger,
    isTampered,
    tamperReason,
    verifyDurationMs,
    isVerifying,
    tamperLedger,
    restoreLedger,
    verifyLedger,
    disburseFunds,
  } = useSimulation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FUNDS' | 'BLOOD' | 'AMBULANCE'>('ALL');
  const [verificationNotification, setVerificationNotification] = useState<string | null>(null);

  // New grant/donation modal state
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('Gates Global Health Escrow');
  const [recipientHospital, setRecipientHospital] = useState<string>('Sion Trauma Emergency Center');
  const [donationAmount, setDonationAmount] = useState<number>(750000);
  const [donationPurpose, setDonationPurpose] = useState<string>('Emergency Portable Ventilators & Diesel Fuel');

  const handleVerify = async () => {
    const res = await verifyLedger();
    if (res.isValid) {
      setVerificationNotification(`Validated ${ledger.length} blocks via Web Crypto SHA-256 in ${res.durationMs}ms. Zero collisions.`);
    } else {
      setVerificationNotification(`Verification Failed: Signature mismatch detected at Block #${res.brokenBlockIndex}.`);
    }
    setTimeout(() => setVerificationNotification(null), 4500);
  };

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    await disburseFunds(donorName, recipientHospital, donationAmount, donationPurpose);
    setIsDonateOpen(false);
    setVerificationNotification(`Block #${ledger[ledger.length - 1].index + 1} mined! ₹${donationAmount.toLocaleString('en-IN')} committed to cryptographic ledger.`);
    setTimeout(() => setVerificationNotification(null), 5000);
  };

  const allTransactions = ledger.flatMap(b => b.transactions);

  const filteredTransactions = allTransactions.filter(tx => {
    if (activeFilter === 'FUNDS' && tx.type !== 'FUNDS') return false;
    if (activeFilter === 'BLOOD' && tx.type !== 'BLOOD') return false;
    if (activeFilter === 'AMBULANCE' && tx.type !== 'AMBULANCE') return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.payload.toLowerCase().includes(q) ||
      tx.originEntity.toLowerCase().includes(q) ||
      tx.destinationEntity.toLowerCase().includes(q) ||
      tx.txHash.toLowerCase().includes(q) ||
      tx.zkSubjectHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full text-[#e2e2e8]">
      {/* Dynamic Notification Bar (Alert on Tamper) */}
      {isTampered && (
        <div className="w-full bg-[#93000a] text-[#ffdad6] px-6 py-2.5 flex items-center justify-between border-b border-[#ff817a]/40 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                CRYPTOGRAPHIC SIGNATURE COLLISION DETECTED
              </span>
              <span className="font-sans text-[12px] opacity-90">
                {tamperReason || 'Block #426 state mutation detected: Merkle root mismatch cascades to invalid block #427, #428, #429.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-black/40 px-2 py-0.5 rounded border border-[#ff817a]">
              STATUS: COMPROMISED
            </span>
            <button
              onClick={restoreLedger}
              className="px-3 py-1 bg-[#111317] text-[#ffb4ab] rounded font-mono text-[11px] font-semibold hover:bg-[#282a2e] transition cursor-pointer"
            >
              Consensus Heal
            </button>
          </div>
        </div>
      )}

      {/* Verification Notification Toast */}
      {verificationNotification && !isTampered && (
        <div className="w-full bg-[#00a572]/20 border-b border-[#4edea3]/40 text-[#4edea3] px-6 py-2 flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{verificationNotification}</span>
          </div>
          <span className="text-[#869397] text-[10px]">INTEGRITY SECURE</span>
        </div>
      )}

      {/* Primary Canvas Container */}
      <div className="p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Editorial Header & Cryptographic Telemetry */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-4 border-b border-[#232936]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-widest">
                MODULE 004 // TACTICAL LEDGER EXPLORER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#869397]"></span>
              <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
                MUMBAI_ZONE4_CORRIDOR
              </span>
            </div>
            <h1 className="font-sans text-[26px] text-[#e2e2e8] uppercase font-bold tracking-tight">
              Cryptographic Ledger &amp; Resource Lineage
            </h1>
            <p className="font-sans text-[13px] text-[#bcc9cd] max-w-3xl leading-relaxed">
              Verifiable hash-chained transaction ledger logging live relief funding disbursements, high-priority resource dispatch orders, and field triage receipts via tamper-evident Merkle state trees.
            </p>
          </div>

          {/* Live Web Crypto SHA-256 Health Badge Panel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-[#1a1c20] px-4 py-3 rounded-lg flex items-center gap-3 border border-[#232936] shadow-sm">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
                  isTampered ? 'bg-[#93000a] text-[#ffdad6]' : 'bg-[#4edea3]/15 text-[#4edea3]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isTampered ? 'gpp_bad' : 'verified_user'}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
                      isTampered ? 'text-[#ff817a]' : 'text-[#4edea3]'
                    }`}
                  >
                    {isTampered ? 'CHAIN INTEGRITY: COMPROMISED' : 'CHAIN INTEGRITY: VERIFIED'}
                  </span>
                  <span className="font-mono text-[9px] text-[#869397] bg-[#282a2e] px-1.5 py-0.5 rounded">
                    {ledger.length} BLOCKS
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#bcc9cd] mt-0.5">
                  {isTampered
                    ? 'FAIL: Hash mismatch signature detected at Block #426'
                    : `Web Crypto SHA-256: ${ledger.length}/${ledger.length} validated in ${verifyDurationMs}ms`}
                </span>
              </div>
            </div>

            <div className="bg-[#1a1c20] px-3.5 py-3 rounded-lg flex flex-col justify-center border border-[#232936]">
              <span className="font-mono text-[9px] text-[#869397] uppercase">L2 STATE ANCHOR</span>
              <span className="font-mono text-[11px] text-[#4cd7f6] tracking-wide">
                Polygon Rollup: #0x8A72...91B4
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Integrity Controls & Simulation Playground */}
        <div className="bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-3 border border-[#232936] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">CRYPTO ENGINE SIMULATOR</span>
                <span className="w-1 h-1 rounded-full bg-[#869397]"></span>
                <span className="font-mono text-[10px] text-[#869397]">FAULT TOLERANCE BENCH</span>
              </div>
              <h2 className="font-sans text-[18px] text-[#e2e2e8] font-semibold">
                Tamper-Proof Verification Suite
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* New Grant Button */}
              <button
                onClick={() => setIsDonateOpen(true)}
                className="flex items-center gap-1.5 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] px-3.5 py-1.5 rounded font-mono text-[11px] font-bold transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_card</span>
                <span>+ Disburse New Grant</span>
              </button>

              {/* Verify Chain Trigger */}
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex items-center gap-1.5 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] px-3.5 py-1.5 rounded font-mono text-[11px] font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[16px] ${isVerifying ? 'animate-spin' : ''}`}>
                  autorenew
                </span>
                <span>{isVerifying ? 'Hashing...' : 'Verify Chain Integrity'}</span>
              </button>

              {/* Malicious Tamper Injector */}
              <button
                onClick={tamperLedger}
                className="flex items-center gap-1.5 bg-[#282a2e] text-[#ffb3ad] px-3.5 py-1.5 rounded font-mono text-[11px] font-medium hover:bg-[#93000a] hover:text-[#ffdad6] transition-all border border-[#3d494c]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">bug_report</span>
                <span>Simulate Malicious Tampering Demo</span>
              </button>

              {/* Restore Consensus */}
              <button
                onClick={restoreLedger}
                className="flex items-center gap-1.5 bg-[#282a2e] text-[#e2e2e8] px-3.5 py-1.5 rounded font-mono text-[11px] hover:bg-[#333539] transition border border-[#3d494c]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sync_saved_locally</span>
                <span>Restore from Backup</span>
              </button>
            </div>
          </div>

          {/* Micro Info Strip */}
          <div className="bg-[#0c0e12] p-2.5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#bcc9cd] font-mono text-[10px] border border-[#232936]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#4cd7f6] material-symbols-outlined text-[14px]">info</span>
              <span>
                SIMULATION PREVIEW: Injects arbitrary ₹10,00,000 disbursement change to historic Block #426, breaking SHA-256 cascade.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>CONSENSUS PEERS: 12/12 ACTIVE</span>
              <span className="text-[#4edea3]">BFT EPOCH #981</span>
            </div>
          </div>
        </div>

        {/* Modal for Disbursing New Grant */}
        {isDonateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1a1c20] border border-[#232936] rounded-xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
                <span className="font-mono text-[13px] text-[#4edea3] font-bold uppercase">
                  DISBURSE RELIEF GRANT (MINES BLOCK)
                </span>
                <button onClick={() => setIsDonateOpen(false)} className="text-[#869397] hover:text-[#e2e2e8]">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGrant} className="flex flex-col gap-3 font-mono text-[12px]">
                <div className="flex flex-col gap-1">
                  <label className="text-[#869397] text-[10px] uppercase">ORIGIN ENTITY / DONOR</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    className="p-2 bg-[#0c0e12] border border-[#232936] rounded text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#869397] text-[10px] uppercase">DESTINATION BENEFICIARY</label>
                  <input
                    type="text"
                    value={recipientHospital}
                    onChange={(e) => setRecipientHospital(e.target.value)}
                    required
                    className="p-2 bg-[#0c0e12] border border-[#232936] rounded text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#869397] text-[10px] uppercase">GRANT AMOUNT (INR)</label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    min="1000"
                    step="1000"
                    required
                    className="p-2 bg-[#0c0e12] border border-[#232936] rounded text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#869397] text-[10px] uppercase">PURPOSE / MEDICAL PAYLOAD</label>
                  <input
                    type="text"
                    value={donationPurpose}
                    onChange={(e) => setDonationPurpose(e.target.value)}
                    required
                    className="p-2 bg-[#0c0e12] border border-[#232936] rounded text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 py-2.5 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] rounded font-bold transition cursor-pointer"
                >
                  Sign &amp; Append Block to Ledger
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Visual Hash Chain Flow */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">SUB-SYSTEM 004.1</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#869397]"></span>
              <span className="font-sans text-[17px] text-[#e2e2e8] font-semibold">
                Cryptographic Block Pipeline &amp; Cascade
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#869397]">HASH METHOD: SHA-256 / MERKLE-PATRICIA</span>
          </div>

          {/* Horizontal Chain Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {ledger.slice(-4).map((block, idx) => {
              const isTip = idx === ledger.slice(-4).length - 1;
              const isMutated = block.status === 'tampered';

              return (
                <div
                  key={block.index}
                  className={`relative rounded-lg p-4 flex flex-col justify-between gap-3 border transition-all duration-300 ${
                    isMutated
                      ? 'bg-[#93000a]/20 border-[#ff817a]'
                      : isTip
                      ? 'bg-[#282a2e] border-[#4cd7f6]/60 shadow-md'
                      : 'bg-[#1a1c20] border-[#232936]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      {isTip && !isMutated && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping"></span>
                          <span className="font-mono text-[9px] text-[#4cd7f6] font-bold">CHAIN TIP (LATEST)</span>
                        </div>
                      )}
                      <span className="font-mono text-[9px] text-[#869397]">BLOCK INDEX</span>
                      <span className="font-sans text-[18px] text-[#e2e2e8] font-bold">#{block.index}</span>
                    </div>

                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                        isMutated
                          ? 'bg-[#93000a] text-[#ffdad6]'
                          : isTip
                          ? 'bg-[#06b6d4]/20 text-[#4cd7f6]'
                          : 'bg-[#4edea3]/15 text-[#4edea3]'
                      }`}
                    >
                      {isMutated ? (block.index === 426 ? 'HASH MISMATCH' : 'INVALID PREV_HASH') : isTip ? 'COMMITTED' : 'VERIFIED'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                    <div className="bg-[#0c0e12] p-1.5 rounded flex flex-col border border-[#232936]">
                      <span className="text-[#869397] uppercase text-[8px]">BLOCK HASH</span>
                      <span className={`truncate font-mono ${isMutated ? 'text-[#ff817a]' : 'text-[#4cd7f6]'}`}>
                        {block.blockHash}
                      </span>
                    </div>
                    <div className="bg-[#0c0e12] p-1.5 rounded flex flex-col border border-[#232936]">
                      <span className="text-[#869397] uppercase text-[8px]">PREV HASH</span>
                      <span className="text-[#bcc9cd] truncate font-mono">
                        {block.previousHash}
                      </span>
                    </div>
                  </div>

                  {/* Payload Summary */}
                  <div className="bg-[#1e2024] p-2 rounded flex flex-col gap-1 border border-[#232936]/40">
                    <div className="flex justify-between text-[#869397] font-mono text-[10px]">
                      <span>TX COUNT ({block.transactions.length})</span>
                      {block.totalValueINR && (
                        <span className="text-[#e2e2e8] font-semibold">
                          ₹{block.totalValueINR.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-[#bcc9cd] font-sans text-[12px] line-clamp-2">
                      {block.payloadSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[#869397] font-mono text-[9px] pt-1 border-t border-[#3d494c]/20">
                    <span>TIME: {block.timestamp}</span>
                    <span>NONCE: {block.nonce}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editorial Bento Split: Donor End-to-End Lineage Trace & ZK Data Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Donor Lineage Visual Flow (7 Cols) */}
          <div className="lg:col-span-7 bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-4 border border-[#232936] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-[#4edea3] uppercase font-semibold">004.2 AUDIT TRAIL</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#869397]"></span>
                  <span className="font-mono text-[10px] text-[#869397]">DONOR LINEAGE PROVENANCE</span>
                </div>
                <h3 className="font-sans text-[18px] text-[#e2e2e8] font-semibold">
                  End-to-End Resource &amp; Capital Trace
                </h3>
              </div>
              <div className="bg-[#282a2e] px-2.5 py-1 rounded text-[#869397] font-mono text-[11px] border border-[#3d494c]/30">
                TX_UID: <span className="text-[#4cd7f6] font-mono">DON-9041-MU</span>
              </div>
            </div>

            <p className="font-sans text-[13px] text-[#bcc9cd] leading-relaxed">
              Complete transparent tracking of grant allocation: from public philanthropic contribution down to physical medical kits accepted at emergency trauma bays.
            </p>

            {/* Visual Step Nodes Container */}
            <div className="relative flex flex-col gap-3 pl-3 border-l-2 border-[#06b6d4]/40 ml-3">
              {/* Step 1 */}
              <div className="relative flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#06b6d4]/20 text-[#4cd7f6] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 -ml-[23px] border border-[#4cd7f6]">
                  1
                </div>
                <div className="flex flex-col bg-[#0c0e12] p-3 rounded flex-1 border border-[#232936]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold">Capital Influx (₹50,000)</span>
                    <span className="font-mono text-[10px] text-[#4edea3]">18:12:00 IST</span>
                  </div>
                  <span className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">
                    Direct philanthropic grant via Escrow Smart Contract #0x92b1...38c1.
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-[#869397] font-mono text-[10px]">
                    <span>DONOR REF: D-9041</span>
                    <span>•</span>
                    <span>STATE: CONFIRMED L1</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#06b6d4]/20 text-[#4cd7f6] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 -ml-[23px] border border-[#4cd7f6]">
                  2
                </div>
                <div className="flex flex-col bg-[#0c0e12] p-3 rounded flex-1 border border-[#232936]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold">
                      Custody Transfer → NGO Relief International
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">18:24:45 IST</span>
                  </div>
                  <span className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">
                    Autonomous multi-sig release for medical material procurement requisition #PR-441.
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-[#869397] font-mono text-[10px]">
                    <span>SIGNATURES: 3 OF 4 VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#06b6d4]/20 text-[#4cd7f6] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 -ml-[23px] border border-[#4cd7f6]">
                  3
                </div>
                <div className="flex flex-col bg-[#0c0e12] p-3 rounded flex-1 border border-[#232936]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[#e2e2e8] font-semibold">
                      Kurla Depot-3 Procurement
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">18:38:10 IST</span>
                  </div>
                  <span className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">
                    Procured 120 Sterile Trauma Hemostatic Kits. Batch barcode hash serialized to ledger.
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-[#869397] font-mono text-[10px]">
                    <span>BATCH: #TMK-2024-098</span>
                    <span>•</span>
                    <span>DEPOT INSPECTION: PASSED</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4edea3] text-[#003824] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 -ml-[23px]">
                  4
                </div>
                <div className="flex flex-col bg-[#0c0e12] p-3 rounded flex-1 border border-[#4edea3]/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[#4edea3] font-bold">
                      Physical Arrival &amp; Triage Receipt
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3]">18:51:30 IST</span>
                  </div>
                  <span className="font-sans text-[12px] text-[#bcc9cd] mt-0.5">
                    Delivered to KEM Emergency Trauma Bay. Cryptographically counter-signed by Lead Field Nurse AMB-03.
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-[#4edea3] font-mono text-[10px]">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    <span>TERMINAL RECIPIENT VERIFIED ON-CHAIN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zero-Knowledge Privacy & Real-time Allocation Metric (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Privacy & ZK Hash Module */}
            <div className="bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-3 border border-[#232936] shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#869397] uppercase">ZERO-KNOWLEDGE PRIVACY SUITE</span>
                  <h4 className="font-sans text-[17px] text-[#e2e2e8] font-semibold">
                    HIPAA / GDPR Pseudonymization
                  </h4>
                </div>
                <span className="material-symbols-outlined text-[#4cd7f6] text-[24px]">key_visualizer</span>
              </div>
              <p className="font-sans text-[12px] text-[#bcc9cd] leading-relaxed">
                All vulnerable patient identifiers and acute triage assessments are obfuscated using salted ZK-SNARK hashes before committing to the shared public audit stream.
              </p>
              <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between bg-[#0c0e12] p-2 px-3 rounded border border-[#232936]">
                  <span className="text-[#869397] text-[10px]">RAW ADMISSION ID</span>
                  <span className="text-[#bcc9cd]">PATIENT #9104-M</span>
                </div>
                <div className="flex items-center justify-between bg-[#282a2e] p-2 px-3 rounded border border-[#3d494c]/40">
                  <span className="text-[#4cd7f6] text-[10px]">ANONYMIZED HASH</span>
                  <span className="text-[#4cd7f6] font-mono">pat_anon_8f3a9</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[#869397] font-mono text-[10px]">
                <span className="material-symbols-outlined text-[14px] text-[#4edea3]">lock</span>
                <span>Proof Protocol: Groth16 / Verification Cost: 21,400 Gas</span>
              </div>
            </div>

            {/* Metric Inline SVG & Ledger Velocity */}
            <div className="bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-3 border border-[#232936] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-[#869397] uppercase">HOURLY DISBURSEMENT VELOCITY</span>
                  <h4 className="font-sans text-[18px] text-[#e2e2e8] font-bold">₹24,80,000 / HR</h4>
                </div>
                <span className="font-mono text-[11px] text-[#4edea3] font-bold">+18.4%</span>
              </div>

              {/* Clean Inline SVG Area Sparkline */}
              <div className="w-full h-20 bg-[#0c0e12] rounded p-1 flex items-center justify-center border border-[#232936]">
                <svg viewBox="0 0 300 80" className="w-full h-full text-[#4cd7f6]" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,70 L25,65 L50,55 L75,60 L100,42 L125,48 L150,30 L175,35 L200,20 L225,25 L250,12 L275,18 L300,5 L300,80 L0,80 Z"
                    fill="url(#velocityGrad)"
                  />
                  <path
                    d="M0,70 L25,65 L50,55 L75,60 L100,42 L125,48 L150,30 L175,35 L200,20 L225,25 L250,12 L275,18 L300,5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[#869397] font-mono text-[9px]">
                <span>PEAK FLOW: 18:20 IST</span>
                <span>SETTLEMENT FINALITY: &lt; 2.4s</span>
                <span>CHAIN RE-ORGS: 0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Table & Transaction Search Filter */}
        <div className="bg-[#1a1c20] rounded-lg p-5 flex flex-col gap-3 border border-[#232936] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[9px] text-[#869397] uppercase">EXPLORER AUDIT STREAM</span>
              <h3 className="font-sans text-[18px] text-[#e2e2e8] font-semibold">
                Recent Cryptographic Commitments
              </h3>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#869397] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter Tx, Stakeholder, Hash..."
                  className="bg-[#0c0e12] text-[#e2e2e8] font-mono text-[11px] pl-7 pr-3 py-1 rounded border border-[#232936] focus:outline-none focus:border-[#4cd7f6] transition-colors w-48 md:w-64"
                />
              </div>

              {/* Resource Type Chips */}
              <div className="flex items-center bg-[#282a2e] p-0.5 rounded border border-[#3d494c]/30 font-mono text-[11px]">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    activeFilter === 'ALL' ? 'bg-[#4cd7f6] text-[#003640]' : 'text-[#bcc9cd] hover:text-[#e2e2e8]'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setActiveFilter('FUNDS')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    activeFilter === 'FUNDS' ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:text-[#e2e2e8]'
                  }`}
                >
                  FUNDS
                </button>
                <button
                  onClick={() => setActiveFilter('BLOOD')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    activeFilter === 'BLOOD' ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:text-[#e2e2e8]'
                  }`}
                >
                  BLOOD
                </button>
                <button
                  onClick={() => setActiveFilter('AMBULANCE')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    activeFilter === 'AMBULANCE' ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:text-[#e2e2e8]'
                  }`}
                >
                  ICU/FLEET
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Data Grid */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="text-[#869397] uppercase text-[9px] bg-[#282a2e]/60 border-b border-[#232936]">
                  <th className="py-2 px-3">Tx Hash</th>
                  <th className="py-2 px-3">Block</th>
                  <th className="py-2 px-3">Resource / Payload</th>
                  <th className="py-2 px-3">Origin Entity</th>
                  <th className="py-2 px-3">Destination</th>
                  <th className="py-2 px-3">ZK Subject</th>
                  <th className="py-2 px-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936] text-[12px]">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#1e2024] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#4cd7f6]">{tx.txHash.slice(0, 14)}...</td>
                    <td className="py-2.5 px-3 font-mono text-[#e2e2e8]">#{tx.blockIndex}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          !tx.verified
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : tx.type === 'BLOOD'
                            ? 'bg-[#ff817a]/20 text-[#ffb4ab]'
                            : tx.type === 'FUNDS'
                            ? 'bg-[#4edea3]/20 text-[#4edea3]'
                            : 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                        }`}
                      >
                        {tx.payload}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#bcc9cd]">{tx.originEntity}</td>
                    <td className="py-2.5 px-3 text-[#e2e2e8] font-medium">{tx.destinationEntity}</td>
                    <td className="py-2.5 px-3 font-mono text-[#869397]">{tx.zkSubjectHash}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-mono text-[10px] uppercase font-bold ${
                          tx.verified ? 'text-[#4edea3]' : 'text-[#ff817a]'
                        }`}
                      >
                        {tx.verified ? 'PROVED OK' : 'SIGNATURE REJECTED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 text-[#869397] font-mono text-[10px] border-t border-[#232936]">
            <span>SHOWING {filteredTransactions.length} OF 1,489 TRANSACTIONS</span>
            <div className="flex items-center gap-2">
              <span>GAS EFFICIENCY: 99.4%</span>
              <span>•</span>
              <span>ROLLUP SETTLEMENT INTERVAL: 60 SECONDS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
