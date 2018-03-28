import React, {Component, PropTypes} from 'react';
import QuickActionsCell, {QuickActionsCellType} from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import i18n from '@cdo/locale';
import {handleShareSetting} from './manageStudentsRedux';
import {connect} from 'react-redux';

class SharingControlActionsHeaderCell extends Component {
  static propTypes = {
    handleShareSetting: PropTypes.func,
  };

  onEnableAll = () => {
    this.props.handleShareSetting(false);
  };

  onDisableAll = () => {
    this.props.handleShareSetting(true);
  };

  render() {
    return (
      <div>
        <QuickActionsCell
          type={QuickActionsCellType.header}
        >
          <PopUpMenu.Item
            onClick={this.onEnableAll}
          >
            {i18n.projectSharingEnableAll()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            onClick={this.onDisableAll}
          >
            {i18n.projectSharingDisableAll()}
          </PopUpMenu.Item>
          <MenuBreak/>
          <PopUpMenu.Item
            href={'https://support.code.org/hc/en-us/articles/115001554911-Configuring-sharing-options-for-students-using-App-Lab-Game-Lab-and-Web-Lab'}
            openInNewTab
          >
            {i18n.learnMore()}
          </PopUpMenu.Item>
        </QuickActionsCell>
      </div>
    );
  }
}

export const UnconnectedSharingControlActionsHeaderCell = SharingControlActionsHeaderCell;

export default connect(state => ({}), dispatch => ({
  handleShareSetting(disable) {
    dispatch(handleShareSetting(disable));
  }
}))(SharingControlActionsHeaderCell);
