import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';

import {Keybed, KeybedProps} from '@lab-music/.';

export default {
  title: 'Labs/Music/Keybed',
  component: Keybed,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: Theme;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  children,
}) => {
  useTheme().setTheme(theme || 'Light');
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & KeybedProps> = ({
  theme,
  ...args
}) => (
  <div style={{
    minHeight: '25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <ThemeProvider>
      <Wrapper theme={theme}>
        <Keybed
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

const defaultArgs: KeybedProps = {
  numOctaves: 1,
  startOctave: 1,
  selectedNotes: [],
  onPressKey: (note: number) => alert(`${note} note pressed`),
  isDisabled: false,
  isVertical: false,
};

export const OneOctave = Template.bind({});
OneOctave.args = {
  ...defaultArgs,
};

export const OneOctaveDark = Template.bind({});
OneOctaveDark.args = {
  theme: 'Dark',
  ...OneOctave.args,
};

export const OneOctaveWithSelected = Template.bind({});
OneOctaveWithSelected.args = {
  ...defaultArgs,
};

export const OneOctaveWithSelectedDark = Template.bind({});
OneOctaveWithSelectedDark.args = {
  theme: 'Dark',
  ...OneOctave.args,
  selectedNotes: [15, 17],
};

export const OneOctaveDisabled = Template.bind({});
OneOctaveDisabled.args = {
  ...defaultArgs,
  isDisabled: true,
};

export const OneOctaveDisabledDark = Template.bind({});
OneOctaveDisabledDark.args = {
  theme: 'Dark',
  ...OneOctaveDisabled.args,
};

export const OneOctaveVertical = Template.bind({});
OneOctaveVertical.args = {
  ...defaultArgs,
  isVertical: true,
};

export const OneOctaveVerticalDark = Template.bind({});
OneOctaveVerticalDark.args = {
  theme: 'Dark',
  ...OneOctaveVertical.args,
};

export const OneOctaveVerticalWithSelected = Template.bind({});
OneOctaveVerticalWithSelected.args = {
  ...defaultArgs,
  ...OneOctaveWithSelected.args,
  isVertical: true,
};

export const OneOctaveVerticalWithSelectedDark = Template.bind({});
OneOctaveVerticalWithSelectedDark.args = {
  theme: 'Dark',
  ...OneOctaveVerticalWithSelected.args,
};

export const OneOctaveVerticalDisabled = Template.bind({});
OneOctaveVerticalDisabled.args = {
  ...defaultArgs,
  isDisabled: true,
  isVertical: true,
};

export const OneOctaveVerticalDisabledDark = Template.bind({});
OneOctaveVerticalDisabledDark.args = {
  theme: 'Dark',
  ...OneOctaveVerticalDisabled.args,
};

export const TwoOctave = Template.bind({});
TwoOctave.args = {
  ...defaultArgs,
  numOctaves: 2,
};

export const TwoOctaveDark = Template.bind({});
TwoOctaveDark.args = {
  theme: 'Dark',
  ...TwoOctave.args,
};

export const TwoOctaveWithSelected = Template.bind({});
TwoOctaveWithSelected.args = {
  ...defaultArgs,
  numOctaves: 2,
  selectedNotes: [15, 16, 25],
};

export const TwoOctaveWithSelectedDark = Template.bind({});
TwoOctaveWithSelectedDark.args = {
  theme: 'Dark',
  ...TwoOctaveWithSelected.args,
};

export const TwoOctaveShifted = Template.bind({});
TwoOctaveShifted.args = {
  ...defaultArgs,
  numOctaves: 2,
  startOctave: 2,
};

export const TwoOctaveShiftedDark = Template.bind({});
TwoOctaveShiftedDark.args = {
  theme: 'Dark',
  ...TwoOctaveShifted.args,
};

export const TwoOctaveDisabled = Template.bind({});
TwoOctaveDisabled.args = {
  ...defaultArgs,
  numOctaves: 2,
  isDisabled: true,
};

export const TwoOctaveDisabledDark = Template.bind({});
TwoOctaveDisabledDark.args = {
  theme: 'Dark',
  ...TwoOctaveDisabled.args,
};

export const TwoOctaveVertical = Template.bind({});
TwoOctaveVertical.args = {
  ...defaultArgs,
  numOctaves: 2,
  isVertical: true,
};

export const TwoOctaveVerticalDark = Template.bind({});
TwoOctaveVerticalDark.args = {
  theme: 'Dark',
  ...TwoOctaveVertical.args,
};

export const TwoOctaveVerticalWithSelected = Template.bind({});
TwoOctaveVerticalWithSelected.args = {
  ...defaultArgs,
  numOctaves: 2,
  selectedNotes: [15, 16, 25],
  isVertical: true,
};

export const TwoOctaveVerticalWithSelectedDark = Template.bind({});
TwoOctaveVerticalWithSelectedDark.args = {
  theme: 'Dark',
  ...TwoOctaveVerticalWithSelected.args,
};

export const TwoOctaveVerticalShifted = Template.bind({});
TwoOctaveVerticalShifted.args = {
  ...defaultArgs,
  numOctaves: 2,
  startOctave: 2,
  isVertical: true,
};

export const TwoOctaveVerticalShiftedDark = Template.bind({});
TwoOctaveVerticalShiftedDark.args = {
  theme: 'Dark',
  ...TwoOctaveVerticalShifted.args,
};

export const TwoOctaveVerticalDisabled = Template.bind({});
TwoOctaveVerticalDisabled.args = {
  ...defaultArgs,
  numOctaves: 2,
  isDisabled: true,
  isVertical: true,
};

export const TwoOctaveVerticalDisabledDark = Template.bind({});
TwoOctaveVerticalDisabledDark.args = {
  theme: 'Dark',
  ...TwoOctaveVerticalDisabled.args,
};
