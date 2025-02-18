import {action} from '@storybook/addon-actions';
import PropTypes from 'prop-types';
import React from 'react';

import FieldGroup from './FieldGroup';

class TestWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
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
    let valid;
    if (this.state.data) {
      valid = /^[a-zA-Z]*$/.test(this.state.data) ? 'success' : 'error';
    }
    return (
      <FieldGroup
        id={this.props.id}
        type={this.props.type}
        componentClass={this.props.componentClass}
        label={this.props.label}
        validationState={valid}
        onChange={this.handleChange}
        value={this.state.data}
        required={true}
      >
        {this.props.children}
      </FieldGroup>
    );
  }
}

TestWrapper.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  componentClass: PropTypes.string,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.node),
};

export default {
  title: 'FormComponents/FieldGroup', // eslint-disable-line storybook/no-title-property-in-meta
  component: FieldGroup,
};

const Template = args => <TestWrapper {...args} />;

export const BasicExample = Template.bind({});
BasicExample.args = {
  id: 'basic',
  type: 'text',
  label: 'this is a basic fieldgroup',
  onChange: action('onChange'),
};

export const DropdownWithChildren = Template.bind({});
DropdownWithChildren.args = {
  id: 'dropdown',
  componentClass: 'select',
  label: 'a dropdown with children',
  onChange: action('onChange'),
  children: [
    <option key="title">Please Select One:</option>,
    <option key="first" value="first">
      One
    </option>,
    <option key="second" value="second">
      Two
    </option>,
    <option key="third" value="third">
      Three
    </option>,
  ],
};
