import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {default as defaultStore, injectSlice, RootStateProvider, useAppDispatch} from '@code-dot-org/redux';

import {BeatPad, BeatPadProps} from '@lab-music/.';
import {musicSlice} from '@lab-music/redux';

injectSlice(musicSlice, defaultStore);

export default {
  title: 'Labs/Music/BeatPad',
  component: BeatPad,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: Theme;
  isPlaying?: boolean;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  isPlaying,
  children,
}) => {
  const dispatch = useAppDispatch();
  dispatch(musicSlice.actions.setIsPlaying(isPlaying || false));
  useTheme().setTheme(theme || 'Light');
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & BeatPadProps> = ({
  theme,
  isPlaying,
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
      <RootStateProvider>
        <Wrapper theme={theme} isPlaying={isPlaying}>
          <BeatPad
            {...args}
          />
        </Wrapper>
      </RootStateProvider>
    </ThemeProvider>
  </div>
);

const defaultArgs: BeatPadProps = {
  triggers: [],
  playTrigger: (id: string) => alert(`playing trigger ${id}`),
};

export const NoTriggers = Template.bind({});
NoTriggers.args = {
  ...defaultArgs,
};

export const NoTriggersDark = Template.bind({});
NoTriggersDark.args = {
  theme: 'Dark',
  ...NoTriggers.args,
};

export const NoTriggersPlaying = Template.bind({});
NoTriggers.args = {
  ...NoTriggers.args,
  isPlaying: true,
};

export const NoTriggersPlayingDark = Template.bind({});
NoTriggersPlayingDark.args = {
  theme: 'Dark',
  ...NoTriggersPlaying.args,
};

export const OneTrigger = Template.bind({});
OneTrigger.args = {
  ...defaultArgs,
  triggers: [{
    id: 'my-trigger',
    dropdownLabel: 'My Trigger',
    buttonLabel: '1',
    keyboardKey: '1',
  }],
};

export const OneTriggerDark = Template.bind({});
OneTriggerDark.args = {
  theme: 'Dark',
  ...OneTrigger.args,
};

export const OneTriggerPlaying = Template.bind({});
OneTriggerPlaying.args = {
  ...OneTrigger.args,
  isPlaying: true,
};

export const OneTriggerPlayingDark = Template.bind({});
OneTriggerPlayingDark.args = {
  theme: 'Dark',
  ...OneTriggerPlaying.args,
};

export const TwoTriggers = Template.bind({});
TwoTriggers.args = {
  ...defaultArgs,
  triggers: [{
    id: 'my-trigger',
    dropdownLabel: 'My Trigger',
    buttonLabel: '1',
    keyboardKey: '1',
  },{
    id: 'my-second-trigger',
    dropdownLabel: 'My Second Trigger',
    buttonLabel: '2',
    keyboardKey: '2',
  }],
};

export const TwoTriggersDark = Template.bind({});
TwoTriggersDark.args = {
  theme: 'Dark',
  ...TwoTriggers.args,
};

export const TwoTriggersPlaying = Template.bind({});
TwoTriggersPlaying.args = {
  ...TwoTriggers.args,
  isPlaying: true,
};

export const TwoTriggersPlayingDark = Template.bind({});
TwoTriggersPlayingDark.args = {
  theme: 'Dark',
  ...TwoTriggersPlaying.args,
};
