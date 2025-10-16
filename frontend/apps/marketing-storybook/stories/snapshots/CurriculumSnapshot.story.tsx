import CurriculumSnapshot, {
  CurriculumSnapshotProps,
} from '@/components/contentful/snapshots/curriculumSnapshot';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<CurriculumSnapshotProps> = {
  title: 'Marketing/Snapshots/Curriculum',
  component: CurriculumSnapshot,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const Playground: StoryObj<CurriculumSnapshotProps> = {
  args: {
    label: 'Curriculum Snapshot',
    grades: ['K', '1', '2', '3'],
    level: ['Beginner', 'Intermediate'],
    duration: ['30 min', '1 hour'],
    devices: ['Chromebook', 'iPad'],
    topics: ['Math', 'Science'],
    devTools: ['Scratch', 'Blockly'],
    proLearning: ['Online Course'],
    accessibility: ['Screen Reader'],
    languages: ['English', 'Spanish'],
  },
  argTypes: {
    label: {control: 'text'},
    grades: {control: 'object'},
    level: {control: 'object'},
    duration: {control: 'object'},
    devices: {control: 'object'},
    topics: {control: 'object'},
    devTools: {control: 'object'},
    proLearning: {control: 'object'},
    accessibility: {control: 'object'},
    languages: {control: 'object'},
  },
};

export const FilledOut: StoryObj<CurriculumSnapshotProps> = {
  args: {
    label: '❌ [ENG] Curriculum 1',
    grades: [
      'K',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ],
    level: ['Beginner'],
    duration: ['School Year'],
    devices: ['Computer'],
    topics: [
      'Art and Design',
      'App Design',
      'Artificial Intelligence',
      'Web Design',
    ],
    proLearning: ['Facilitator-led Workshops', 'Self-paced Modules'],
    accessibility: ['Text to Speech', 'Closed captioning', 'Immersive reader'],
    languages: [
      'Arabic',
      'Bahasa Indonesian',
      'Chinese Traditional',
      'English',
      'Farsi',
      'French',
      'German',
      'Hindi',
      'Italian',
      'Japanese',
      'Korean',
      'Polish',
      'Portuguese - Brazil',
      'Slovak',
      'Spanish - Latam',
      'Spanish - Spain',
      'Thai',
      'Turkish',
    ],
  },
};
