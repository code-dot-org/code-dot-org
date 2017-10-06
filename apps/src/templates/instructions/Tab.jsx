import React, {PropTypes} from 'react';
import color from "../../util/color";

var styles = {
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

const Tab = React.createClass({
  propTypes: {
    class: PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.object,
    text: PropTypes.string
  },

  render(){
    return (
      <a
        className={this.props.class}
        onClick={this.props.onClick}
        style={{...styles.tab, ...(this.props.style)}}
      >
        {this.props.text}
      </a>
    );
  }
});

export default Tab;
