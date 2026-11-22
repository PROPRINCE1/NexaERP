import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TEAM_MEMBERS } from '../data/nexaerpData';
import { filterTeamMembers, type TeamFilter } from '../utils/nexaerpLogic';
import { EASE_OUT_EXPO, SectionReveal } from './MotionPrimitives';

export function TeamSection() {
  const [trackFilter, setTrackFilter] = useState<TeamFilter>('all');
  const [compactMode, setCompactMode] = useState(false);

  const visibleMembers = useMemo(
    () => filterTeamMembers(TEAM_MEMBERS, trackFilter),
    [trackFilter],
  );

  return (
    <section
      id="team"
      aria-labelledby="team-title"
      className="relative bg-[#d8e6df]/75 py-14 sm:py-20 lg:py-26 scroll-mt-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-[1fr_0.58fr] lg:gap-14 mb-8 lg:mb-10">
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wide text-[#075e58]">
                The people behind the proposal
              </p>
              <h2
                id="team-title"
                className="max-w-[680px] text-[clamp(1.75rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#102d40] text-balance"
              >
                Four roles. One project to shape.
              </h2>
            </div>
            <p className="max-w-[460px] text-[15px] leading-[1.72] text-[#40545e]">
              The responsibilities below are proposed project roles. Names and student IDs follow
              the proposal cover and should be confirmed by the team before publication.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-[#53696c]">
                Filter proposed project roles
              </span>
              <button
                type="button"
                aria-pressed={compactMode}
                onClick={() => setCompactMode((prev) => !prev)}
                className="min-h-[38px] rounded-[3px] border border-[#d4dfda] bg-[#f7f8f4] px-3 py-1 text-xs font-semibold text-[#102d40] hover:bg-[#eaf1ed] cursor-pointer"
              >
                {compactMode ? 'Show full role details' : 'Compact role view'}
              </button>
            </div>

            <div
              role="group"
              aria-label="Filter team roles"
              className="grid grid-cols-3 sm:inline-flex gap-1 rounded-[4px] border border-[#d4dfda] bg-[#f3f6f4] p-1 w-full sm:w-auto"
            >
              {(
                [
                  { id: 'all', label: 'All roles (4)' },
                  { id: 'product-ux', label: 'Product & UX' },
                  { id: 'data-platform', label: 'Data & Platform' },
                ] as const
              ).map((option) => {
                const active = trackFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTrackFilter(option.id)}
                    className={`min-h-[44px] sm:min-h-[38px] rounded-[3px] px-2 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-white text-[#102d40] shadow-xs'
                        : 'text-[#485f63] hover:text-[#102d40]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleMembers.map((member) => (
              <motion.article
                key={member.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
                className="border border-[#b2c9be] bg-[#fbfcfa] p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,45,64,0.04)]"
              >
                <div className="flex flex-col gap-2 border-b border-[#e3ebe6] pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-[-0.025em] text-[#102d40]">
                      {member.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-[#63777c] tabular-nums">
                      Student ID: {member.studentId}
                    </p>
                  </div>

                  <div className="sm:max-w-[175px] sm:text-right">
                    <span className="block text-[10px] font-semibold text-[#55786e]">
                      Proposed designation
                    </span>
                    <span className="mt-0.5 block text-xs font-bold leading-snug text-[#1b4d46]">
                      {member.designation}
                    </span>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3.5">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(140px,0.72fr)_minmax(0,1.28fr)] sm:gap-3">
                    <dt className="text-xs font-bold leading-snug text-[#345b57]">
                      Skills and learning focus
                    </dt>
                    <dd className="text-xs leading-[1.6] text-[#40545e]">{member.skills}</dd>
                  </div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(140px,0.72fr)_minmax(0,1.28fr)] sm:gap-3">
                    <dt className="text-xs font-bold leading-snug text-[#345b57]">
                      Practical responsibilities
                    </dt>
                    <dd className="text-xs leading-[1.6] text-[#40545e]">
                      {member.responsibilities}
                    </dd>
                  </div>
                  {!compactMode && (
                    <>
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(140px,0.72fr)_minmax(0,1.28fr)] sm:gap-3">
                        <dt className="text-xs font-bold leading-snug text-[#345b57]">
                          Expected deliverables
                        </dt>
                        <dd className="text-xs leading-[1.6] text-[#40545e]">
                          {member.deliverables}
                        </dd>
                      </div>
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(140px,0.72fr)_minmax(0,1.28fr)] sm:gap-3">
                        <dt className="text-xs font-bold leading-snug text-[#345b57]">
                          Professional objectives
                        </dt>
                        <dd className="text-xs leading-[1.6] text-[#40545e]">
                          {member.objectives}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <SectionReveal delay={0.1}>
          <p className="mt-6 rounded-[4px] border border-[#aac2b6] bg-[#cadbd3] px-4 py-3 text-xs leading-[1.65] text-[#253f44]">
            Skills are role-aligned focus areas, not verified qualifications. Responsibilities,
            deliverables and professional objectives are proposed plans, not claims of completed
            work.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
