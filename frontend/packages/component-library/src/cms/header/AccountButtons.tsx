import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {LinkButton, LinkButtonProps} from '@/button';

import moduleStyles from './header.module.scss';

export interface AccountButtonsProps extends HTMLAttributes<HTMLElement> {
  /** Sign In button */
  signIn: {
    /** Sign In button label */
    label: string;
    /** Sign In button href */
    href: string;
  };
  /** Create Account button */
  createAccount: {
    /** Create Account button label */
    label: string;
    /** Create Account button href */
    href: string;
  };
  /** Go to Dashboard button */
  goToDashboard: {
    /** Go to Dashboard button label */
    label: string;
    /** Go to Dashboard button href */
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
  const renderDashboardButton = () => (
    <LinkButton
      text={goToDashboard.label || 'Go to Dashboard'}
      className={classNames(
        isInHamburger ? moduleStyles.hamburger : moduleStyles.mainMenu,
        moduleStyles.goToDashboard,
      )}
      type="primary"
      href={goToDashboard.href}
      size="s"
      color={isInHamburger ? 'purple' : 'white'}
      iconRight={{
        iconName: 'arrow-right-to-line',
        iconStyle: 'solid',
      }}
    />
  );

  const renderSignInButtons = () => {
    const buttons = [
      {
        key: 'signIn',
        props: {
          text: signIn.label || 'Sign In',
          href: signIn.href,
          type: 'secondary',
          color: isInHamburger ? 'gray' : 'white',
          className: classNames(
            isInHamburger ? moduleStyles.hamburger : moduleStyles.mainMenu,
            moduleStyles.signIn,
          ),
        },
      },
      {
        key: 'createAccount',
        props: {
          text: createAccount.label || 'Create Account',
          href: createAccount.href,
          type: 'primary',
          color: isInHamburger ? 'purple' : 'white',
          className: classNames(
            isInHamburger ? moduleStyles.hamburger : moduleStyles.mainMenu,
            moduleStyles.createAccount,
          ),
        },
      },
    ];

    // Render Create Account first in the Hamburger menu
    // Doing it this way instead of with CSS for better accessibility
    const orderedButtons = isInHamburger ? buttons.reverse() : buttons;

    return (
      <>
        {orderedButtons.map(({key, props}) => (
          <LinkButton key={key} size="s" {...(props as LinkButtonProps)} />
        ))}
      </>
    );
  };

  return (
    <div className={moduleStyles.accountLinks}>
      {isLoggedIn ? renderDashboardButton() : renderSignInButtons()}
    </div>
  );
};

export default AccountButtons;
