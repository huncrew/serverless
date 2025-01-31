import { getTranslations } from 'next-intl/server';
import { CTABanner } from '@/features/landing/CTABanner';
import { FAQ } from '@/templates/FAQ';
import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';import { Footer } from '@/templates/Footer';
import { buttonVariants } from '@/components/ui/button';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';
import Link from 'next/link';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';
import { Sponsors } from '@/templates/Sponsors';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function IndexPage() {

  return (
    <>
      <Navbar namespace="CustomerFeedback"/>
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
      <Sponsors />
      <Background>
  <Section
    subtitle="Our Features"
    title="Why Choose Us?"
    description="Discover how our customer-led approach enhances your development process."
  >
    <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
      <FeatureCard
        icon={
          <svg
            className="stroke-green-600 stroke-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M2 12h20" />
          </svg>
        }
        title="Multi-Channel Collection"
      >
        Effortlessly gather feedback from various platforms to ensure you capture all customer insights.
      </FeatureCard>

      <FeatureCard
        icon={
          <svg
            className="stroke-green-600 stroke-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        }
        title="Customer-Led Development"
      >
        Our process focuses on understanding your needs, ensuring that development aligns with your vision.
      </FeatureCard>

      <FeatureCard
        icon={
          <svg
            className="stroke-green-600 stroke-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C8.69 2 5.5 4.69 5.5 8s3.19 6 6.5 6 6.5-2.69 6.5-6S15.31 2 12 2z" />
          </svg>
        }
        title="AI Analysis"
      >
        Leverage AI to transform feedback into actionable insights, enhancing your strategic decisions.
      </FeatureCard>

      <FeatureCard
        icon={
          <svg
            className="stroke-green-600 stroke-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h18M3 12h18M3 16h18" />
          </svg>
        }
        title="Intercom / Integrations"
      >
        Seamlessly integrate with tools like Intercom for improved communication and data collection.
      </FeatureCard>

      <FeatureCard
        icon={
          <svg
            className="stroke-green-600 stroke-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v10l4 4" />
          </svg>
        }
        title="AI Website Improvement"
      >
        Receive tailored recommendations based on website performance and user feedback to boost engagement.
      </FeatureCard>
      <FeatureCard
      icon={
        <svg
          className="stroke-green-600 stroke-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 10h-1a7 7 0 0 0-13.32-2.4A4.5 4.5 0 1 0 4 13H3a3 3 0 0 0 0 6h16a3 3 0 0 0 0-6z" />
        </svg>
      }
      title="CRM Integration"
    >
      Sync up your data with your favorite CRM.
    </FeatureCard>

    </div>
  </Section>
</Background>

      <Pricing namespace="CustomerFeedback" />
      <FAQ namespace="CustomerFeedback" />
      <Section>
      <CTABanner
        title='Ready to transform your business?'
        description='sign up today'
        buttons={
          <>
            <Link className={buttonVariants({ size: 'lg' })} href="/sign-up">Sign up</Link>
          </>
        }
      />
    </Section>
      <Footer namespace="CustomerFeedback" />
    </>
  );
}
