import '@/styles/global.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { ClerkProvider } from '@clerk/nextjs';
import { enUS, frFR } from '@clerk/localizations';
import { AllLocales, AppConfig } from '@/utils/AppConfig';

export const metadata: Metadata = {
  icons: [
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png' },
    { rel: 'icon', url: '/favicon.ico' },
  ],
};

export default function RootLayout(props: { children: React.ReactNode; params: { locale: string } }) {
  const { children, params } = props;
  const { locale } = params;

  // Validate the incoming `locale` parameter
  if (!AllLocales.includes(locale)) notFound();

  // Determine Clerk localization and URLs based on locale
  const clerkLocale = locale === 'fr' ? frFR : enUS;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/dashboard';

  if (locale !== AppConfig.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    dashboardUrl = `/${locale}${dashboardUrl}`;
  }

  // Using internationalization in Client Components
  const messages = useMessages();

  return (
    <html lang={locale}>
      <body className="bg-background text-foreground antialiased">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          localization={clerkLocale}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={dashboardUrl}
          signUpFallbackRedirectUrl={dashboardUrl}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
