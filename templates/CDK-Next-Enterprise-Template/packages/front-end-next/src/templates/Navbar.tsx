// src/templates/Navbar.tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { buttonVariants } from '@/components/ui/button';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';

import { Logo } from './Logo';

type NavbarProps = {
  namespace: string;
};

const Navbar = ({ namespace }: NavbarProps) => {
  const t = useTranslations(namespace);
  console.log('hello',process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <Section className="px-3 py-6">
      <CenteredMenu
        logo={<Logo />}
        rightMenu={
          <>
            <li>
              <LocaleSwitcher />
            </li>
            <li>
              <Link href="/sign-in">{t('Navbar.sign_in')}</Link>
            </li>
            <li>
              <Link className={buttonVariants()} href="/sign-up">
                {t('Navbar.sign_up')}
              </Link>
            </li>
          </>
        }
      >
        {/* <li>
          <Link href="/">{t('Navbar.product')}</Link>
        </li> */}
{/* 
        <li>
          <Link href="/">{t('Navbar.docs')}</Link>
        </li> */}

        {/* <li>
          <Link href="/">{t('Navbar.blog')}</Link>
        </li> */}

        {/* <li>
          <Link href="/">{t('Navbar.community')}</Link>
        </li> */}

        {/* <li>
          <Link href="/">{t('Navbar.company')}</Link>
        </li> */}
      </CenteredMenu>
    </Section>
  );
};

export { Navbar };
