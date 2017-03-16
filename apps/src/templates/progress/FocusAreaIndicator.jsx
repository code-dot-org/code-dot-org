import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    display: 'inline-block',
    position: 'absolute',
    right: 0,
    top: 0
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
    top: -3
  },
  text: {
    display: 'inline-block'
  },
  focusAreaIcon: {
    marginLeft: 10,
    marginRight: 10
  }
};

// TODO - i18n
const FocusAreaIndicator = () => (
  <div style={styles.main}>
    <div style={styles.arrowContainer}>
      <div style={styles.leftArrow}/>
    </div>
    <div style={styles.focusArea}>
      <div style={styles.text}>Focus Area</div>
      <FontAwesome icon="pencil" style={styles.focusAreaIcon}/>
    </div>
  </div>
);

export default FocusAreaIndicator;
