import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from "@cdo/apps/util/color";
import ReactTooltip from 'react-tooltip';
import FontAwesome from '../FontAwesome';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import _ from 'lodash';
import experiments from '@cdo/apps/util/experiments';
import NewProgressBubble from './NewProgressBubble';
import { getIconForLevel } from './progressHelpers';
import { levelType } from './progressTypes';

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';

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

const ProgressBubble = React.createClass({
  propTypes: {
    level: levelType.isRequired,
    disabled: PropTypes.bool.isRequired,
  },

  render() {
    const level = this.props.level;
    const number = level.levelNumber;
    const status = level.status;
    const url = level.url;
    const levelName = level.name || level.progression;
    const levelIcon = getIconForLevel(level);

    const disabled = this.props.disabled || levelIcon === 'lock';

    const style = {
      ...styles.main,
      ...(!disabled && styles.enabled),
      ...(BUBBLE_COLORS[disabled ? LevelStatus.not_tried : status])
    };

    let href = '';
    if (!disabled && url) {
      href = url + location.search;
    }

    const tooltipId = _.uniqueId();
    const interior = levelIcon === 'lock' ? <FontAwesome icon="lock"/> : number;

    let bubble = (
      <div style={style} data-tip data-for={tooltipId} aria-describedby={tooltipId}>
        {interior}
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
        >
          <FontAwesome icon={levelIcon} style={styles.tooltipIcon}/>
          {levelName}
        </ReactTooltip>
      </div>
    );

    // If we have an href, wrap in an achor tag
    if (href) {
      bubble = (
        <a href={href}>
          {bubble}
        </a>
      );
    }

    return bubble;
  }
});

// Expose our height, as ProgressBubbleSet needs this to stick the little gray
// connector between bubbles
ProgressBubble.height = DOT_SIZE + styles.main.marginTop + styles.main.marginBottom;

// If progressBubbles is enabled, use our NewProgressBubble instead
let ExportedProgressBubble = Radium(ProgressBubble);
if (experiments.isEnabled('progressBubbles')) {
  ExportedProgressBubble = NewProgressBubble;
}
export default ExportedProgressBubble;
