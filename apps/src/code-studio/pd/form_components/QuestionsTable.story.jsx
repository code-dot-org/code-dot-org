import {action} from '@storybook/addon-actions';
import PropTypes from 'prop-types';
import React from 'react';

import QuestionsTable from './QuestionsTable';

class TestWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data || {},
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newState) {
    this.props.onChange(newState);
    this.setState({
      data: newState.full,
    });
  }

  render() {
    return (
      <div id="application-container">
        <QuestionsTable
          data={this.state.data}
          questions={this.props.questions}
          options={this.props.options}
          errors={this.props.errors}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

TestWrapper.propTypes = {
  data: PropTypes.object,
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default {
  title: 'FormComponents/QuestionsTable', // eslint-disable-line storybook/no-title-property-in-meta
  component: QuestionsTable,
};

const Template = args => <TestWrapper {...args} />;

export const SimpleQuestionsTable = Template.bind({});
SimpleQuestionsTable.args = {
  onChange: action('onChange'),
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

export const ControlledQuestionsTable = Template.bind({});
ControlledQuestionsTable.args = {
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
