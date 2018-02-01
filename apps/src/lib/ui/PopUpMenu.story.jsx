import React, {Component} from 'react';
import PopUpMenu from './PopUpMenu';

export default storybook => {
  storybook
      .storiesOf('PopUpMenu', module)
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
    const rect = this.target.getBoundingClientRect();
    this.setState({targetPoint: {
      top: rect.bottom,
      left: rect.left + rect.width / 2,
    }});
    /* eslint-enable react/no-did-mount-set-state */
  }

  render() {
    return (
      <div>
        The <tt>PopUpMenu</tt> component is absolutely-positioned.
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
        <PopUpMenu isOpen targetPoint={this.state.targetPoint}>
          <PopUpMenu.Item onClick={() => {}}>Option One</PopUpMenu.Item>
          <PopUpMenu.Item onClick={() => {}}>Option Two</PopUpMenu.Item>
          <PopUpMenu.Item onClick={() => {}}>Option Three</PopUpMenu.Item>
        </PopUpMenu>
      </div>
    );
  }
}
