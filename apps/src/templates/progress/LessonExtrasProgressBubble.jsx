import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';
import {currentLocation} from '../../utils';
import color from '@cdo/apps/util/color';

const styles = {
  main: {
    width: 21,
    height: 24
  },
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

class LessonExtrasProgressBubble extends Component {
  static propTypes = {
    lessonExtrasUrl: PropTypes.string.isRequired,
    perfect: PropTypes.bool
  };

  render() {
    const {lessonExtrasUrl, perfect} = this.props;

    const tooltipId = _.uniqueId();
    return (
      <a
        href={lessonExtrasUrl + currentLocation().search}
        style={styles.main}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <div style={styles.main}>
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
        <TooltipWithIcon
          tooltipId={tooltipId}
          icon={'flag-checkered'}
          text={i18n.stageExtras()}
          // Currently a stage extra can not also be an assessment so this should always be false
          // TODO (dmcavoy) : When we change the way we mark levels as assessment refactor
          includeAssessmentIcon={false}
        />
      </a>
    );
  }
}

export default Radium(LessonExtrasProgressBubble);
