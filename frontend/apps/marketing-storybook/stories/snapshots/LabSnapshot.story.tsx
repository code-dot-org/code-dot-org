import LabSnapshot, {
  LabSnapshotProps,
} from '@/components/contentful/snapshots/labSnapshot';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<LabSnapshotProps> = {
  title: 'Marketing/Snapshots/Lab',
  component: LabSnapshot,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const Playground: StoryObj<LabSnapshotProps> = {
  args: {
    label: 'Lab Snapshot',
    ages: ['6', '7', '8'],
    level: ['Beginner', 'Intermediate'],
    creation: 'Games, Art',
    devices: ['Chromebook', 'iPad'],
    browsers: ['Chrome', 'Firefox'],
    accessibility: ['Screen Reader'],
    languages: ['English', 'Spanish'],
  },
  argTypes: {
    label: {control: 'text'},
    ages: {control: 'object'},
    level: {control: 'object'},
    creation: {control: 'text'},
    devices: {control: 'object'},
    browsers: {control: 'object'},
    accessibility: {control: 'object'},
    languages: {control: 'object'},
  },
};

export const FilledOut: StoryObj<LabSnapshotProps> = {
  args: {
    label: '❌ [ENG] Lab Test',
    ages: [
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
    ],
    level: ['Beginner'],
    creation: 'Block-based music mixes',
    devices: ['Laptop', 'Chromebook', 'Tablet'],
    browsers: ['All modern browsers'],
    accessibility: [
      'Text to Speech',
      'Closed captioning',
      'Keyboard and Screen Reader Accessible',
    ],
    languages: [
      'Arabic',
      'Bahasa Indonesian',
      'Chinese Traditional',
      'English',
      'Farsi',
      'Filipino',
      'French',
      'German',
      'Hebrew',
      'Hindi',
      'Italian',
      'Japanese',
      'Korean',
      'Polish',
      'Portuguese - Brazil',
      'Portuguese - Portugal',
      'Romanian',
      'Slovak',
      'Spanish - Latam',
      'Spanish - Spain',
      'Thai',
      'Turkish',
    ],
  },
};
