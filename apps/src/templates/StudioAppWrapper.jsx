import PropTypes from 'prop-types';
import React from 'react';
import RotateContainer from '../templates/RotateContainer';
import {connect} from 'react-redux';

/**
 * Wrapper component for all Code Studio app types, which provides rotate
 * container and clear-div but otherwise just renders children.
 */
class StudioAppWrapper extends React.Component {
  static propTypes = {
    assetUrl: PropTypes.func.isRequired,
    isEmbedView: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    children: PropTypes.node,
    rotateContainerWidth: PropTypes.number
  };

  requiresLandscape() {
    return !(this.props.isEmbedView || this.props.isShareView);
  }

  render() {
    return (
      <div>
        {this.requiresLandscape() && (
          <RotateContainer
            assetUrl={this.props.assetUrl}
            width={this.props.rotateContainerWidth}
          />
        )}
        {this.props.children}
        <div className="clear" />
      </div>
    );
  }
}

export default connect(state => ({
  assetUrl: state.pageConstants.assetUrl,
  isEmbedView: state.pageConstants.isEmbedView,
  isShareView: state.pageConstants.isShareView
}))(StudioAppWrapper);
