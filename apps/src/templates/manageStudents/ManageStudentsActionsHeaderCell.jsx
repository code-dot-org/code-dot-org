import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import i18n from '@cdo/locale';

import ControlProjectSharingDialog from './ControlProjectSharingDialog';
import {setShowSharingColumn} from './manageStudentsRedux';

class ManageStudentsActionsHeaderCell extends Component {
  static propTypes = {
    editAll: PropTypes.func,
    isShareColumnVisible: PropTypes.bool,
    hideSharingColumn: PropTypes.func,
    isDemoSection: PropTypes.bool,
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

  buildOptions() {
    const {isShareColumnVisible, hideSharingColumn, isDemoSection} = this.props;
    const options = [
      {
        value: 'edit-all',
        label: i18n.editAll(),
        icon: {iconName: 'pen'},
        onClick: this.onEditAll,
        isOptionDisabled: isDemoSection,
      },
    ];
    if (!isShareColumnVisible) {
      options.push({
        value: 'control-project-sharing',
        label: i18n.controlProjectSharing(),
        icon: {iconName: 'share-nodes'},
        onClick: this.openProjectSharingDialog,
        isOptionDisabled: isDemoSection,
      });
    } else {
      options.push({
        value: 'hide-sharing-column',
        label: i18n.hideProjectSharingColumn(),
        icon: {iconName: 'eye-slash'},
        onClick: hideSharingColumn,
        isOptionDisabled: isDemoSection,
      });
    }
    return options;
  }

  render() {
    const {isDemoSection} = this.props;
    return (
      <div>
        <span
          data-for="demo-actions-header-tooltip"
          data-tip=""
          style={{display: 'inline-block'}}
        >
          <ActionDropdown
            name="student-header-actions"
            labelText={i18n.actions()}
            size="s"
            menuPlacement="right"
            options={this.buildOptions()}
            triggerButtonProps={{
              color: 'tertiary',
              variant: 'text',
              children: <FontAwesomeV6Icon iconName="gear" />,
            }}
          />
        </span>
        {isDemoSection && (
          <ReactTooltip
            id="demo-actions-header-tooltip"
            role="tooltip"
            effect="solid"
            place="top"
          >
            <div>{'Not available for demo sections'}</div>
          </ReactTooltip>
        )}
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
