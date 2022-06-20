import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../util/color';

const craftStyles = {
  text: {
    color: color.white
  },
  highlighted: {
    borderBottom: '2px solid ' + color.white,
    color: color.white
  }
};

export default class InstructionsTab extends Component {
  static propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    text: PropTypes.string.isRequired,
    teacherOnly: PropTypes.bool,
    isMinecraft: PropTypes.bool,
    isRtl: PropTypes.bool
  };

  render() {
    const combinedStyle = {
      ...(this.props.isRtl ? styles.tabRtl : styles.tab),
      ...this.props.style,
      ...(this.props.selected
        ? this.props.teacherOnly
          ? styles.teacherHighlighted
          : this.props.isMinecraft
          ? craftStyles.highlighted
          : styles.highlighted
        : this.props.teacherOnly
        ? styles.teacherText
        : this.props.isMinecraft
        ? craftStyles.text
        : styles.text)
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

const styles = {
  tab: {
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 6,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  tabRtl: {
    marginLeft: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 6,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  text: {
    color: color.charcoal
  },
  teacherText: {
    color: color.lightest_cyan
  },
  highlighted: {
    borderBottom: '2px solid ' + color.default_text,
    color: color.default_text
  },
  teacherHighlighted: {
    borderBottom: '2px solid ' + color.lightest_cyan,
    color: color.white
  }
};
