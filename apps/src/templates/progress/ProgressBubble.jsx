import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import Radium from 'radium';
import color from "@cdo/apps/util/color";
import NewProgressBubble from './NewProgressBubble';
import { levelType } from './progressTypes';

export const DOT_SIZE = 30;

const styles = {
  main: {
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 12,
    letterSpacing: -0.11,
    lineHeight: DOT_SIZE + 'px',
    textAlign: 'center',
    display: 'inline-block',
    marginLeft: 3,
    marginRight: 3,
    marginTop: 5,
    marginBottom: 5,
    transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
  },
  enabled: {
    ':hover': {
      textDecoration: 'none',
      color: color.white,
      backgroundColor: color.level_current
    }
  },
  tooltipIcon: {
    paddingRight: 5,
    paddingLeft: 5
  }
};

const ProgressBubble = createReactClass({
  propTypes: {
    level: levelType.isRequired,
    disabled: PropTypes.bool.isRequired,
  },

  render() {
    return <NewProgressBubble {...this.props}/>;
  }
});
ProgressBubble.displayName = 'ProgressBubble';

// Expose our height, as ProgressBubbleSet needs this to stick the little gray
// connector between bubbles
ProgressBubble.height = DOT_SIZE + styles.main.marginTop + styles.main.marginBottom;

export default Radium(ProgressBubble);
