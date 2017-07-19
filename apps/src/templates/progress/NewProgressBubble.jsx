import React, { PropTypes } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';
import i18n from '@cdo/locale';
import color from "@cdo/apps/util/color";
import FontAwesome from '../FontAwesome';
import { getIconForLevel } from './progressHelpers';
import { levelType } from './progressTypes';
import { levelProgressStyle, hoverStyle } from './progressStyles';
import ProgressPill from '@cdo/apps/templates/progress/ProgressPill';

/**
 * As we do another redesign of our bubbles, this module represents the new version
 * The goal is that the two are interchangeable, and once the redesign is finished
 * we can delete ProgressBubble.jsx and replace it with this.
 */

export const DOT_SIZE = 30;
const DIAMOND_DOT_SIZE = 22;
const SMALL_DOT_SIZE = 9;
const SMALL_DIAMOND_SIZE = 5;

const styles = {
  main: {
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 12,
    letterSpacing: -0.11,
    lineHeight: DOT_SIZE + 'px',
    textAlign: 'center',
    display: 'inline-block',
    marginTop: 3,
    marginBottom: 3,
    transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
  },
  largeDiamond: {
    width: DIAMOND_DOT_SIZE,
    height: DIAMOND_DOT_SIZE,
    lineHeight: DIAMOND_DOT_SIZE + 'px',
    marginTop: 7,
    marginBottom: 7,
    borderRadius: 4,
    transform: 'rotate(45deg)'
  },
  small: {
    width: SMALL_DOT_SIZE,
    height: SMALL_DOT_SIZE,
    borderRadius: SMALL_DOT_SIZE,
    lineHeight: SMALL_DOT_SIZE + 'px',
    fontSize: 0,
    marginTop: 0,
    marginBottom: 0
  },
  smallDiamond: {
    width: SMALL_DIAMOND_SIZE,
    height: SMALL_DIAMOND_SIZE,
    lineHeight: SMALL_DIAMOND_SIZE + 'px',
    borderRadius: 1,
    fontSize: 0,
    transform: 'rotate(45deg)',
    position: 'relative',
    top: 2
  },
  contents: {
    whiteSpace: 'nowrap',
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
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
    const url = level.url;
    const levelName = level.name || level.progression;
    const levelIcon = getIconForLevel(level);

    const disabled = this.props.disabled || levelIcon === 'lock';

    if (level.isUnplugged && !smallBubble) {
      return (
        <ProgressPill
          levels={[level]}
          text={i18n.unpluggedActivity()}
          fontSize={12}
        />
      );
    }

    const style = {
      ...styles.main,
      ...(!disabled && hoverStyle),
      ...(smallBubble && styles.small),
      ...(level.isConceptLevel && (smallBubble ? styles.smallDiamond : styles.largeDiamond)),
      ...levelProgressStyle(level, disabled)
    };

    let href = '';
    if (!disabled && url) {
      href = url + location.search;
    }

    const tooltipId = _.uniqueId();
    let tooltipText = levelName || '';
    if (number) {
      tooltipText = `${number}. ${tooltipText}`;
    }

    // Outer div here is used to make sure our bubbles all take up equivalent
    // amounts of space, whether they're diamonds or circles
    let bubble = (
      <div
        style={{
          display: 'inline-block',
          // two pixles on each side for border, 2 pixels on each side for margin
          width: (smallBubble ? SMALL_DOT_SIZE : DOT_SIZE) + 8,
          textAlign: 'center',
        }}
      >
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
                {/*Text will not show up for smallBubble, but it's presence
                  causes bubble to be properly aligned vertically
                  */}
                {smallBubble ? '-' : number}
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
                {tooltipText}
              </div>
            </ReactTooltip>
          </div>
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
