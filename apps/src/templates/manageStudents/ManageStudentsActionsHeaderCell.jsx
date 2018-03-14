import React, {Component, PropTypes} from 'react';
import QuickActionsCell, {QuickActionsCellType} from "../tables/QuickActionsCell";
import ControlProjectSharingDialog from './ControlProjectSharingDialog';
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import i18n from '@cdo/locale';

export default class ManageStudentsActionsHeaderCell extends Component {
  static propTypes = {
    editAll: PropTypes.func,
  };

  state = {
    isProjectSharingDialogOpen: false
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
    return (
      <div>
        <QuickActionsCell
          type={QuickActionsCellType.header}
        >
          <PopUpMenu.Item
            onClick={this.onEditAll}
          >
            {i18n.editAll()}
          </PopUpMenu.Item>
          <MenuBreak/>
          <PopUpMenu.Item
            onClick={this.openProjectSharingDialog}
          >
            {i18n.controlProjectSharing()}
          </PopUpMenu.Item>
        </QuickActionsCell>
        <ControlProjectSharingDialog
          isDialogOpen={this.state.isProjectSharingDialogOpen}
          closeDialog={this.closeProjectSharingDialog}
        />
      </div>
    );
  }
}
