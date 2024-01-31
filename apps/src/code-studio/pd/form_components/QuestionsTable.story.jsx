import React from 'react';
import QuestionsTable from './QuestionsTable';
import {action} from '@storybook/addon-actions';

export default {
  title: 'FormComponents/QuestionsTable',
  component: QuestionsTable,
};

const Template = args => <QuestionsTable {...args} />;

const simpleQuestionsTable = Template.bind({});
simpleQuestionsTable.args = {
  options: ['this is cool', 'this is okay', 'this is useless'],
  questions: [
    {
      label: 'what do you think of this component?',
      name: 'thinkOfComponent',
      required: true,
    },
    {
      label: 'what do you think of this story?',
      name: 'thinkOfStory',
    },
    {
      label: 'what do you think of this question?',
      name: 'thinkOfQuestion',
    },
  ],
};

const controlledQuestionsTable = Template.bind({});
controlledQuestionsTable.args = {
  data: {
    theOneThatIsSelected: 'first',
  },
  errors: ['theOneWithTheError'],
  onChange: action('onChange'),
  options: ['first', 'second', 'third'],
  questions: [
    {
      label: 'this one should have something selected',
      name: 'theOneThatIsSelected',
    },
    {
      label: 'this one should have an error',
      name: 'theOneWithTheError',
    },
    {
      label: 'this one should be plain',
      name: 'theOtherOne',
    },
  ],
};
