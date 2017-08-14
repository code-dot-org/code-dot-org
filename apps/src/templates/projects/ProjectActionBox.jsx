import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Radium from 'radium';

const styles = {
  arrowIcon: {
    paddingRight: 8
  },
  actionBox: {
    width: 180,
    paddingLeft: 15,
    paddingRight: 15,
    border: '1px solid ' + color.lighter_gray,
    borderRadius: 2,
    backgroundColor: color.white,
    boxShadow: "2px 2px 2px " + color.light_gray,
    marginTop: 5,
  },
  actionText: {
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal,
    padding: '12px 0px 2px 0px',
  },
  delete: {
    color: color.red,
    borderTop: '1px solid ' + color.lighter_gray,
    marginTop: 8,
    padding: '10px 0px 10px 0px',
    fontSize: 14,
  },
  xIcon: {
    paddingRight: 5
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

class ProjectActionBox extends Component {
  static propTypes = {
    isPublished: PropTypes.bool,
    style: PropTypes.object
  };

  getAvailableActions = function () {
    return [
      i18n.rename(),
      i18n.remix(),
      this.props.isPublished ? i18n.removeFromPublicGallery() : i18n.publishToPublicGallery()
    ];
  };

  render() {
    return (
      <div style={[styles.actionBox, this.props.style]}>
        {(this.getAvailableActions()).map((action, index) => (
          <div key={index} style={styles.actionText}>
            {action}
          </div>
        ))}
        <div style={styles.delete}>
          <FontAwesome icon=" fa-times-circle" style={styles.xIcon}/>
          {i18n.deleteProject()}
        </div>
      </div>
    );
  }
}

export default Radium(ProjectActionBox);
