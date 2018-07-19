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
  },
  highlighted: {
    borderBottom: "2px solid " + color.default_text,
    color: color.default_text,
  }
};

export default class InstructionsTab extends Component {
  static propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    text: PropTypes.string.isRequired,
  };

  render() {
    const combinedStyle = {
      ...styles.tab,
      ...this.props.style,
      ...(this.props.selected ? styles.highlighted : styles.text)
    };
    return (
      <a
        className={this.props.className}
        onClick={this.props.onClick}
        style={combinedStyle}
      >
        {this.props.text}
      </a>
    );
  }
}
