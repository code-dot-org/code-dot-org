import React from 'react';
import Button from './Button';
import {action} from '@storybook/addon-actions';

export default {
  title: 'Button',
  component: Button,
};

export const ButtonSizes = () => (
  <div>
    {Object.values(Button.ButtonSize).map(size => (
      <Button
        __useDeprecatedTag
        size={size}
        text={size}
        href="/foo/bar"
        style={{margin: 2}}
        key={size}
      />
    ))}
  </div>
);

export const ButtonColors = () => (
  <div>
    {Object.values(Button.ButtonColor).map(color => (
      <Button
        __useDeprecatedTag
        color={color}
        text={color}
        href="/foo/bar"
        style={{margin: 2}}
        key={color}
      />
    ))}
  </div>
);

export const DisabledButtons = () => (
  <div>
    {Object.values(Button.ButtonColor).map(color => (
      <Button
        __useDeprecatedTag
        disabled
        color={color}
        text={color}
        href="/foo/bar"
        style={{margin: 2}}
        key={color}
      />
    ))}
  </div>
);

export const ButtonsWithIcons = () => (
  <div>
    {Object.values(Button.ButtonSize).map(size => (
      <div key={`${size}-row`}>
        {Object.values(Button.ButtonColor).map(color => (
          <Button
            __useDeprecatedTag
            icon="file-text"
            size={size}
            color={color}
            text={color}
            href="/foo/bar"
            style={{margin: 2}}
            key={`${size}-${color}`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const ButtonWithHref = () => (
  <Button __useDeprecatedTag href="/foo/bar" text="Batman & Robin" />
);

export const ButtonStyledAsText = () => (
  <Button styleAsText={true} text="Batman & Robin" onClick={action('click')} />
);

export const ButtonWithOnClick = () => (
  <Button __useDeprecatedTag onClick={action('click')} text="Batman & Robin" />
);

export const OrangeButtonWithStyledIcon = () => (
  <Button
    __useDeprecatedTag
    href="/foo/bar"
    color={Button.ButtonColor.brandSecondaryDefault}
    icon="caret-down"
    iconStyle={{fontSize: 24, position: 'relative', top: 3}}
    text="Assign Course"
  />
);

export const PendingButton = () => (
  <Button
    __useDeprecatedTag
    href="/foo/bar"
    size={Button.ButtonSize.large}
    text="Continue"
    isPending={true}
    pendingText="Pending..."
  />
);
