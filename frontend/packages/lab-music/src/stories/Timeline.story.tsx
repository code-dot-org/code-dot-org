import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {default as defaultStore, injectSlice, RootStateProvider, useAppDispatch} from '@code-dot-org/redux';

import {Timeline, TimelineProps} from '@lab-music/.';
import {musicSlice} from '@lab-music/redux';

injectSlice(musicSlice, defaultStore);

export default {
  title: 'Labs/Music/Timeline',
  component: Timeline,
  parameters: {
    layout: 'fullscreen',
  },
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
const Template: StoryFn<WrapperProps & TimelineProps> = ({
  theme,
  isPlaying,
  selectedBlockId,
  ...args
}) => (
  <ThemeProvider>
    <div style={{
      width: '100vw',
      height: '25rem',
      maxHeight: '100%',
    }}>
      <RootStateProvider>
        <Wrapper
          theme={theme}
          isPlaying={isPlaying}
          selectedBlockId={selectedBlockId}
        >
          <Timeline
            {...args}
          />
        </Wrapper>
      </RootStateProvider>
    </div>
  </ThemeProvider>
);

const defaultArgs: TimelineProps = {
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

export const PredictLevel = Template.bind({});
PredictLevel.args = {
  ...defaultArgs,
  isPredictLevel: true,
};

export const PredictLevelDark = Template.bind({});
PredictLevelDark.args = {
  theme: 'Dark',
  ...PredictLevel.args,
};

export const AllowChangingStartingPlayheadPosition = Template.bind({});
AllowChangingStartingPlayheadPosition.args = {
  ...defaultArgs,
  allowChangeStartingPlayheadPosition: true,
};

export const AllowChangingStartingPlayheadPositionDark = Template.bind({});
AllowChangingStartingPlayheadPositionDark.args = {
  theme: 'Dark',
  ...AllowChangingStartingPlayheadPosition.args,
};
