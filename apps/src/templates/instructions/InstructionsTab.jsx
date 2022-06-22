import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../util/color';

const craftStyles = {
  text: {
    color: color.white
  },
  highlighted: {
    color: color.white
  },
  highlightedWrapper: {
    borderBottom: '2px solid ' + color.white
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
    const wrapperStyle = {
      ...styles.tabWrapper,
      ...(this.props.isRtl ? styles.tabRtl : styles.tab),
      ...(this.props.selected
        ? this.props.teacherOnly
          ? styles.teacherHighlightedWrapper
          : this.props.isMinecraft
          ? craftStyles.highlightedWrapper
          : styles.highlightedWrapper
        : {})
    };
    const combinedStyle = {
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
      <div style={wrapperStyle}>
        <a
          className={this.props.className}
          onClick={this.props.onClick}
          style={combinedStyle}
          title={this.props.text}
        >
          {this.props.text}
        </a>
      </div>
    );
  }
}

const styles = {
  tab: {
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 4,
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  tabRtl: {
    marginLeft: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 4,
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  tabWrapper: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  text: {
    color: color.charcoal
  },
  teacherText: {
    color: color.lightest_cyan
  },
  highlighted: {
    color: color.default_text
  },
  highlightedWrapper: {
    borderBottom: '2px solid ' + color.default_text
  },
  teacherHighlighted: {
    color: color.white
  },
  teacherHighlightedWrapper: {
    borderBottom: '2px solid ' + color.lightest_cyan
  }
};
