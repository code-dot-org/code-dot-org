import React, {Component, PropTypes} from 'react';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import i18n from '@cdo/locale';

export const styles = {
  xIcon: {
    paddingRight: 5,
  },
};

export default class PersonalProjectsTableActionsCell extends Component {
  static propTypes = {
    isPublished: PropTypes.bool
  };

  state = {
    deleting: false,
    publishing: false,
    unpublishing: false,
    renaming: false,
    remixing: false
  };

  render() {
    return (
      <QuickActionsCell>
        <PopUpMenu.Item
          onClick={() => console.log("Rename was clicked")}
        >
          {i18n.rename()}
        </PopUpMenu.Item>
        <PopUpMenu.Item
          onClick={() => console.log("Remix was clicked")}
        >
          {i18n.remix()}
        </PopUpMenu.Item>
        {!this.props.isPublished && (
          <PopUpMenu.Item
            onClick={() => console.log("Unpublish was clicked")}
          >
            {i18n.unpublish()}
          </PopUpMenu.Item>
        )}
        {this.props.isPublished && (
          <PopUpMenu.Item
            onClick={() => console.log("Publish was clicked")}
          >
            {i18n.publish()}
          </PopUpMenu.Item>
        )}
        <MenuBreak/>
        <PopUpMenu.Item
          onClick={() => console.log("Delete was clicked")}
          color={color.red}
        >
          <FontAwesome icon="times-circle" style={styles.xIcon}/>
          {i18n.delete()}
        </PopUpMenu.Item>
      </QuickActionsCell>
    );
  }
}
