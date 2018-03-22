import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import QuickActionsCell, {QuickActionsCellType} from "../tables/QuickActionsCell";
import {updateShareSetting} from './manageStudentsRedux';
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import i18n from '@cdo/locale';

class SharingControlActionsHeaderCell extends Component {
  static propTypes = {
    // provided by Redux
    sectionId: PropTypes.number.isRequired,
    updateShareSetting: PropTypes.func.isRequired,
  };

  disableSharing = () => {
    this.props.updateShareSetting(this.props.sectionId, true);
  };

  enableSharing = () => {
    this.props.updateShareSetting(this.props.sectionId, false);
  };

  render() {
    return (
      <div>
        <QuickActionsCell
          type={QuickActionsCellType.header}
        >
          <PopUpMenu.Item
            onClick={this.enableSharing}
          >
            {i18n.projectSharingEnableAll()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            onClick={this.disableSharing}
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

export default connect((state, props) => ({}), {
  updateShareSetting
})(SharingControlActionsHeaderCell);
