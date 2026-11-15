import { useState } from 'react';
import { BRAND_LOGO_SRC } from '../data/nexaerpData';

export function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-[#0a2232] text-[#e4eeea]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-4 px-4 py-6 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-6 lg:gap-9 lg:px-8 md:min-h-[108px]">
        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start">
          <a
            href="#home"
            aria-label="NexaERP AI, back to top"
            className="inline-flex shrink-0 items-center rounded-[3px] bg-white px-2 py-1"
          >
            {logoError ? (
              <span className="font-display text-sm font-bold tracking-tight text-[#102d40]">
                NexaERP <span className="text-[#087c72]">AI</span>
              </span>
            ) : (
              <img
                src={BRAND_LOGO_SRC}
                alt="NexaERP AI"
                width={100}
                height={46}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="block h-[38px] sm:h-[42px] w-[86px] sm:w-[92px] object-contain"
              />
            )}
          </a>

          <a
            href="#home"
            className="inline-flex sm:hidden min-h-[44px] items-center text-xs font-medium text-[#dce9e5] underline decoration-1 underline-offset-4 whitespace-nowrap shrink-0 hover:text-[#9ee2cf]"
          >
            Back to top
          </a>
        </div>

        <p className="max-w-[590px] text-xs leading-[1.6] text-[#bfd0cb]">
          A proposed student venture. This website presents a project concept, not a commercially
          available ERP service. Contact:{' '}
          <a
            href="mailto:nexaerpcorps@gmail.com"
            className="text-[#dce9e5] underline decoration-1 underline-offset-4 hover:text-[#9ee2cf]"
          >
            nexaerpcorps@gmail.com
          </a>
        </p>

        <a
          href="#home"
          className="hidden sm:inline-flex min-h-[44px] items-center justify-self-end text-xs font-medium text-[#dce9e5] underline decoration-1 underline-offset-4 whitespace-nowrap shrink-0 hover:text-[#9ee2cf]"
        >
          Back to top
        </a>
      </div>
    </footer>
  );
}
