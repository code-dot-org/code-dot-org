import React from 'react';
import PropTypes from 'prop-types';
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
      data: newState.full
    });
  }

  render() {
    let valid;
    if (this.state.data) {
      valid = /^[a-zA-Z]*$/.test(this.state.data) ? "success" : "error";
    }
    return (
      <FieldGroup
        id="full"
        type="text"
        label="this is a more full-featured example that errors if you type non-alpha characters"
        validationState={valid}
        onChange={this.handleChange}
        value={this.state.data}
        required={true}
      />
    );
  }
}

TestWrapper.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default storybook => {
  storybook
    .storiesOf('FieldGroup', module)
    .addStoryTable([{
      name: 'basic example',
      story: () => (
        <FieldGroup
          id="basic"
          type="text"
          label="this is a basic fieldgroup"
          onChange={storybook.action('onChange')}
        />
      )
    }, {
      name: 'dropdown with children',
      story: () => (
        <FieldGroup
          id="dropdown"
          componentClass="select"
          label="a dropdown with children"
          onChange={storybook.action('onChange')}
        >
          <option>Please Select One:</option>
          <option value="first">One</option>
          <option value="second">Two</option>
          <option value="third">Three</option>
        </FieldGroup>
      )
    }, {
      name: 'full-featured example',
      story: () => (
        <TestWrapper onChange={storybook.action('onChange')} />
      )
    }]);
};
