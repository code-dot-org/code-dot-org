import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {closeDialog} from '@cdo/apps/redux/instructionsDialog';

import BaseDialog from '../BaseDialog';

/**
 * A super basic component which connects our generic BaseDialog component to
 * the "expandable images" feature.
 *
 * Currently only used to enable expandable images in Lesson Plans; level
 * instructions (which also support expandable images) use a different (and
 * much more complex) code pathway to display the image dialog.
 */
class ExpandableImageDialog extends React.Component {
  static propTypes = {
    closeDialog: PropTypes.func.isRequired,
    imgUrl: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <BaseDialog
        handleClose={() => this.props.closeDialog()}
        isOpen={this.props.isOpen}
        useUpdatedStyles={true}
      >
        {
          // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
          // Verify or update this alt-text as necessary
        }
        <img src={this.props.imgUrl} alt="" />
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    isOpen: state.instructionsDialog.open,
    imgUrl: state.instructionsDialog.imgUrl,
  }),
  {
    closeDialog,
  }
)(ExpandableImageDialog);
