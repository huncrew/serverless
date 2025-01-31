import { useTranslations } from 'next-intl';

import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';
import type { PlanId } from '@/types/Subscription';
import { PricingPlanList } from '@/utils/AppConfig';

type PricingInformationProps = {
  buttonList: Record<PlanId, React.ReactNode>;
  namespace: string;
};

const PricingInformation = ({ buttonList, namespace }: PricingInformationProps) => {
  const t = useTranslations(namespace);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3">
      {PricingPlanList.map((plan) => (
        <PricingCard
          namespace={namespace}
          key={plan.id}
          planId={plan.id}
          price={plan.price}
          interval={plan.interval}
          button={buttonList[plan.id]}
        >
          <PricingFeature>
            {t('PricingPlan.feature_team_member', {
              number: plan.features.teamMember,
            })}
          </PricingFeature>

          <PricingFeature>
            {t('PricingPlan.feature_website', {
              number: plan.features.website,
            })}
          </PricingFeature>

          <PricingFeature>
            {t('PricingPlan.feature_storage', {
              number: plan.features.storage,
            })}
          </PricingFeature>

          <PricingFeature>
            {t('PricingPlan.feature_transfer', {
              number: plan.features.transfer,
            })}
          </PricingFeature>

          <PricingFeature>{t('PricingPlan.feature_email_support')}</PricingFeature>
        </PricingCard>
      ))}
    </div>
  );
};

export { PricingInformation };
