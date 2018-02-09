import React from 'react';
import QuestionsTable from './QuestionsTable';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';
import {action} from '@storybook/addon-actions';

export default storybook => {
  storybook
    .storiesOf('QuestionsTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([{
      name: 'simple questions table',
      story: () => (
        <QuestionsTable
          options={[
            "this is cool",
            "this is okay",
            "this is useless"
          ]}
          questions={[{
            label: "what do you think of this component?",
            name: "thinkOfComponent",
            required: true,
          }, {
            label: "what do you think of this story?",
            name: "thinkOfStory",
          }, {
            label: "what do you think of this question?",
            name: "thinkOfQuestion",
          }]}
        />
      )
    }, {
      name: 'controlled questions table',
      story: () => (
        <QuestionsTable
          data={{
            "theOneThatIsSelected": "first"
          }}
          errors={[
            "theOneWithTheError"
          ]}
          onChange={action('onChange')}
          options={[
            "first",
            "second",
            "third"
          ]}
          questions={[{
            label: "this one should have something selected",
            name: "theOneThatIsSelected",
          }, {
            label: "this one should have an error",
            name: "theOneWithTheError",
          }, {
            label: "this one should be plain",
            name: "theOtherOne",
          }]}
        />
      )
    }]);
};
