import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import moduleStyles from './instructions.module.scss';

export default class Instructions extends React.Component {
  static propTypes = {
    instructions: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
    analyticsReporter: PropTypes.object.isRequired,
    vertical: PropTypes.bool,
    right: PropTypes.bool
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

    const progressText = instructions
      ? `${this.state.currentPanel + 1}/${instructions.groups[0].panels.length}`
      : '';

    return (
      <div
        id="instructions"
        className={classNames(
          moduleStyles.instructions,
          this.props.vertical && moduleStyles.vertical
        )}
      >
        {instructions?.groups[0].panels.map((panel, index) => {
          return (
            <div
              key={index}
              className={classNames(
                moduleStyles.item,
                index === this.state.currentPanel && moduleStyles.visible,
                this.props.vertical && moduleStyles.itemVertical
              )}
            >
              {panel.imageSrc && (
                <div
                  className={classNames(
                    moduleStyles.imageContainer,
                    !this.props.vertical && moduleStyles.horizontal
                  )}
                >
                  <img
                    src={
                      baseUrl +
                      instructions.groups[0].path +
                      '/' +
                      panel.imageSrc
                    }
                    className={classNames(
                      moduleStyles.image,
                      !this.props.vertical && moduleStyles.fixedHeight
                    )}
                    onClick={() => this.imageClicked()}
                  />
                  {this.state.showBigImage && (
                    <div
                      className={classNames(
                        moduleStyles.bigImage,
                        this.props.right && moduleStyles.bigImageRight
                      )}
                    >
                      <img
                        src={
                          baseUrl +
                          instructions.groups[0].path +
                          '/' +
                          panel.imageSrc
                        }
                        onClick={() => this.imageClicked()}
                      />
                    </div>
                  )}
                </div>
              )}
              <div
                className={classNames(
                  moduleStyles.text,
                  this.props.vertical && moduleStyles.textVertical
                )}
              >
                {panel.text}
              </div>
            </div>
          );
        })}
        <div className={moduleStyles.bottom}>
          <div className={moduleStyles.progressText}>{progressText}</div>
          <div>
            <button
              type="button"
              onClick={() => this.changePanel(false)}
              className={classNames(
                moduleStyles.button,
                previousPanel !== null && moduleStyles.buttonActive
              )}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => this.changePanel(true)}
              className={classNames(
                moduleStyles.button,
                nextPanel !== null && moduleStyles.buttonActive
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
}
