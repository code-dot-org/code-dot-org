import React from 'react';

import SpeedSlider from './SpeedSlider';

class StorybookHarness extends React.Component {
  state = {value: 0.5};

  onValueChange = newValue => this.setState({value: newValue});

  render() {
    return (
      <div style={{display: 'flex', gap: '20px'}}>
        <div style={{background: 'black', padding: 10}}>
          <SpeedSlider
            hasFocus={true}
            value={this.state.value}
            lineWidth={200}
            onChange={this.onValueChange}
          />
        </div>
      </div>
    );
  }
}

export default {
  component: SpeedSlider,
};

const Template = () => <StorybookHarness />;

export const BasicExample = Template.bind({});
