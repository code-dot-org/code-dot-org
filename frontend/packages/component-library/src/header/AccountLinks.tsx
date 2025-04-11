import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {LinkButton} from '@/button';

import moduleStyles from './header.module.scss';

export interface AccountLinksProps extends HTMLAttributes<HTMLElement> {
  /** Sign In button */
  signIn: {
    label: string;
    href: string;
  };
  /** Create Account button */
  createAccount: {
    label: string;
    href: string;
  };
  /** Go to Dashboard button */
  goToDashboard: {
    label: string;
    href: string;
  };
  /** Is user logged in */
  isLoggedIn: boolean;
}

const AccountLinks: React.FC<AccountLinksProps> = ({
  signIn,
  createAccount,
  goToDashboard,
  isLoggedIn = false,
}) => {
  return (
    <>
      <LinkButton
        text={signIn.label || 'Sign In'}
        className={classNames(moduleStyles.signIn)}
        type="secondary"
        href={signIn.href}
        size="s"
        color="white"
      />
      <LinkButton
        text={createAccount.label || 'Create Account'}
        className={classNames(moduleStyles.createAccount)}
        type="primary"
        href={createAccount.href}
        size="s"
        color="white"
      />
      {!isLoggedIn && (
        <LinkButton
          text={goToDashboard.label || 'Go to Dashboard'}
          className={classNames(moduleStyles.goToDashboard)}
          type="primary"
          href={goToDashboard.href}
          size="s"
          color="white"
          iconRight={{
            iconName: 'arrow-right-to-line',
            iconStyle: 'solid',
          }}
        />
      )}
    </>
  );
};

export default AccountLinks;
