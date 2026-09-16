import {useMemo} from 'react';

import Header from '@code-dot-org/component-library/header';

import {useAuth} from '@/modules/auth';

import {
  BRAND_NAME,
  buildCreateMenuItems,
  buildGlobalNav,
  buildMarketingGlobalNav,
  buildStudentMenuItems,
  buildSupportLinks,
  buildTeacherMenuItems,
  LOGO_IMAGE_URL,
} from './config';

/** Studio site header: maps auth state to the component-library Header. */
export default function SiteHeader() {
  const auth = useAuth();
  const userType = auth.status === 'signed-in' ? auth.user_type : undefined;
  // App nav is signed-in only; signed-out (and pre-auth) shows no app nav — the
  // marketing nav lives in globalNavItems / the hamburger.
  const menuItems = useMemo(
    () =>
      !userType
        ? []
        : userType === 'teacher'
          ? buildTeacherMenuItems()
          : buildStudentMenuItems(),
    [userType],
  );
  const supportLinks = useMemo(() => buildSupportLinks(userType), [userType]);
  const createMenuItems = useMemo(() => buildCreateMenuItems(), []);

  // Signed-out always gets the marketing nav; signed-in nav is unaffected.
  const marketingNav = !userType;
  const globalNavItems = useMemo(
    () => (marketingNav ? buildMarketingGlobalNav() : buildGlobalNav()),
    [marketingNav],
  );

  return (
    <Header
      logoImageUrl={LOGO_IMAGE_URL}
      brandName={BRAND_NAME}
      menuItems={menuItems}
      userAuth={auth}
      createMenuItems={createMenuItems}
      globalNavItems={globalNavItems}
      supportLinks={supportLinks}
      marketingNav={marketingNav}
    />
  );
}
