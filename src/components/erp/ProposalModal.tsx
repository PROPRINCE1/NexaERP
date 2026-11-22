import { X } from 'lucide-react';
import { PROPOSAL_METADATA } from '../../data/erpSeedData';

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
  onViewConceptSite?: () => void;
}

export function ProposalModal({ open, onClose, onViewConceptSite }: ProposalModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-modal-title"
    >
      <div className="fixed inset-0 bg-[#05141e]/60" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 max-h-[88vh] w-full max-w-[680px] overflow-y-auto no-scrollbar rounded-[6px] border border-[#b5cbc0] bg-[#ebf3ee] p-5 sm:p-7 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#c8dad1] pb-4">
          <div>
            <p className="text-xs font-semibold text-[#075e58]">
              {PROPOSAL_METADATA.university} · Group 14
            </p>
            <h2
              id="proposal-modal-title"
              className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-[#102d40]"
            >
              NexaERP AI — Platform Scope & Attribution
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close platform scope dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#b5cbc0] bg-[#e1ece6] text-[#102d40] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-xs sm:text-[13px] leading-relaxed text-[#395157]">
          <p>
            NexaERP AI integrates five core SME operational workflows—executive reporting,
            inventory control, validated transaction & CSV ingestion, demand forecasting, and
            role-based access control—with human confirmation required before every operational
            decision.
          </p>

          <div>
            <h3 className="text-xs font-bold text-[#102d40] mb-2">
              Project Team ({PROPOSAL_METADATA.course})
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROPOSAL_METADATA.team.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[4px] border border-[#c3d6cc] bg-[#e1ece6] px-3 py-2.5"
                >
                  <p className="font-bold text-[#102d40]">{member.name}</p>
                  <p className="font-mono text-[11px] text-[#075e58]">{member.id}</p>
                  <p className="mt-0.5 text-[11px] text-[#445c60]">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[4px] border border-[#c3d6cc] bg-[#e1ece6] p-3.5">
              <h3 className="text-xs font-bold text-[#102d40] mb-2">Operational Guardrails</h3>
              <ul className="space-y-1.5 text-xs text-[#395157]">
                {PROPOSAL_METADATA.exclusions.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[4px] border border-[#c3d6cc] bg-[#e1ece6] p-3.5">
              <h3 className="text-xs font-bold text-[#102d40] mb-2">System Performance Targets</h3>
              <ul className="space-y-1.5 text-xs text-[#395157]">
                {PROPOSAL_METADATA.successTargets.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {onViewConceptSite && (
            <div className="flex justify-end border-t border-[#c8dad1] pt-3.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewConceptSite();
                }}
                className="min-h-[38px] rounded-[4px] bg-[#087c72] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#075e58] cursor-pointer"
              >
                Open full concept overview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
