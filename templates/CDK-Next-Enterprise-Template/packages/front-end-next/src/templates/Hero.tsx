// src/templates/Hero.tsx
import { buttonVariants } from '@/components/ui/button';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';
import Link from 'next/link';

const Hero = () => {
  return (
    <Section className="py-36">
      <CenteredHero
        title={
          <>
            Transform your business with{' '}
            <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 bg-clip-text text-transparent">
              customer-led insights
            </span>
            .
          </>
        }
        description="Unlock customer insights to boost retention and increase conversion rates."
        buttons={
          <Link className={buttonVariants({ size: 'lg' })} href="/sign-up">
            Sign Up
          </Link>
        }
      />
    </Section>
  );
};

export { Hero };
