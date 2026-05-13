import React from 'react';

import AccountCard from './AccountCard';

export default {
  component: AccountCard,
};

export const BasicAccountCard = () => (
  <AccountCard
    id="test-card"
    icon="user"
    title="Test Title"
    content="This is the content of the card."
    buttonText="Click Me"
    variant="contained"
    onClick={() => {}}
  />
);

export const AccountCardSecondaryButton = () => (
  <AccountCard
    id="test-card"
    icon="user"
    title="Test Title"
    content="This is the content of the card."
    buttonText="Click Me"
    variant="outlined"
    onClick={() => {}}
  />
);

export const AccountCardIconList = () => (
  <AccountCard
    id="test-card"
    icon="user"
    title="Test Title"
    content="This is the content of the card."
    buttonText="Click Me"
    variant="contained"
    iconList={['First item', 'Second item', 'Third item']}
    onClick={() => {}}
  />
);
