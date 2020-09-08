import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

const styles = {
  flagNormal: {
    color: color.white
  },
  checkFlagNormal: {
    color: color.lighter_gray
  },
  perfect: {
    color: color.level_perfect
  },
  hoverOverlay: {
    ':hover': {
      color: color.orange
    }
  },
  smallStack: {
    width: '1em',
    height: '1em',
    lineHeight: '1em'
  }
};

class LessonExtrasFlagIcon extends Component {
  static propTypes = {
    perfect: PropTypes.bool,
    style: PropTypes.object
  };

  render() {
    const {perfect, style} = this.props;

    return (
      <div style={style}>
        <span className="fa-stack fa-1x" style={styles.smallStack}>
          <i className="fa fa-flag fa-stack-1x" style={styles.flagNormal} />
          <i
            className="fa fa-flag-checkered fa-stack-1x"
            style={{
              ...styles.checkFlagNormal,
              ...styles.hoverOverlay,
              ...(perfect && styles.perfect)
            }}
          />
        </span>
      </div>
    );
  }
}

export default Radium(LessonExtrasFlagIcon);
