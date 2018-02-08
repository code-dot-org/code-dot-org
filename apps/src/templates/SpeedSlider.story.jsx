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

export default storybook => {
  return storybook
    .storiesOf('SpeedSlider', module)
    .add('Default', () => <StorybookHarness/>);
};
