import React, {Component, PropTypes} from 'react';
import color from "../../util/color";

const styles = {
  tab: {
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 6,
    fontWeight: "bold",
    color: color.charcoal,
    cursor: "pointer",
  }
};

export default class InstructionsTab extends Component {
  static propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    text: PropTypes.string.isRequired,
  };

  render() {
    return (
      <a
        className={this.props.className}
        onClick={this.props.onClick}
        style={{...styles.tab, ...(this.props.style)}}
      >
        {this.props.text}
      </a>
    );
  }
}
