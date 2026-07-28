import {useMemo} from 'react';

import Header from '@code-dot-org/component-library/header';

import {useAuth} from '@/modules/auth';

import {
  BRAND_NAME,
  buildMarketingGlobalNav,
  buildSupportLinks,
  CREATE_MENU_ITEMS,
  GLOBAL_NAV,
  LOGO_IMAGE_URL,
  STUDENT_MENU_ITEMS,
  TEACHER_MENU_ITEMS,
} from './config';

/** Studio site header: maps auth state to the component-library Header. */
export default function SiteHeader() {
  const auth = useAuth();
  const userType = auth.status === 'signed-in' ? auth.user_type : undefined;
  // App nav is signed-in only; signed-out (and pre-auth) shows no app nav — the
  // marketing nav lives in globalNavItems / the hamburger.
  const menuItems = !userType
    ? []
    : userType === 'teacher'
      ? TEACHER_MENU_ITEMS
      : STUDENT_MENU_ITEMS;
  const supportLinks = useMemo(() => buildSupportLinks(userType), [userType]);

  // Signed-out always gets the marketing nav; signed-in nav is unaffected.
  const marketingNav = !userType;
  const globalNavItems = useMemo(
    () => (marketingNav ? buildMarketingGlobalNav() : GLOBAL_NAV),
    [marketingNav],
  );

  return (
    <Header
      logoImageUrl={LOGO_IMAGE_URL}
      brandName={BRAND_NAME}
      menuItems={menuItems}
      userAuth={auth}
      createMenuItems={CREATE_MENU_ITEMS}
      globalNavItems={globalNavItems}
      supportLinks={supportLinks}
      marketingNav={marketingNav}
    />
  );
}
