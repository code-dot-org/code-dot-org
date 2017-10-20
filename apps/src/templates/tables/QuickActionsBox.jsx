import React, {Component, PropTypes} from 'react';
import color from "../../util/color";
import Radium from 'radium';

const styles = {
  actionBox: {
    width: 180,
    padding: '10px 15px',
    border: '1px solid ' + color.lighter_gray,
    borderRadius: 2,
    backgroundColor: color.white,
    boxShadow: "2px 2px 2px " + color.light_gray,
    marginTop: 5,
  },
};

class QuickActionsBox extends Component {
  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
  };

  render() {
    return (
      <div style={[styles.actionBox, this.props.style]}>
        {this.props.children}
      </div>
    );
  }
}

export default Radium(QuickActionsBox);
