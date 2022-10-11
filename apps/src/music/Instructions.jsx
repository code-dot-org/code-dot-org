import PropTypes from 'prop-types';
import React from 'react';

export default class Instructions extends React.Component {
  static propTypes = {
    instructions: PropTypes.object,
    baseUrl: PropTypes.string.isRequired
  };

  state = {
    currentPanel: 0
  };

  changePanel = nextPanel => {
    if (
      nextPanel &&
      this.state.currentPanel + 1 <
        this.props.instructions?.groups[0].panels.length
    ) {
      this.setState({currentPanel: this.state.currentPanel + 1});
    } else if (!nextPanel && this.state.currentPanel > 0) {
      this.setState({currentPanel: this.state.currentPanel - 1});
    }
  };

  render() {
    const {instructions, baseUrl} = this.props;

    return (
      <div
        id="instructions"
        style={{
          backgroundColor: '#222',
          width: '100%',
          height: '100%',
          borderRadius: 4,
          backgroundSize: '100% 200%',
          padding: 10,
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {instructions?.groups[0].panels.map((panel, index) => {
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 10,
                opacity: index === this.state.currentPanel ? 1 : 0,
                pointerEvents:
                  index === this.state.currentPanel ? 'auto' : 'none'
              }}
            >
              {panel.imageSrc && (
                <div style={{float: 'left', width: 140}}>
                  <img
                    src={
                      baseUrl +
                      instructions.groups[0].path +
                      '/' +
                      panel.imageSrc
                    }
                    style={{height: 70}}
                  />
                </div>
              )}
              <div
                style={{
                  float: 'left',
                  width: 'calc(100% - 290px)',
                  height: 70,
                  overflow: 'scroll'
                }}
              >
                {panel.text}
              </div>
            </div>
          );
        })}
        <div
          style={{
            bottom: 4,
            right: 4,
            position: 'absolute'
          }}
        >
          <button
            type="button"
            onClick={() => this.changePanel(false)}
            style={{fontSize: 13, padding: '4px 8px'}}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => this.changePanel(true)}
            style={{fontSize: 13, padding: '4px 8px'}}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
}
