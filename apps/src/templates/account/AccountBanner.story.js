import React from 'react';

import AccountBanner from './AccountBanner';

export default {
  component: AccountBanner,
};

export const BasicAccountBanner = () => (
  <AccountBanner
    heading="Heading"
    desc="This is a description."
    showLogo={true}
  />
);

export const AccountBannerWithoutLogo = () => (
  <AccountBanner heading="Heading" desc="This is a description." />
);
