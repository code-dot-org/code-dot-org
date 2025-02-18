import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import PopUpMenu, {MenuBreak} from '@cdo/apps/sharedComponents/PopUpMenu';
import i18n from '@cdo/locale';

import QuickActionsCell, {
  QuickActionsCellType,
} from '../tables/QuickActionsCell';

import ControlProjectSharingDialog from './ControlProjectSharingDialog';
import {setShowSharingColumn} from './manageStudentsRedux';

class ManageStudentsActionsHeaderCell extends Component {
  static propTypes = {
    editAll: PropTypes.func,
    isShareColumnVisible: PropTypes.bool,
    hideSharingColumn: PropTypes.func,
  };

  state = {
    isProjectSharingDialogOpen: false,
  };

  openProjectSharingDialog = () => {
    this.setState({isProjectSharingDialogOpen: true});
  };

  closeProjectSharingDialog = () => {
    this.setState({isProjectSharingDialogOpen: false});
  };

  onEditAll = () => {
    this.props.editAll();
  };

  render() {
    const {isShareColumnVisible, hideSharingColumn} = this.props;
    return (
      <div>
        <QuickActionsCell type={QuickActionsCellType.header}>
          <PopUpMenu.Item onClick={this.onEditAll}>
            {i18n.editAll()}
          </PopUpMenu.Item>
          <MenuBreak />
          {!isShareColumnVisible && (
            <PopUpMenu.Item onClick={this.openProjectSharingDialog}>
              {i18n.controlProjectSharing()}
            </PopUpMenu.Item>
          )}
          {isShareColumnVisible && (
            <PopUpMenu.Item onClick={hideSharingColumn}>
              {i18n.hideProjectSharingColumn()}
            </PopUpMenu.Item>
          )}
        </QuickActionsCell>
        <ControlProjectSharingDialog
          isDialogOpen={this.state.isProjectSharingDialogOpen}
          closeDialog={this.closeProjectSharingDialog}
        />
      </div>
    );
  }
}

export const UnconnectedManageStudentsActionsHeaderCell =
  ManageStudentsActionsHeaderCell;

export default connect(
  state => ({}),
  dispatch => ({
    hideSharingColumn() {
      dispatch(setShowSharingColumn(false));
    },
  })
)(ManageStudentsActionsHeaderCell);
