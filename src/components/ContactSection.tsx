import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Info, Mail } from 'lucide-react';
import { EASE_OUT_EXPO, SectionReveal } from './MotionPrimitives';

const CONTACT_EMAIL = 'nexaerpcorps@gmail.com';

type ContactTab = 'email' | 'privacy' | 'scope';

const CONTACT_DETAILS: Record<
  ContactTab,
  { heading: string; body: string }
> = {
  email: {
    heading: 'Reach the team by email',
    body: 'Questions, workflow feedback, or collaboration notes regarding the NexaERP AI student venture concept can be sent directly to our team inbox.',
  },
  privacy: {
    heading: 'No web form submissions or record storage',
    body: 'This website does not submit or store inquiries. Please do not share passwords, financial records or sensitive business information.',
  },
  scope: {
    heading: 'Concept scope boundaries',
    body: 'The proposed MVP excludes payroll, tax filing, bank or payment processing, autonomous purchasing, complex manufacturing, credit decisions and model training.',
  },
};

export function ContactSection() {
  const [activeTab, setActiveTab] = useState<ContactTab>('email');
  const [copied, setCopied] = useState(false);
  const activeDetail = CONTACT_DETAILS[activeTab];

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative bg-[#102d40] py-14 sm:py-20 lg:py-26 text-white scroll-mt-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wide text-[#9cdbc4]">Contact</p>
              <h2
                id="contact-title"
                className="max-w-[540px] text-[clamp(1.75rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.04em] text-white text-balance"
              >
                Help shape the idea.
              </h2>
              <p className="mt-4 sm:mt-5 max-w-[445px] text-[15px] leading-[1.7] text-[#d6e2df]">
                NexaERP AI is still a student project concept. Reach the team directly via email to
                share feedback or discuss the proposal.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[4px] bg-[#eff8f2] px-4 py-2.5 text-sm font-bold text-[#0a2232] whitespace-nowrap shrink-0 transition-colors hover:bg-[#c7e9dc]"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{CONTACT_EMAIL}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={copied ? 'Email address copied' : 'Copy contact email address'}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[4px] border border-white/25 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-[#e6f4ef] whitespace-nowrap shrink-0 transition-colors hover:bg-white/[0.14] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#81d1b8]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              {/* Interactive factual reference switcher */}
              <div
                role="group"
                aria-label="Project notice details"
                className="mb-3 grid grid-cols-3 sm:inline-flex gap-1 rounded-[4px] border border-white/20 bg-white/[0.05] p-1 w-full sm:w-auto"
              >
                {(
                  [
                    { id: 'email', label: 'Team contact' },
                    { id: 'privacy', label: 'Privacy notice' },
                    { id: 'scope', label: 'MVP exclusions' },
                  ] as const
                ).map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`min-h-[42px] sm:min-h-[36px] rounded-[3px] px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#eff8f2] text-[#0a2232]'
                          : 'text-[#d6e2df] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div
                aria-live="polite"
                className="grid grid-cols-[28px_1fr] gap-3.5 sm:gap-4 border border-white/25 bg-white/[0.06] p-4 sm:p-6 min-h-[132px]"
              >
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 place-items-center rounded-full border border-[#91cbb5] text-[#b8e4d3]"
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                  >
                    <h3 className="text-sm sm:text-base font-bold tracking-[-0.015em] text-white">
                      {activeDetail.heading}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#d0ddda]">
                      {activeDetail.body}
                    </p>
                    {activeTab === 'email' && (
                      <p className="mt-2 font-mono text-xs text-[#9cdbc4]">
                        {CONTACT_EMAIL}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <p className="mt-3.5 max-w-[560px] text-[11px] leading-[1.6] text-[#c0d0cc]">
                This website does not submit or store inquiries. Please do not share passwords,
                financial records or sensitive business information.
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
