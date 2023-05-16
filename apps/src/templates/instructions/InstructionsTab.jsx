import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../util/color';
import classNames from 'classnames';
import moduleStyles from './instructions-tab.module.scss';

const craftStyles = {
  text: {
    color: color.white,
  },
  highlighted: {
    color: color.white,
  },
  highlightedWrapper: {
    borderBottom: '2px solid ' + color.white,
  },
};

export default class InstructionsTab extends Component {
  static propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    text: PropTypes.string.isRequired,
    isLegacyTextColor: PropTypes.bool,
    teacherOnly: PropTypes.bool,
    isMinecraft: PropTypes.bool,
    isRtl: PropTypes.bool,
  };

  render() {
    const {isLegacyTextColor} = this.props;

    const highlightedWrapperStyle = isLegacyTextColor
      ? styles.legacyHighlightedWrapper
      : styles.highlightedWrapper;
    const wrapperStyle = {
      ...styles.tabWrapper,
      ...(this.props.isRtl ? styles.tabRtl : styles.tab),
      ...(this.props.selected
        ? this.props.teacherOnly
          ? styles.teacherHighlightedWrapper
          : this.props.isMinecraft
          ? craftStyles.highlightedWrapper
          : highlightedWrapperStyle
        : this.props.teacherOnly
        ? styles.teacherText
        : {}),
    };
    const highlightedTextStyle = isLegacyTextColor
      ? styles.legacyHighlightedText
      : styles.highlighted;
    const defaultTextStyle = isLegacyTextColor
      ? styles.legacyText
      : styles.defaultText;
    const combinedStyle = {
      ...this.props.style,
      ...styles.text,
      ...(this.props.selected
        ? this.props.teacherOnly
          ? styles.teacherHighlighted
          : this.props.isMinecraft
          ? craftStyles.highlighted
          : highlightedTextStyle
        : this.props.teacherOnly
        ? styles.teacherText
        : this.props.isMinecraft
        ? craftStyles.text
        : defaultTextStyle),
    };
    return (
      <button
        style={wrapperStyle}
        onClick={this.props.onClick}
        className={classNames(moduleStyles.tabButton, 'no-mc')}
        type="button"
      >
        <a
          className={this.props.className}
          style={combinedStyle}
          title={this.props.text}
        >
          {this.props.text}
        </a>
      </button>
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
    whiteSpace: 'nowrap',
  },
  tabRtl: {
    marginLeft: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 4,
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabWrapper: {
    overflow: 'hidden',
    display: 'flex',
  },
  defaultText: {
    color: color.neutral_white,
  },
  legacyText: {
    color: color.charcoal,
  },
  text: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  teacherText: {
    color: color.lightest_cyan,
  },
  highlighted: {
    color: color.neutral_white,
  },
  legacyHighlightedText: {
    color: color.default_text,
  },
  highlightedWrapper: {
    borderBottom: '2px solid ' + color.neutral_white,
  },
  legacyHighlightedWrapper: {
    borderBottom: '2px solid ' + color.default_text,
  },
  teacherHighlighted: {
    color: color.white,
  },
  teacherHighlightedWrapper: {
    color: color.lightest_cyan,
    borderBottom: '2px solid ' + color.lightest_cyan,
  },
};
