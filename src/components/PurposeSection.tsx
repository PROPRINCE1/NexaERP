import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PROJECT_TARGETS } from '../data/nexaerpData';
import { filterProjectTargets, type TargetFilter } from '../utils/nexaerpLogic';
import { EASE_OUT_EXPO, SectionReveal, StaggerContainer, StaggerItem } from './MotionPrimitives';

const TARGET_VERIFICATION_NOTES: Record<string, string> = {
  t1: 'Planned check: Structured workflow interviews before freezing requirements.',
  t2: 'Planned check: Functional prototype covering four core workflows by month 6.',
  t3: 'Planned check: Task-completion study with at least five representative participants.',
  t4: 'Planned check: Time-based holdout comparison against a seasonal-naive baseline.',
  t5: 'Planned check: Completed security and data-quality checklist prior to pilot testing.',
};

export function PurposeSection() {
  const [focusFilter, setFocusFilter] = useState<TargetFilter>('all');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('t1');

  const visibleTargets = useMemo(
    () => filterProjectTargets(PROJECT_TARGETS, focusFilter),
    [focusFilter],
  );

  return (
    <section
      id="vision-mission-objectives"
      aria-labelledby="purpose-title"
      className="relative bg-[#cadbd3]/80 py-14 sm:py-20 lg:py-26 scroll-mt-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-[1fr_0.58fr] lg:gap-14 mb-10 lg:mb-12">
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wide text-[#075e58]">Direction</p>
              <h2
                id="purpose-title"
                className="max-w-[680px] text-[clamp(1.75rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#102d40] text-balance"
              >
                A practical ambition, still to be tested.
              </h2>
            </div>
            <p className="max-w-[460px] text-[15px] leading-[1.72] text-[#40545e]">
              The vision and mission describe the team’s intent. The objectives below are proposed
              project targets, not completed results.
            </p>
          </div>
        </SectionReveal>

        <StaggerContainer className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <StaggerItem>
            <article className="h-full min-h-[160px] sm:min-h-[190px] border-t-[3px] border-t-[#087c72] border-x border-b border-[#d2dfd8] bg-[#f9fbf8] p-5 sm:p-7">
              <span className="text-xs font-bold text-[#075e58]">Vision</span>
              <p className="mt-4 sm:mt-5 max-w-[470px] font-display text-[clamp(1.0625rem,2vw,1.4375rem)] font-semibold leading-[1.45] tracking-[-0.025em] text-[#102d40]">
                Help growing local businesses make timely decisions using organized, understandable
                operational data.
              </p>
            </article>
          </StaggerItem>

          <StaggerItem>
            <article className="h-full min-h-[160px] sm:min-h-[190px] border-t-[3px] border-t-[#087c72] border-x border-b border-[#d2dfd8] bg-[#f9fbf8] p-5 sm:p-7">
              <span className="text-xs font-bold text-[#075e58]">Mission</span>
              <p className="mt-4 sm:mt-5 max-w-[470px] font-display text-[clamp(1.0625rem,2vw,1.4375rem)] font-semibold leading-[1.45] tracking-[-0.025em] text-[#102d40]">
                Build an affordable, secure and usable ERP service that helps small teams record
                essential operations and learn from their own data.
              </p>
            </article>
          </StaggerItem>
        </StaggerContainer>

        <SectionReveal delay={0.1}>
          <div className="mt-12 sm:mt-16 flex flex-col gap-4 border-b border-[#c9d8d1] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1.5 text-xs font-bold tracking-wide text-[#075e58]">
                Proposed project targets
              </p>
              <h3 className="text-lg sm:text-xl font-bold tracking-[-0.025em] text-[#102d40]">
                What the team aims to validate and build
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <span className="text-xs font-bold text-[#253f44]">Not achieved results</span>
              <span aria-hidden="true" className="hidden sm:inline text-[#7d9c91]">
                ·
              </span>
              <div
                role="group"
                aria-label="Filter proposed project targets"
                className="grid grid-cols-2 sm:inline-flex gap-1 rounded-[4px] border border-[#a9c0b5] bg-[#dbe8e1] p-1"
              >
                {(
                  [
                    { id: 'all', label: 'All (5)' },
                    { id: 'discovery', label: 'Discovery & UX' },
                    { id: 'build', label: 'Build & Data' },
                    { id: 'security', label: 'Security' },
                  ] as const
                ).map((option) => {
                  const active = focusFilter === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFocusFilter(option.id)}
                      className={`min-h-[44px] sm:min-h-[36px] rounded-[3px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'bg-white text-[#102d40] shadow-xs'
                          : 'text-[#395559] hover:text-[#102d40]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
            <AnimatePresence initial={false} mode="popLayout">
              {visibleTargets.map((target, index) => {
                const isSelected = selectedTargetId === target.id;
                return (
                  <motion.li
                    key={target.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                    className="border-b border-[#b0c6bc]"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTargetId(target.id)}
                      aria-expanded={isSelected}
                      className={`grid w-full grid-cols-[28px_1fr] items-start gap-3 px-2.5 py-4 sm:py-5 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#eef5f1]' : 'hover:bg-[#dae7e0]'
                      }`}
                    >
                      <span className="mt-0.5 font-mono text-xs font-bold text-[#06524c] tabular-nums">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-sm leading-[1.65] text-[#1f3943]">{target.text}</p>
                        <p className="mt-1.5 text-[11px] font-semibold text-[#3c5c57]">
                          {target.focusLabel}
                        </p>
                        {isSelected && (
                          <p className="mt-2 text-xs font-medium text-[#075e58]">
                            {TARGET_VERIFICATION_NOTES[target.id]}
                          </p>
                        )}
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </SectionReveal>
      </div>
    </section>
  );
}
