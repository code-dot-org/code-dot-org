import React from 'react';
import ManageLinkedAccounts from './ManageLinkedAccounts';

export default storybook => storybook
  .storiesOf('ManageLinkedAccounts', module)
  .add('default table', () => (<ManageLinkedAccounts />));
