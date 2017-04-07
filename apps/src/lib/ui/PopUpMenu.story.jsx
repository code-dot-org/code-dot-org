import React, {Component} from 'react';
import PopUpMenu from './PopUpMenu';

export default storybook => {
  storybook
      .storiesOf('PopUpMenu')
      .addWithInfo('overview', '', () => <Overview/>);
};

class Overview extends Component {
  state = {
    targetPoint: {
      top: 0,
      left: 0,
    },
  };

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({targetPoint: {
      top: this.target.offsetTop + this.target.offsetHeight,
      left: this.target.offsetLeft + this.target.offsetWidth / 2,
    }});
    /* eslint-enable react/no-did-mount-set-state */
  }

  render() {
    return (
      <div>
        This component is absolutely positioned.
        <div
          style={{
            border: 'solid black thin',
            margin: '1em',
            width: '50%',
          }}
          ref={el => this.target = el}
        >
          It targets the bottom-center of this element.
        </div>
        <PopUpMenu targetPoint={this.state.targetPoint}>
          <PopUpMenu.Item>Option One</PopUpMenu.Item>
          <PopUpMenu.Item>Option Two</PopUpMenu.Item>
          <PopUpMenu.Item>Option Three</PopUpMenu.Item>
        </PopUpMenu>
      </div>
    );
  }
}
