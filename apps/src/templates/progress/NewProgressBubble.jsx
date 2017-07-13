import React, { PropTypes } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';
import color from "@cdo/apps/util/color";
import FontAwesome from '../FontAwesome';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { getIconForLevel } from './progressHelpers';
import { levelType } from './progressTypes';

/**
 * As we do another redesign of our bubbles, this module represents the new version
 * The goal is that the two are interchangeable, and once the redesign is finished
 * we can delete ProgressBubble.jsx and replace it with this.
 */

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';

export const DOT_SIZE = 30;
const SQUARE_DOT_SIZE = 20;
const SMALL_DOT_SIZE = 7;
// TODO: small diamonds

// TODO:(bjvanminnen) - The line behind a set of ProgressBubbles doesnt seem to
// be quite vertically centered. This should be addressed at some point.

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
    // Top/Bottom margin of 5 is needed to get unplugged pills to line up correctly
    marginTop: 5,
    marginBottom: 5,
    transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
  },
  diamond: {
    width: SQUARE_DOT_SIZE,
    height: SQUARE_DOT_SIZE,
    lineHeight: SQUARE_DOT_SIZE + 'px',
    marginTop: 10,
    marginBottom: 10,
    // slightly more margin to account for the fact that this is computed on the
    // pre-rotated diamond
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 0,
    transform: 'rotate(45deg)'
  },
  contents: {
    whiteSpace: 'nowrap'
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
  enabled: {
    ':hover': {
      textDecoration: 'none',
      color: color.white,
      backgroundColor: color.level_current
    }
  },
  smallBubble: {
    width: SMALL_DOT_SIZE,
    height: SMALL_DOT_SIZE,
    borderRadius: SMALL_DOT_SIZE,
    lineHeight: SMALL_DOT_SIZE + 'px',
    fontSize: 0,
    marginLeft: 2,
    marginRight: 2
  },
  tooltip: {
    lineHeight: DOT_SIZE + 'px',
  },
  tooltipIcon: {
    paddingRight: 5,
    paddingLeft: 5
  },
  smallBubbleSpan: {
    // lineHeight is necessary so that small bubbles get properly centered
    lineHeight: '17px'
  }
};

const NewProgressBubble = React.createClass({
  propTypes: {
    level: levelType.isRequired,
    disabled: PropTypes.bool.isRequired,
    smallBubble: PropTypes.bool,
  },

  render() {
    const { level, smallBubble } = this.props;

    const number = level.levelNumber;
    const status = level.status;
    const url = level.url;
    const levelName = level.name || level.progression;
    const levelIcon = getIconForLevel(level);

    const disabled = this.props.disabled || levelIcon === 'lock';

    const style = {
      ...styles.main,
      ...(!disabled && styles.enabled),
      ...(smallBubble && styles.smallBubble),
      ...(level.isConceptLevel && styles.diamond),
      ...(BUBBLE_COLORS[disabled ? LevelStatus.not_tried : status])
    };

    let href = '';
    if (!disabled && url) {
      href = url + location.search;
    }

    const tooltipId = _.uniqueId();

    let bubble = (
      <div
        style={style}
        data-tip data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <div
          style={{
            ...styles.contents,
            ...(level.isConceptLevel && styles.diamondContents)
          }}
        >
          {levelIcon === 'lock' && <FontAwesome icon="lock"/>}
          {levelIcon !== 'lock' && (
            <span
              style={smallBubble ? styles.smallBubbleSpan : undefined}
            >
              {number}
            </span>
          )}
          <ReactTooltip
            id={tooltipId}
            role="tooltip"
            wrapper="span"
            effect="solid"
          >
            <div style={styles.tooltip}>
              <FontAwesome icon={levelIcon} style={styles.tooltipIcon}/>
              {number}. {levelName}
            </div>
          </ReactTooltip>
        </div>
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
NewProgressBubble.height = DOT_SIZE + styles.main.marginTop + styles.main.marginBottom;

export default Radium(NewProgressBubble);
