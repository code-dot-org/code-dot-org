import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {setShowSharingColumn} from './manageStudentsRedux';
import {connect} from 'react-redux';
import QuickActionsCell, {
  QuickActionsCellType
} from '../tables/QuickActionsCell';
import ControlProjectSharingDialog from './ControlProjectSharingDialog';
import ChangeLoginTypeDialog from '@cdo/apps/templates/teacherDashboard/ChangeLoginTypeDialog';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import PopUpMenu, {MenuBreak} from '@cdo/apps/lib/ui/PopUpMenu';
import i18n from '@cdo/locale';
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';

class ManageStudentsActionsHeaderCell extends Component {
  static propTypes = {
    editAll: PropTypes.func,
    isShareColumnVisible: PropTypes.bool,
    hideSharingColumn: PropTypes.func,
    loginType: PropTypes.string,
    sectionId: PropTypes.number.isRequired,
    // Provided by Redux
    section: sectionShape
  };

  state = {
    isProjectSharingDialogOpen: false,
    isChangeLoginTypeDialogOpen: false
  };

  openProjectSharingDialog = () => {
    this.setState({isProjectSharingDialogOpen: true});
  };

  closeProjectSharingDialog = () => {
    this.setState({isProjectSharingDialogOpen: false});
  };

  openChangeLoginTypeDialog = () => {
    this.setState({isChangeLoginTypeDialogOpen: true});
  };

  closeChangeLoginTypeDialog = () => {
    this.setState({isChangeLoginTypeDialogOpen: false});
  };

  onEditAll = () => {
    this.props.editAll();
  };

  onLoginTypeChanged = () => {
    this.closeChangeLoginTypeDialog();
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
          {true && (
            <PopUpMenu.Item onClick={this.openChangeLoginTypeDialog}>
              Change login type
            </PopUpMenu.Item>
          )}
        </QuickActionsCell>
        <ControlProjectSharingDialog
          isDialogOpen={this.state.isProjectSharingDialogOpen}
          closeDialog={this.closeProjectSharingDialog}
        />
        <ChangeLoginTypeDialog
          isOpen={this.state.isChangeLoginTypeDialogOpen}
          handleClose={this.closeChangeLoginTypeDialog}
          onLoginTypeChanged={this.onLoginTypeChanged}
          sectionId={this.props.sectionId}
        />
      </div>
    );
  }
}

export const UnconnectedManageStudentsActionsHeaderCell = ManageStudentsActionsHeaderCell;

export default connect(
  (state, props) => ({
    section: state.teacherSections.sections[props.sectionId]
  }),
  dispatch => ({
    hideSharingColumn() {
      dispatch(setShowSharingColumn(false));
    }
  })
)(ManageStudentsActionsHeaderCell);
