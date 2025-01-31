import Image from 'next/image';

import { LogoCloud } from '@/features/landing/LogoCloud';
import { Section } from '@/features/landing/Section';

const Sponsors = () => (
  <Section>
    <LogoCloud text="Trusted  by">
    <a href="https://glossier.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/assets/images/glossier-seeklogo.svg"
            alt="Warby Parker"
            width="128"
            height="40"
          />
        </a>

        <a href="https://monday.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/assets/images/monday-seeklogo.svg"
            alt="Sweetgreen"
            width="128"
            height="40"
          />
        </a>

        <a href="https://ford.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/assets/images/ford-seeklogo.svg"
            alt="Casper"
            width="128"
            height="40"
          />
        </a>

        <a href="https://allbirds.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/assets/images/allbirds-seeklogo.svg"
            alt="Allbirds"
            width="128"
            height="40"
          />
        </a>

        <a href="https://airtable.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/assets/images/airtable-seeklogo.svg"
            alt="Whole Foods Market"
            width="128"
            height="40"
          />
        </a>
      </LogoCloud>
    </Section>
  );

export { Sponsors };
