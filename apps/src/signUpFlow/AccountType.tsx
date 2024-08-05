import React from 'react';

import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
// import i18n from '@cdo/locale';

import './accountType.module.scss';

// import i18n from '@cdo/locale';

const AccountType: React.FunctionComponent = () => {
  return (
    <main>
      <AccountBanner
        heading="Create your free account"
        desc="Start creating your free account by selecting the account type that best matches your needs."
        showLogo={false}
      />
    </main>
  );
};

export default AccountType;
