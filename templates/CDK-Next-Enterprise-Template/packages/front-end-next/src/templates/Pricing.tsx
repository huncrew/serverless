import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { PricingInformation } from '@/features/billing/PricingInformation';
import { Section } from '@/features/landing/Section';
import { PLAN_ID } from '@/utils/AppConfig';

type PricingProps = {
  namespace: string;
};

const Pricing = ({ namespace }: PricingProps) => {
  const t = useTranslations(namespace);

  return (
    <Section
      subtitle={t('Pricing.section_subtitle')}
      title={t('Pricing.section_title')}
      description={t('Pricing.section_description')}
    >
      <PricingInformation
        namespace={namespace}
        buttonList={{
          [PLAN_ID.FREE]: (
            <Link
              className={buttonVariants({
                size: 'sm',
                className: 'mt-5 w-full',
              })}
              href="/sign-up"
            >
              {t('Pricing.button_text')}
            </Link>
          ),
          [PLAN_ID.PREMIUM]: (
            <Link
              className={buttonVariants({
                size: 'sm',
                className: 'mt-5 w-full',
              })}
              href="/sign-up"
            >
              {t('Pricing.button_text')}
            </Link>
          ),
          [PLAN_ID.ENTERPRISE]: (
            <Link
              className={buttonVariants({
                size: 'sm',
                className: 'mt-5 w-full',
              })}
              href="/sign-up"
            >
              {t('Pricing.button_text')}
            </Link>
          ),
        }}
      />
    </Section>
  );
};

export { Pricing };
