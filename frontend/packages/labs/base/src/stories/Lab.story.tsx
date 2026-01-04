import {Meta, StoryFn} from '@storybook/react';
import React, {lazy} from 'react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import MazeLevel from '@code-dot-org/lab-maze';

import {Lab, LabProps} from '@lab-base/components';

export default {
  title: 'Labs/Base/Lab',
  component: Lab,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: string;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  children,
}) => {
  useTheme().setTheme(theme || 'Light');
  return children;
};

const birdsLevelData: LevelData<MazeData> = {
  key: 'birds-level',
  type: 'Maze',
  longInstructions: 'These are the instructions for this level in **Markdown**',
  shortInstructions: 'These are shorter instructions',
  blocklyData: {
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'when_run',
            next: {
              block: {
                type: 'maze_moveForward',
              },
            },
          },
          {
            type: 'maze_move',
            y: 100,
          },
        ],
      },
    },
  },
  subData: {
    skinId: 'birds',
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0],
      [0, 0, 0, 2, 1, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startDirection: 1,
  },
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & LabProps> = ({
  theme,
  ...args
}) => (
  <div style={{
    width: '100vw',
    height: '100vh',
  }}>
    <ThemeProvider>
      <Wrapper theme={theme}>
        <Lab
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  labView: MazeLevel,
  level: birdsLevelData,
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const LoadingLab = Template.bind({});
LoadingLab.args = {
  // A permanently pending lazy load
  labView: lazy(async () => new Promise(_ => {})),
  level: birdsLevelData,
};

export const LoadingLabDark = Template.bind({});
LoadingLabDark.args = {
  theme: 'Dark',
  ...LoadingLab.args,
};

export const NoLab = Template.bind({});
NoLab.args = {
};

export const NoLabDark = Template.bind({});
NoLabDark.args = {
  theme: 'Dark',
  ...NoLab.args,
};
