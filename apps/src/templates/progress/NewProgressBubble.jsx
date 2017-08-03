import React, { PropTypes } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import i18n from '@cdo/locale';
import color from "@cdo/apps/util/color";
import FontAwesome from '../FontAwesome';
import { getIconForLevel } from './progressHelpers';
import { levelType } from './progressTypes';
import {
  DOT_SIZE,
  DIAMOND_DOT_SIZE,
  SMALL_DOT_SIZE,
  SMALL_DIAMOND_SIZE,
  levelProgressStyle,
  hoverStyle
} from './progressStyles';
import ProgressPill from '@cdo/apps/templates/progress/ProgressPill';
import TooltipWithIcon from './TooltipWithIcon';

/**
 * As we do another redesign of our bubbles, this module represents the new version
 * The goal is that the two are interchangeable, and once the redesign is finished
 * we can delete ProgressBubble.jsx and replace it with this.
 */

const styles = {
  main: {
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 16,
    letterSpacing: -0.11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
    marginTop: 3,
    marginBottom: 3,
  },
  largeDiamond: {
    width: DIAMOND_DOT_SIZE,
    height: DIAMOND_DOT_SIZE,
    borderRadius: 4,
    transform: 'rotate(45deg)'
  },
  small: {
    width: SMALL_DOT_SIZE,
    height: SMALL_DOT_SIZE,
    borderRadius: SMALL_DOT_SIZE,
    fontSize: 0,
  },
  smallDiamond: {
    width: SMALL_DIAMOND_SIZE,
    height: SMALL_DIAMOND_SIZE,
    borderRadius: 2,
    fontSize: 0,
    transform: 'rotate(45deg)',
    marginLeft: 1,
    marginRight: 1,
  },
  contents: {
    whiteSpace: 'nowrap',
    fontSize: 16,
    lineHeight: '16px',
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
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
    let tooltipText = levelName ||
      (level.isUnplugged && i18n.unpluggedActivity()) || '';
    if (number) {
      tooltipText = `${number}. ${tooltipText}`;
    }

    const tooltip = (
      <TooltipWithIcon
        tooltipId={tooltipId}
        icon={levelIcon}
        text={tooltipText}
      />
    );

    if (level.isUnplugged && !smallBubble) {
      return (
        <ProgressPill
          levels={[level]}
          text={i18n.unpluggedActivity()}
          fontSize={16}
          tooltip={tooltip}
        />
      );
    }

    // Outer div here is used to make sure our bubbles all take up equivalent
    // amounts of space, whether they're diamonds or circles
    let bubble = (
      <div
        style={{
          // two pixles on each side for border, 2 pixels on each side for margin
          width: (smallBubble ? SMALL_DOT_SIZE : DOT_SIZE) + 8,
          display: 'flex',
          justifyContent: 'center'
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
              <span>
                {/*Text will not show up for smallBubble, but it's presence
                  causes bubble to be properly aligned vertically
                  */}
                {smallBubble ? '' : number}
              </span>
            )}
            {tooltip}
          </div>
        </div>
      </div>
    );

    // If we have an href, wrap in an achor tag
    if (href) {
      bubble = (
        <a href={href} style={{textDecoration: 'none'}}>
          {bubble}
        </a>
      );
    }

    return bubble;
  }
});

export default Radium(NewProgressBubble);
