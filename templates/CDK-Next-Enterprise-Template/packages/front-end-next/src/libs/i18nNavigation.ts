import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import { AllLocales } from '@/utils/AppConfig';

export const { usePathname, useRouter } = createSharedPathnamesNavigation({
  locales: AllLocales,
  localePrefix: 'as-needed',
});
