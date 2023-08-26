import PropTypes from 'prop-types';
import React from 'react';
import applabMsg from '@cdo/applab/locale';
import color from '../../util/color';
import * as rowStyle from './rowStyle';
import FontAwesome from '../../templates/FontAwesome';

export default class ZOrderRow extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    onDepthChange: PropTypes.func.isRequired,
  };

  render() {
    const element = this.props.element;

    // Element will be wrapped in a resizable div
    const outerElement = element.parentNode;
    const index = Array.prototype.indexOf.call(
      outerElement.parentNode.children,
      outerElement
    );
    const isBackMost = index === 0;
    const isFrontMost = index + 1 === outerElement.parentNode.children.length;

    const squareButton = {
      width: 42,
      height: 42,
      marginLeft: 0,
      marginRight: 10,
      backgroundColor: color.cyan,
    };

    const squareButtonDisabled = {
      width: 42,
      height: 42,
      marginLeft: 0,
      marginRight: 10,
    };

    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>
          {applabMsg.designElementProperty_zOrder()}
        </div>
        <div>
          <button
            type="button"
            style={isBackMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'toBack')}
            disabled={isBackMost}
            title={applabMsg.designElementProperty_zOrder_backButton()}
          >
            <FontAwesome icon="angle-double-left" />
          </button>
          <button
            type="button"
            style={isBackMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'backward')}
            disabled={isBackMost}
            title={applabMsg.designElementProperty_zOrder_backwardButton()}
          >
            <FontAwesome icon="angle-left" />
          </button>
          <button
            type="button"
            style={isFrontMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'forward')}
            disabled={isFrontMost}
            title={applabMsg.designElementProperty_zOrder_forwardButton()}
          >
            <FontAwesome icon="angle-right" />
          </button>
          <button
            type="button"
            style={isFrontMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'toFront')}
            disabled={isFrontMost}
            title={applabMsg.designElementProperty_zOrder_frontButton()}
          >
            <FontAwesome icon="angle-double-right" />
          </button>
        </div>
      </div>
    );
  }
}
