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
  const menuItems =
    userType === 'teacher' ? TEACHER_MENU_ITEMS : STUDENT_MENU_ITEMS;

  return (
    <Header
      logoImageUrl={LOGO_IMAGE_URL}
      brandName={BRAND_NAME}
      menuItems={menuItems}
      userAuth={auth}
      createMenuItems={CREATE_MENU_ITEMS}
      globalNavItems={GLOBAL_NAV}
      supportLinks={buildSupportLinks(userType)}
    />
  );
}
