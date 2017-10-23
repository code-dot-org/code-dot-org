import React, {Component, PropTypes} from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Radium from 'radium';

const styles = {
  actionText: {
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal,
    padding: '10px 0px',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer',
    },
  },
  delete: {
    color: color.red,
    fontSize: 14,
  },
  lineAbove: {
    borderTop: '1px solid ' + color.lighter_gray,
  },
  xIcon: {
    paddingRight: 5
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
};

class QuickAction extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    hasLineAbove: PropTypes.bool,
    isDelete: PropTypes.bool,
    style: PropTypes.object
  };

  render() {
    const lineAboveStyle = this.props.hasLineAbove ? styles.lineAbove : {};
    return (
      <div>
        {!this.props.isDelete &&
          <div style={[styles.actionText, lineAboveStyle]} onClick={this.props.action}>
            {this.props.text}
          </div>
        }
        {!!this.props.isDelete &&
          <div style={[styles.actionText, styles.delete, lineAboveStyle]} onClick={this.props.action}>
            <FontAwesome icon=" fa-times-circle" style={styles.xIcon}/>
            {this.props.text}
          </div>
        }
      </div>
    );
  }
}

export default Radium(QuickAction);
