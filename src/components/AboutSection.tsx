import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AUDIENCE_BLOCKS } from '../data/nexaerpData';
import { EASE_OUT_EXPO, SectionReveal } from './MotionPrimitives';

type AudienceFocus = 'all' | 'decision-makers' | 'daily-staff';

const PERSPECTIVE_CONTEXT: Record<AudienceFocus, string> = {
  all: 'Showing both operational perspectives from the proposal.',
  'decision-makers':
    'Focus: Owners and managers reviewing stock movement summaries across retail, wholesale and distribution.',
  'daily-staff':
    'Focus: Inventory, sales, accounts and store staff maintaining connected daily operational records.',
};

export function AboutSection() {
  const [audienceFocus, setAudienceFocus] = useState<AudienceFocus>('all');

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative bg-[#d8e6df]/75 py-14 sm:py-20 lg:py-26 scroll-mt-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-[1fr_0.58fr] lg:gap-14 mb-10 lg:mb-12">
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wide text-[#075e58]">The idea</p>
              <h2
                id="about-title"
                className="max-w-[680px] text-[clamp(1.75rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#102d40] text-balance"
              >
                Business records should tell one story.
              </h2>
            </div>
            <p className="max-w-[460px] text-[15px] leading-[1.72] text-[#40545e]">
              In some growing businesses, sales, purchases and stock live in separate spreadsheets,
              paper books or apps. NexaERP AI is exploring a more connected way to keep those
              records understandable and useful.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="grid grid-cols-1 items-start gap-8 border-t border-[#d4dfda] pt-8 sm:pt-10 lg:grid-cols-[0.76fr_1.24fr] lg:gap-14">
            <div className="lg:max-w-[380px]">
              <span aria-hidden="true" className="mb-4 block h-[3px] w-9 bg-[#087c72]" />
              <p className="text-lg sm:text-xl font-semibold leading-[1.5] tracking-[-0.02em] text-[#102d40]">
                The proposal starts with routine operations: keeping product records, noting stock
                movements, recording transactions and reviewing summaries.
              </p>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold text-[#53696c]">Highlight perspective</p>
                <div
                  role="group"
                  aria-label="Highlight audience perspective"
                  className="grid grid-cols-3 sm:inline-flex gap-1 rounded-[4px] border border-[#d4dfda] bg-[#edf3ef] p-1 w-full sm:w-auto"
                >
                  {(
                    [
                      { id: 'all', label: 'Both groups' },
                      { id: 'decision-makers', label: 'Business fit' },
                      { id: 'daily-staff', label: 'Team roles' },
                    ] as const
                  ).map((option) => {
                    const active = audienceFocus === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setAudienceFocus(option.id)}
                        className={`min-h-[44px] sm:min-h-[38px] rounded-[3px] px-2 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                          active
                            ? 'bg-white text-[#102d40] shadow-xs'
                            : 'text-[#4b6266] hover:text-[#102d40]'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={audienceFocus}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
                    aria-live="polite"
                    className="mt-3 text-xs leading-relaxed text-[#46615f]"
                  >
                    {PERSPECTIVE_CONTEXT[audienceFocus]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {AUDIENCE_BLOCKS.map((block) => {
                const isSelected = audienceFocus === block.audience;
                const isEmphasized = audienceFocus === 'all' || isSelected;
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() =>
                      setAudienceFocus((prev) =>
                        prev === block.audience ? 'all' : block.audience,
                      )
                    }
                    aria-pressed={isSelected}
                    className={`rounded-[4px] border p-5 text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#087c72] bg-white ring-1 ring-[#087c72]'
                        : isEmphasized
                          ? 'border-[#bfd1c9] bg-white hover:border-[#8ab5a6]'
                          : 'border-[#dfe8e3] bg-[#f3f6f3] opacity-65 hover:opacity-90'
                    }`}
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold tracking-[-0.015em] text-[#102d40]">
                        {block.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[11px] font-bold text-[#075e58]">Selected</span>
                      )}
                    </div>
                    <p className="text-sm leading-[1.72] text-[#40545e]">{block.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <p className="mt-8 sm:mt-10 rounded-[4px] border border-[#aac2b6] bg-[#cadbd3] px-4 py-3.5 text-[13px] leading-relaxed text-[#253f44]">
            NexaERP AI is a working name for a student venture concept, not a registered company or
            commercially available service.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
