import React from 'react';
import SpeedSlider from './SpeedSlider';

class StorybookHarness extends React.Component {
  state = {value: 0.5};

  onValueChange = newValue => this.setState({value: newValue});

  render() {
    return (
      <SpeedSlider
        hasFocus={false}
        value={this.state.value}
        onChange={this.onValueChange}
      />
    );
  }
}

const Template = args => <StorybookHarness {...args} />;

export const BasicExample = Template.bind({});
BasicExample.args = {
  hasFocus: false
};

export default {
  title: 'Speed Slider',
  component: SpeedSlider
};
