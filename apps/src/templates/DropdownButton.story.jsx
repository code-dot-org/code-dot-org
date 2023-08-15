import React from 'react';
import DropdownButton from './DropdownButton';
import Button from '@cdo/apps/templates/Button';

export default {
  title: 'DropdownButton',
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
