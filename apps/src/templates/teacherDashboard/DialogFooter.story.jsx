import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';

import DialogFooter from './DialogFooter';

export default {
  name: 'DialogFooter',
  component: DialogFooter,
};

const OneButtonTemplate = args => (
  <DialogFooter {...args}>
    <Button
      __useDeprecatedTag
      href="#"
      text="Cancel"
      size={Button.ButtonSize.large}
      color={Button.ButtonColor.gray}
    />
  </DialogFooter>
);

export const OneButtonDefaultAlign = OneButtonTemplate.bind({});
OneButtonDefaultAlign.args = {};

export const OneButtonRightAligned = OneButtonTemplate.bind({});
OneButtonRightAligned.args = {rightAlign: true};

export const TwoButtons = () => (
  <DialogFooter>
    <Button
      __useDeprecatedTag
      href="#"
      text="Cancel"
      size={Button.ButtonSize.large}
      color={Button.ButtonColor.gray}
    />
    <Button
      __useDeprecatedTag
      href="#"
      text="Continue"
      size={Button.ButtonSize.large}
    />
  </DialogFooter>
);

export const ButtonGroups = () => (
  <DialogFooter>
    <div>
      <Button
        __useDeprecatedTag
        href="#"
        text="Cancel"
        size={Button.ButtonSize.large}
        color={Button.ButtonColor.gray}
      />
    </div>
    <div>
      <Button
        __useDeprecatedTag
        href="#"
        text="One Fish"
        size={Button.ButtonSize.large}
      />
      <Button
        __useDeprecatedTag
        href="#"
        text="Two Fish"
        size={Button.ButtonSize.large}
        style={{marginLeft: 4}}
      />
    </div>
  </DialogFooter>
);

export const OtherContent = () => (
  <DialogFooter>
    <em>The road to ruin is paved with good intentions.</em>
  </DialogFooter>
);
