import React, {Component} from 'react';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import i18n from '@cdo/locale';

export default class ManageStudentsActionsHeaderCell extends Component {

  render() {
    return (
      <div>
        <QuickActionsCell
          type="header"
        >
          <PopUpMenu.Item
            onClick={() => console.log('edit all was clicked!')}
          >
            {i18n.editAll()}
          </PopUpMenu.Item>
          <MenuBreak/>
          <PopUpMenu.Item
            onClick={() => console.log('control project sharing was clicked!')}
          >
            {i18n.controlProjectSharing()}
          </PopUpMenu.Item>
        </QuickActionsCell>
      </div>
    );
  }
}
