import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';

import DropdownButton from './DropdownButton';

export default {
  component: DropdownButton,
};

export const OrangeDropdownButton = () => (
  <DropdownButton
    text="Assign unit"
    color={Button.ButtonColor.brandSecondaryDefault}
  >
    <a href="asdf">Child with href</a>
    <a onClick={() => console.log('click')}>Child with onClick</a>
  </DropdownButton>
);

export const BlueDropdownButton = () => (
  <DropdownButton text="Assign unit" color={Button.ButtonColor.blue}>
    <a href="asdf">Child with href</a>
    <a onClick={() => console.log('click')}>Child with onClick</a>
  </DropdownButton>
);
