import type {Meta, StoryObj} from '@storybook/react';

import Snapshot, {SnapshotProps} from '../Snapshot';

type Story = StoryObj<typeof Snapshot>;

export default {
  title: 'CMS/Snapshot',
  component: Snapshot,
} as Meta<SnapshotProps>;

const defaultArgs: SnapshotProps = {
  title: 'Curriculum Snapshot',
  items: [
    {
      key: 'grades',
      icon: {iconName: 'user'},
      label: 'Grades',
      content: 'K-5',
    },
    {
      key: 'level',
      icon: {iconName: 'arrow-up-wide-short'},
      label: 'Level',
      content: 'Beginner',
    },
    {
      key: 'duration',
      icon: {iconName: 'clock'},
      label: 'Duration',
      content: 'Month, semester, or year',
    },
    {
      key: 'devices',
      icon: {iconName: 'desktop'},
      label: 'Devices',
      content: 'Laptop, Chromebook',
    },
    {
      key: 'topics',
      icon: {iconName: 'book'},
      label: 'Topics',
      content:
        'Artificial Intelligence, Data, Web Design, Physical Computing, App Design, Games and Animations, Art and Design, Programming',
    },
    {
      key: 'programming-tools',
      icon: {iconName: 'screwdriver-wrench'},
      label: 'Programming Tools',
      content: 'App Lab, Game Lab, AI Lab, Web Lab',
    },
    {
      key: 'professional-learning',
      icon: {iconName: 'chalkboard-user'},
      label: 'Professional Learning',
      content: 'Facilitator-led workshops, self-paced learning',
    },
    {
      key: 'accessibility',
      icon: {iconName: 'universal-access'},
      label: 'Accessibility',
      content: 'Text-to-speech, closed captioning, immersive reader',
    },
    {
      key: 'languages-supported',
      icon: {iconName: 'language'},
      label: 'Languages supported',
      content: 'Italiano, Español (LATAM), Português (Brasil), Slovenčina',
    },
  ],
};

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
};
