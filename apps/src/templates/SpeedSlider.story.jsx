import React from 'react';
import createReactClass from 'create-react-class';
import SpeedSlider from './SpeedSlider';

const StorybookHarness = createReactClass({
    getInitialState() {
      return {
        value: 0.5
      };
    },

    onValueChange(newValue) {
      this.setState({value: newValue});
    },

    render() {
      return <SpeedSlider hasFocus={false} value={this.state.value} onChange={this.onValueChange} />;
    }
  });

export default storybook => {
  return storybook
    .storiesOf('SpeedSlider', module)
    .addWithInfo(
      'Default',
      '',
      () => <StorybookHarness/>);
};
