/**
 * A collection of components for displaying the purple header used in a few
 * places in our apps. The parent component is a PaneHeader that can be toggled
 * as focused or not. We then have child components of PaneSection and PaneButton.
 */

import React, {PropTypes} from 'react';
var Radium = require('radium');

var commonStyles = require('../commonStyles');
var styleConstants = require('../styleConstants');
var color = require("../util/color");

var styles = {
  paneSection: {
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: styleConstants["workspace-headers-height"],
    lineHeight: styleConstants["workspace-headers-height"] + 'px',
  },
  headerButton: {
    cursor: 'pointer',
    float: 'right',
    overflow: 'hidden',
    backgroundColor: color.light_purple,
    marginTop: 3,
    marginBottom: 3,
    marginRight: 3,
    marginLeft: 0,
    height: 24,
    borderRadius: 4,
    fontFamily: '"Gotham 5r", sans-serif',
    lineHeight: '18px',
    ':hover': {
      backgroundColor: color.cyan
    }
  },
  headerButtonRtl: {
    float: 'left',
    marginLeft: 3,
    marginRight: 0
  },
  headerButtonMinecraft: {
    backgroundColor: '#606060',
    color: '#BFBFBF',
    border: 'none',
    ':hover': {
      backgroundColor: '#606060',
      color: color.white
    }
  },
  headerButtonUnfocused: {
    backgroundColor: color.lightest_purple
  },
  headerButtonPressed: {
    backgroundColor: color.white,
    color: color.purple,
    ':hover': {
      color: color.white
    }
  },
  headerButtonSpan: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 0,
    paddingBottom: 0
  },
  headerButtonIcon: {
    lineHeight: '24px',
    paddingRight: 8,
    fontSize: 15,
    fontWeight: 'bold'
  },
  headerButtonIconRtl: {
    paddingRight: 0,
    paddingLeft: 8
  },
  headerButtonNoLabel: {
    paddingRight: 0,
    paddingLeft: 0
  }
};

/**
 * A purple pane header that can have be focused (purple), unfocused (light purple)
 * or read only (charcoal).
 */
const PaneHeader = Radium(React.createClass({
  propTypes: {
    hasFocus: PropTypes.bool.isRequired,
    readOnly: PropTypes.bool,
    style: PropTypes.object
  },

  render: function () {
    var {hasFocus, readOnly, style, ...props} = this.props;

    // TODO: AnimationTab should likely use components from PaneHeader, at
    // which point purpleHeader style should move in here.
    style = [
      style,
      commonStyles.purpleHeader,
      !hasFocus && commonStyles.purpleHeaderUnfocused,
      readOnly && commonStyles.purpleHeaderReadOnly,
    ];

    return (
      <div {...props} style={style}/>
    );
  }
}));

/**
 * A section of our Pane Header. Essentially this is just a div with some
 * particular styles applied
 */
export const PaneSection = Radium(React.createClass({
  propTypes: {
    style: PropTypes.object,
  },

  render() {
    return (
      <div
        {...this.props}
        ref={root => this.root = root}
        style={[styles.paneSection, this.props.style]}
      />
    );
  },
}));

/**
 * A button within or PaneHeader, whose styles change whether or not the pane
 * has focus
 */
export const PaneButton = Radium(function (props) {
  var divStyle = [
    styles.headerButton,
    (props.isRtl !== !!props.leftJustified) && styles.headerButtonRtl,
    props.isMinecraft && styles.headerButtonMinecraft,
    props.isPressed && styles.headerButtonPressed,
    !props.headerHasFocus && styles.headerButtonUnfocused,
    props.style,
  ];
  var iconStyle = [
    styles.headerButtonIcon,
    props.isRtl && styles.headerButtonIconRtl,
  ];

  var label = props.isPressed ? props.pressedLabel : props.label;

  if (!label) {
    iconStyle.push(styles.headerButtonNoLabel);
  }

  return (
    <div
      id={props.id}
      style={divStyle}
      onClick={props.onClick}
    >
      <span style={styles.headerButtonSpan}>
        {props.hiddenImage}
        <i className={props.iconClass} style={iconStyle}/>
        <span style={styles.noPadding}>{label}</span>
      </span>
    </div>
  );
});
PaneButton.propTypes = {
  headerHasFocus: PropTypes.bool.isRequired,
  iconClass: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isRtl: PropTypes.bool.isRequired,
  leftJustified: PropTypes.bool,
  isPressed: PropTypes.bool,
  pressedLabel: PropTypes.string,
  onClick: PropTypes.func,
  hiddenImage: PropTypes.element,
  isMinecraft: PropTypes.bool,
  id: PropTypes.string,
  style: PropTypes.object,
};

export default PaneHeader;
