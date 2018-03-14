import React, {Component} from 'react';
import QuickActionsCell, {QuickActionsCellType} from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import i18n from '@cdo/locale';

export default class SharingControlActionsHeaderCell extends Component {

  render() {
    return (
      <div>
        <QuickActionsCell
          type={QuickActionsCellType.header}
        >
          <PopUpMenu.Item
            onClick={() => console.log('enable all was clicked!')}
          >
            {i18n.projectSharingEnableAll()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            onClick={() => console.log('disable all was clicked!')}
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
