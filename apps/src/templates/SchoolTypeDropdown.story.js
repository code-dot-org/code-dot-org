import React, { Component } from 'react';
import SchoolTypeDropdown from './SchoolTypeDropdown';

export default storybook => {

  class DropdownWrapper extends Component {
    state = {
      value: '',
    };

    onChange(event) {
      this.setState({value: event.target.value});
    }

    render() {
      return (<SchoolTypeDropdown value={this.state.value} onChange={this.onChange.bind(this)} />);
    }
  }

  storybook
    .storiesOf('SchoolTypeDropdown', module)
    .addStoryTable([
      {
        name:'SchoolTypeDropdown',
        story: () => (
          <DropdownWrapper/>
        )
      },
    ]);
};
