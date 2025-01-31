import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { CTABanner } from '@/features/landing/CTABanner';
import { Section } from '@/features/landing/Section';

type CTAProps = {
  namespace: string;
};

const CTA = ({ namespace }: CTAProps) => {
  const t = useTranslations(namespace);

  return (
    <Section>
      <CTABanner
        title={t('CTA.title')}
        description={t('CTA.description')}
        buttons={
          <>
            <Link className={buttonVariants({ size: 'lg' })} href="/sign-up">Sign up</Link>
          </>
        }
      />
    </Section>
  );
};

export { CTA };
