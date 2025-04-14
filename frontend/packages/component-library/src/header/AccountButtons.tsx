import {HTMLAttributes} from 'react';

import {LinkButton} from '@/button';

import moduleStyles from './header.module.scss';

export interface AccountButtonsProps extends HTMLAttributes<HTMLElement> {
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
  /** Is button in Hamburger Menu */
  isInHamburger: boolean;
}

const AccountButtons: React.FC<AccountButtonsProps> = ({
  signIn,
  createAccount,
  goToDashboard,
  isLoggedIn = false,
  isInHamburger,
}) => {
  return (
    <div className={moduleStyles.accountLinks}>
      {isLoggedIn ? (
        <LinkButton
          text={goToDashboard.label || 'Go to Dashboard'}
          className={isInHamburger ? '' : moduleStyles.goToDashboard}
          type="primary"
          href={goToDashboard.href}
          size="s"
          color={isInHamburger ? 'purple' : 'white'}
          iconRight={{
            iconName: 'arrow-right-to-line',
            iconStyle: 'solid',
          }}
        />
      ) : (
        <>
          <LinkButton
            text={signIn.label || 'Sign In'}
            className={isInHamburger ? '' : moduleStyles.signIn}
            type="secondary"
            href={signIn.href}
            size="s"
            color={isInHamburger ? 'gray' : 'white'}
          />
          <LinkButton
            text={createAccount.label || 'Create Account'}
            className={isInHamburger ? '' : moduleStyles.createAccount}
            type="primary"
            href={createAccount.href}
            size="s"
            color={isInHamburger ? 'purple' : 'white'}
          />
        </>
      )}
    </div>
  );
};

export default AccountButtons;
