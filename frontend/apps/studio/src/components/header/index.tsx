import {useMemo} from 'react';

import Header from '@code-dot-org/component-library/header';

import {useAuth} from '@/modules/auth';

import {
  BRAND_NAME,
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

  return (
    <Header
      logoImageUrl={LOGO_IMAGE_URL}
      brandName={BRAND_NAME}
      menuItems={menuItems}
      userAuth={auth}
      createMenuItems={
        auth.status === 'signed-in' ? CREATE_MENU_ITEMS : undefined
      }
      globalNavItems={GLOBAL_NAV}
      supportLinks={supportLinks}
    />
  );
}
