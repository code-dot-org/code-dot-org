/**
 * A collection of components for displaying the purple header used in a few
 * places in our apps. The parent component is a PaneHeader that can be toggled
 * as focused or not. We then have child components of PaneSection and PaneButton.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import commonStyles from '../commonStyles';
import styleConstants from '../styleConstants';
import color from '../util/color';

/**
 * A purple pane header that can have be focused (purple) or unfocused (light purple).
 */
class PaneHeader extends React.Component {
  static propTypes = {
    hasFocus: PropTypes.bool.isRequired,
    style: PropTypes.object,
    teacherOnly: PropTypes.bool,
    isMinecraft: PropTypes.bool
  };

  render() {
    let {hasFocus, teacherOnly, style, isMinecraft, ...props} = this.props;

    // TODO: AnimationTab should likely use components from PaneHeader, at
    // which point purpleHeader style should move in here.
    const composedStyle = {
      ...style,
      ...commonStyles.purpleHeader,
      ...(!hasFocus && commonStyles.purpleHeaderUnfocused),
      ...(teacherOnly && commonStyles.teacherBlueHeader),
      ...(teacherOnly && !hasFocus && commonStyles.teacherHeaderUnfocused),
      ...(isMinecraft && commonStyles.minecraftHeader)
    };

    return <div {...props} style={composedStyle} />;
  }
}

const styles = {
  paneSection: {
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: styleConstants['workspace-headers-height'],
    lineHeight: styleConstants['workspace-headers-height'] + 'px'
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
 * A section of our Pane Header. Essentially this is just a div with some
 * particular styles applied
 */
export const PaneSection = Radium(
  class extends React.Component {
    static propTypes = {
      style: PropTypes.object
    };

    render() {
      return (
        <div
          {...this.props}
          ref={root => (this.root = root)}
          style={{...styles.paneSection, ...this.props.style}}
        />
      );
    }
  }
);

/**
 * A button within or PaneHeader, whose styles change whether or not the pane
 * has focus
 */
export const PaneButton = Radium(function(props) {
  const divStyle = {
    ...styles.headerButton,
    ...(props.isRtl !== !!props.leftJustified && styles.headerButtonRtl),
    ...(props.isMinecraft && styles.headerButtonMinecraft),
    ...(props.isPressed && styles.headerButtonPressed),
    ...(!props.headerHasFocus && styles.headerButtonUnfocused),
    ...props.style
  };

  let iconStyle = {
    ...styles.headerButtonIcon,
    ...(props.isRtl && styles.headerButtonIconRtl)
  };

  const label = props.isPressed ? props.pressedLabel : props.label;

  if (!label) {
    iconStyle = {...iconStyle, ...styles.headerButtonNoLabel};
  }

  return (
    <div id={props.id} style={divStyle} onClick={props.onClick}>
      <span style={styles.headerButtonSpan}>
        {props.hiddenImage}
        <i className={props.iconClass} style={iconStyle} />
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
  style: PropTypes.object
};

export default Radium(PaneHeader);
