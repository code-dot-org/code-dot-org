import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FixZoomHelper from '@cdo/apps/templates/FixZoomHelper';
import HideToolbarHelper from '@cdo/apps/templates/HideToolbarHelper';
import RotateContainer from '@cdo/apps/templates/RotateContainer';
import StudioAppIdleTimer from '@cdo/apps/templates/StudioAppIdleTimer';

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
  };

  requiresLandscape() {
    return !(this.props.isEmbedView || this.props.isShareView);
  }

  render() {
    return (
      <div>
        <FixZoomHelper />
        <HideToolbarHelper />
        {this.requiresLandscape() && (
          <RotateContainer assetUrl={this.props.assetUrl} />
        )}
        <StudioAppIdleTimer />
        {this.props.children}
        <div className="clear" />
      </div>
    );
  }
}

export const UnconnectedStudioAppWrapper = StudioAppWrapper;

export default connect(state => ({
  assetUrl: state.pageConstants.assetUrl,
  isEmbedView: state.pageConstants.isEmbedView,
  isShareView: state.pageConstants.isShareView,
}))(StudioAppWrapper);
