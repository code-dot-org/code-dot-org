import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import msg from '@cdo/locale';

var styles = {
  invisible: {
    visibility: 'hidden'
  }
};

class ArtistVisualizationColumn extends Component {

  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    iconPath: PropTypes.string.isRequired,
    scale: PropTypes.number,
  };

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv />
        <GameButtons protectState={false}>
          <div id="slider-cell" ref={slider => this.slider = slider}>
            <svg
              id="slider"
              version="1.1"
              width="150"
              height="50"
            >
              {/* Slow icon. */}
              <clipPath id="slowClipPath">
                <rect width="26" height="12" x="5" y="14" />
              </clipPath>
              <image
                xlinkHref={this.props.iconPath}
                height="42"
                width="84"
                x="-21"
                y="-10"
                clipPath="url(#slowClipPath)"
              />
              {/* Fast icon. */}
              <clipPath id="fastClipPath">
                <rect width="26" height="16" x="120" y="10" />
              </clipPath>
              <image
                xlinkHref={this.props.iconPath}
                height="42"
                width="84"
                x="120"
                y="-11"
                clipPath="url(#fastClipPath)"
              />
            </svg>
            {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
            <img
              id="spinner"
              style={styles.invisible}
              src="/blockly/media/turtle/loading.gif"
              height="15"
              width="15"
            />
          </div>
          {this.slider && this.slider.offsetTop > 0 ? <br/> : " "}
          {this.props.showFinishButton &&
            <button
              id="finishButton"
              className="share"
            >
              <img src="/blockly/media/1x1.gif"/>
              {msg.finish()}
            </button>
          }
        </GameButtons>
        <BelowVisualization/>
      </span>
    );
  }
}


export default connect(state => ({
  scale: state.layout.visualizationScale || 1,
}))(ArtistVisualizationColumn);
