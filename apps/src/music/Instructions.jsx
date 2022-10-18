import PropTypes from 'prop-types';
import React from 'react';

export default class Instructions extends React.Component {
  static propTypes = {
    instructions: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
    analyticsReporter: PropTypes.object.isRequired
  };

  state = {
    currentPanel: 0,
    showBigImage: false
  };

  getPreviousPanel = () => {
    return this.state.currentPanel > 0 ? this.state.currentPanel - 1 : null;
  };

  getNextPanel = () => {
    return this.state.currentPanel + 1 <
      this.props.instructions?.groups[0].panels.length
      ? this.state.currentPanel + 1
      : null;
  };

  changePanel = nextPanel => {
    const nextPanelIndex = nextPanel
      ? this.getNextPanel()
      : this.getPreviousPanel();

    if (nextPanelIndex !== null) {
      this.setState({currentPanel: nextPanelIndex, showBigImage: false});
    }
  };

  imageClicked = () => {
    this.setState({showBigImage: !this.state.showBigImage});
  };

  render() {
    const {instructions, baseUrl, analyticsReporter} = this.props;

    // Instructions panels are 0-indexed, tracking is 1-based
    analyticsReporter.onInstructionsVisited(this.state.currentPanel + 1);

    const previousPanel = this.getPreviousPanel();
    const nextPanel = this.getNextPanel();

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
          position: 'relative',
          fontSize: 14,
          lineHeight: 1.5
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
                <div style={{float: 'left', width: 140, position: 'relative'}}>
                  <img
                    src={
                      baseUrl +
                      instructions.groups[0].path +
                      '/' +
                      panel.imageSrc
                    }
                    style={{height: 70, cursor: 'pointer'}}
                    onClick={() => this.imageClicked()}
                  />
                  {this.state.showBigImage && (
                    <div
                      style={{
                        position: 'absolute',
                        width: 440,
                        top: 0,
                        left: 0
                      }}
                    >
                      <img
                        src={
                          baseUrl +
                          instructions.groups[0].path +
                          '/' +
                          panel.imageSrc
                        }
                        style={{
                          width: '100%',
                          position: 'absolute',
                          border: '10px black solid',
                          borderRadius: 4,
                          zIndex: 80,
                          cursor: 'pointer'
                        }}
                        onClick={() => this.imageClicked()}
                      />
                    </div>
                  )}
                </div>
              )}
              <div
                style={{
                  float: 'left',
                  width: 'calc(100% - 290px)',
                  height: 70,
                  overflowY: 'auto'
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
            style={{
              fontSize: 13,
              padding: '4px 8px',
              opacity: previousPanel !== null ? 1 : 0,
              pointerEvents: previousPanel !== null ? 'auto' : 'none'
            }}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => this.changePanel(true)}
            style={{
              fontSize: 13,
              padding: '4px 8px',
              opacity: nextPanel !== null ? 1 : 0,
              pointerEvents: nextPanel !== null ? 'auto' : 'none'
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
}
