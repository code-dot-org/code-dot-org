import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import QuickAction from "../tables/QuickAction";
import QuickActionsBox from "../tables/QuickActionsBox";

class ProjectActionBox extends Component {
  static propTypes = {
    isPublished: PropTypes.bool,
    style: PropTypes.object
  };

  render() {
    const {isPublished} = this.props;

    return (
      <div style={this.props.style}>
        <QuickActionsBox>
          <QuickAction
            text={i18n.rename()}
            action={()=>{}}
          />
          <QuickAction
            text={i18n.remix()}
            action={()=>{}}
          />
          <QuickAction
            text={isPublished ? i18n.removeFromPublicGallery() : i18n.publishToPublicGallery()}
            action={()=>{}}
          />
          <QuickAction
            text={i18n.publishToPublicGallery()}
            action={()=>{}}
          />
          <QuickAction
            text={i18n.deleteProject()}
            action={()=>{}}
            hasLineAbove={true}
            isDelete={true}
          />
        </QuickActionsBox>
      </div>
    );
  }
}

export default ProjectActionBox;
