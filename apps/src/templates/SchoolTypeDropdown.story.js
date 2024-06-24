import React, {Component} from 'react';

import SchoolTypeDropdown from './SchoolTypeDropdown';

export default {
  component: SchoolTypeDropdown,
};

//
// TEMPLATE
//

class DropdownWrapper extends Component {
  state = {
    value: '',
  };

  onChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <SchoolTypeDropdown
        value={this.state.value}
        onChange={this.onChange.bind(this)}
      />
    );
  }
}

const Template = args => <DropdownWrapper {...args} />;

//
// STORIES
//

export const Overview = Template.bind({});
Overview.args = {};
