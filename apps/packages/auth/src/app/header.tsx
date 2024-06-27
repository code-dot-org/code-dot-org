import React from 'react';

import {auth, signOut} from '@cdo/app/auth';
import LoginLogout from '@cdo/app/LoginLogout';

const Header = async () => {
  const session = await auth();

  return (
    <div className="header-wrapper">
      <div className="navbar-static-top header" dir="ltr">
        <div
          className="container"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            height: '50px',
          }}
        >
          <div className="header_left">
            <div className="header_logo">
              <a
                id="logo_home_link"
                href="//code.org"
                style={{display: 'block', width: 42, height: 42}}
              >
                <img
                  width={42}
                  height={42}
                  alt="logo"
                  src="https://studio.code.org/assets/logo-2acd4ebc69c447786b866b98034bb3c0777b5f67cd8bd7955e97bba0b16f2bd1.svg"
                />
              </a>
            </div>
          </div>
          {session?.user != null && (
            <div
              className="header_button header_user user_menu"
              id="header_user_menu"
              role="button"
            >
              <span
                className="display_name"
                data-id="78"
                data-shortname="Stephen"
                id="header_display_name"
              >
                {session?.user?.name}
              </span>
              &nbsp;
              <i
                className="user_menu_arrow_down fa fa-caret-down"
                style={{display: 'inline-block'}}
              />
            </div>
          )}
          <LoginLogout />
        </div>
      </div>
    </div>
  );
};

export default Header;
