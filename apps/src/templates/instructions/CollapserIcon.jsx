import React, {PropTypes, Component} from 'react';
import Radium from 'radium';
import color from "../../util/color";
import styleConstants from '../../styleConstants';

const styles = {
  showHideButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: color.white
    }
  },
  teacherOnlyColor: {
    color: color.lightest_cyan,
    ':hover': {
      cursor: 'pointer',
      color: color.default_text
    }
  },
};

/**
 * Simple icon that either points up or down, and supports onClick
 */
class CollapserIcon extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    teacherOnly: PropTypes.bool
  };

  render() {
    const iconClass = this.props.collapsed ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up';

    const combinedStyle = {
      ...styles.showHideButton,
      ...(this.props.teacherOnly && styles.teacherOnlyColor)
    };
    return (
      <i
        id="ui-test-collapser"
        style={combinedStyle}
        onClick={this.props.onClick}
        className={iconClass + " fa"}
      />
    );
  }
}



export default Radium(CollapserIcon);
