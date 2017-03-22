/**
 * A component that adds a ribbon to the side of your row to indicate that it is
 * a focus area. Note: This is English only.
 */

import React from 'react';
import Radium from 'radium';
import ReactTooltip from 'react-tooltip';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    display: 'inline-block',
    position: 'absolute',
    right: 0,
    top: 0,
    whiteSpace: 'nowrap'
  },
  arrowContainer: {
    display: 'inline-block',
    position: 'relative',
    top: 10
  },
  leftArrow: {
    display: 'inline-block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '17px 20px 17px',
    borderColor: `transparent ${color.cyan} transparent transparent`
  },
  focusArea: {
    display: 'inline-block',
    backgroundColor: color.cyan,
    color: color.white,
    height: 34,
    lineHeight: '34px',
    position: 'relative',
    top: -3,
  },
  text: {
    display: 'inline-block'
  },
  focusAreaIcon: {
    display: 'inline-block',
    color: color.white,
    lineHeight: '13px',
    padding: 5,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 4,
    ':hover': {
      backgroundColor: color.default_blue,
    }
  }
};

const FocusAreaIndicator = () => (
  <div style={styles.main}>
    <div style={styles.arrowContainer}>
      <div style={styles.leftArrow}/>
    </div>
    <div style={styles.focusArea}>
      <div style={styles.text}>Focus Area</div>
      <a href={window.location.pathname + "/preview-assignments"} >
        <div style={styles.focusAreaIcon} data-tip data-for="focus-area">
          <FontAwesome icon="pencil"/>
        </div>
      </a>
    </div>
    <ReactTooltip
      id="focus-area"
      role="tooltip"
      effect="solid"
    >
      Click to change your focus area.
    </ReactTooltip>
  </div>
);

export default Radium(FocusAreaIndicator);
