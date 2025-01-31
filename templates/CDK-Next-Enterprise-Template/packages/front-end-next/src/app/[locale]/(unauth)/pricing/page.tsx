"use client";
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PriceId } from '@/components/CheckoutForm';
import { buttonVariants } from '@/components/ui/button';
import { PricingInformation } from '@/features/billing/PricingInformation';
import { Section } from '@/features/landing/Section';
import { PLAN_ID } from '@/utils/AppConfig';
import { Navbar } from '@/templates/Navbar';
import CheckoutForm from '@/components/CheckoutForm'; // Import the checkout form
import { useUser } from '@clerk/nextjs';


const Pricing: React.FC = () => {
  console.log('Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const { user } = useUser();

  if (user) {
    console.log('user???', user.id);
  }
  
  const namespace = 'CustomerFeedback'; // Define internally
  const t = useTranslations(namespace);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<PriceId | null>(null);

  const handleCheckout = (priceId: PriceId) => {
    setSelectedPriceId(priceId);
    setShowCheckout(true);
  };

  return (
    <>
      <Navbar namespace={namespace} />
      <Section
        subtitle={t('Pricing.section_subtitle')}
        title={t('Pricing.section_title')}
        description={t('Pricing.section_description')}
      >
        {showCheckout && selectedPriceId ? (
          <CheckoutForm priceId={selectedPriceId} />
        ) : (
          <PricingInformation
            namespace={namespace}
            buttonList={{
              [PLAN_ID.FREE]: (
                <button
                  className={buttonVariants({
                    size: 'sm',
                    className: 'mt-5 w-full',
                  })}
                  onClick={() => handleCheckout('price_1Pk2KQAKEBrNWdgLh7EAInYi')} 
                >
                  {t('Pricing.button_text')}
                </button>
              ),
              [PLAN_ID.PREMIUM]: (
                <button
                  className={buttonVariants({
                    size: 'sm',
                    className: 'mt-5 w-full',
                  })}
                  onClick={() => handleCheckout('price_1Pk2KuAKEBrNWdgL2qcoN3xI')}
                >
                  {t('Pricing.button_text')}
                </button>
              ),
              [PLAN_ID.ENTERPRISE]: (
                <button
                  className={buttonVariants({
                    size: 'sm',
                    className: 'mt-5 w-full',
                  })}
                  onClick={() => handleCheckout('price_1Pk2L9AKEBrNWdgLwi7JxWxU')}
                >
                  {t('Pricing.button_text')}
                </button>
              ),
            }}
          />
        )}
      </Section>
    </>
  );
};

export default Pricing;
