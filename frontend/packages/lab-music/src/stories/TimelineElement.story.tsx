import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {default as defaultStore, injectSlice, RootStateProvider, useAppDispatch} from '@code-dot-org/redux';

import {TimelineElement, TimelineElementProps} from '@lab-music/.';
import {musicSlice} from '@lab-music/redux';

injectSlice(musicSlice, defaultStore);

export default {
  title: 'Labs/Music/TimelineElement',
  component: TimelineElement,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: Theme;
  isPlaying?: boolean;
  selectedBlockId?: string;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  isPlaying,
  selectedBlockId,
  children,
}) => {
  const dispatch = useAppDispatch();
  dispatch(musicSlice.actions.setIsPlaying(isPlaying || false));
  // Ensure we 'unselect' any prior state
  dispatch(musicSlice.actions.selectBlockId('bogus'));
  dispatch(musicSlice.actions.selectBlockId(selectedBlockId || 'bogus'));
  useTheme().setTheme(theme || 'Light');
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & TimelineElementProps> = ({
  theme,
  isPlaying,
  selectedBlockId,
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
        <Wrapper
          theme={theme}
          isPlaying={isPlaying}
          selectedBlockId={selectedBlockId}
        >
          <TimelineElement
            {...args}
          />
        </Wrapper>
      </RootStateProvider>
    </ThemeProvider>
  </div>
);

const defaultArgs: TimelineElementProps = {
  eventData: {
    type: 'sound',
    when: 1,
    triggered: false,
    length: 4,
    blockId: 'block',
    id: 'block',
  },
  barWidth: 80,
  height: 20,
  top: 0,
  left: 0,
};

export const Default = Template.bind({});
Default.args = {
  ...defaultArgs,
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const Selected = Template.bind({});
Selected.args = {
  ...defaultArgs,
  selectedBlockId: defaultArgs.eventData.blockId,
};

export const SelectedDark = Template.bind({});
SelectedDark.args = {
  theme: 'Dark',
  ...Selected.args,
};

export const Playing = Template.bind({});
Playing.args = {
  ...defaultArgs,
  isPlaying: true,
};

export const PlayingDark = Template.bind({});
PlayingDark.args = {
  theme: 'Dark',
  ...Playing.args,
};

export const PlayingSelected = Template.bind({});
PlayingSelected.args = {
  ...defaultArgs,
  isPlaying: true,
  selectedBlockId: defaultArgs.eventData.blockId,
};

export const PlayingSelectedDark = Template.bind({});
PlayingSelectedDark.args = {
  theme: 'Dark',
  ...PlayingSelected.args,
};
