import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';

import {MusicRegistry, ChordPanel, ChordPanelProps} from '@lab-music/.';
import {MusicPlayer, MusicLibrary} from '@lab-music/player';

export default {
  title: 'Labs/Music/ChordPanel',
  component: ChordPanel,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: Theme;
}

MusicRegistry.player = new MusicPlayer();
MusicLibrary.loadLibrary('launch2024');

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
const Template: StoryFn<WrapperProps & ChordPanelProps> = ({
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
        <ChordPanel
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

const defaultArgs: ChordPanelProps = {
  initValue: {
    instrument: 'piano',
    notes: [],
    playStyle: 'together',
  },
  onChange: (_) => {},
};

export const Together = Template.bind({});
Together.args = {
  ...defaultArgs,
};

export const TogetherDark = Template.bind({});
TogetherDark.args = {
  theme: 'Dark',
  ...Together.args,
};

export const TogetherInitializedWithChord = Template.bind({});
TogetherInitializedWithChord.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    notes: [48, 52, 55],
  },
};

export const TogetherInitializedWithChordDark = Template.bind({});
TogetherInitializedWithChordDark.args = {
  theme: 'Dark',
  ...TogetherInitializedWithChord.args,
};

export const ArpeggioDown = Template.bind({});
ArpeggioDown.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    playStyle: 'arpeggio-down',
  },
};

export const ArpeggioDownDark = Template.bind({});
ArpeggioDownDark.args = {
  theme: 'Dark',
  ...ArpeggioDown.args,
};

export const ArpeggioDownInitializedWithChord = Template.bind({});
ArpeggioDownInitializedWithChord.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    notes: [48, 52, 55],
    playStyle: 'arpeggio-down',
  },
};

export const ArpeggioDownInitializedWithChordDark = Template.bind({});
ArpeggioDownInitializedWithChordDark.args = {
  theme: 'Dark',
  ...ArpeggioDownInitializedWithChord.args,
};

export const ArpeggioUp = Template.bind({});
ArpeggioUp.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    playStyle: 'arpeggio-up',
  },
};

export const ArpeggioUpDark = Template.bind({});
ArpeggioUpDark.args = {
  theme: 'Dark',
  ...ArpeggioUp.args,
};

export const ArpeggioUpInitializedWithChord = Template.bind({});
ArpeggioUpInitializedWithChord.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    notes: [48, 52, 55],
    playStyle: 'arpeggio-up',
  },
};

export const ArpeggioUpInitializedWithChordDark = Template.bind({});
ArpeggioUpInitializedWithChordDark.args = {
  theme: 'Dark',
  ...ArpeggioUpInitializedWithChord.args,
};

export const ArpeggioRandom = Template.bind({});
ArpeggioRandom.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    playStyle: 'arpeggio-random',
  },
};

export const ArpeggioRandomDark = Template.bind({});
ArpeggioRandomDark.args = {
  theme: 'Dark',
  ...ArpeggioRandom.args,
};

export const ArpeggioRandomInitializedWithChord = Template.bind({});
ArpeggioRandomInitializedWithChord.args = {
  ...defaultArgs,
  initValue: {
    ...defaultArgs.initValue,
    notes: [48, 52, 55],
    playStyle: 'arpeggio-random',
  },
};

export const ArpeggioRandomInitializedWithChordDark = Template.bind({});
ArpeggioRandomInitializedWithChordDark.args = {
  theme: 'Dark',
  ...ArpeggioRandomInitializedWithChord.args,
};
