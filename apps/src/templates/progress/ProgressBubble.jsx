import React, { PropTypes } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import queryString from 'query-string';
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
 * A ProgressBubble represents progress for a specific level. It can be a circle
 * or a diamond (or a pill in the case of unplugged levels), and it can be big
 * or small. The fill and outline change depending on the level status.
 */

const styles = {
  main: {
    boxSizing: 'content-box',
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
    // ReactTooltip sets a zIndex of 999. However, because in some cases for us
    // the ReactTooltip is inside of a rotated div, it ends up in a different
    // stacking context, and the zIndex doesn't work. Instead we set it here on
    // the top component
    zIndex: 999,
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

class ProgressBubble extends React.Component {
  static propTypes = {
    level: levelType.isRequired,
    disabled: PropTypes.bool.isRequired,
    smallBubble: PropTypes.bool,
    selectedSectionId: PropTypes.string,
    // This prop is provided as a testing hook, in normal use it will just be
    // set to window.location; see defaultProps.
    currentLocation: PropTypes.object.isRequired,
    stageTrophyEnabled: PropTypes.bool,
    hideToolTips: PropTypes.bool,
  };

  static defaultProps = {
    currentLocation: window.location,
  };

  render() {
    const { level, smallBubble, selectedSectionId, currentLocation, stageTrophyEnabled } = this.props;

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
      ...levelProgressStyle(level, disabled),
    };

    let href = '';
    if (!disabled && url) {
      const queryParams = queryString.parse(currentLocation.search);
      if (selectedSectionId) {
        queryParams.section_id = selectedSectionId;
      }
      const paramString = queryString.stringify(queryParams);
      href = url;
      if (paramString.length > 0) {
        href += '?' + paramString;
      }
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
          tooltip={this.props.hideToolTips ? null : tooltip}
        />
      );
    }

    // Two pixels on each side for border, 2 pixels on each side for margin.
    const width = (smallBubble ? SMALL_DOT_SIZE : DOT_SIZE) + 8;

    // Outer div here is used to make sure our bubbles all take up equivalent
    // amounts of space, whether they're diamonds or circles
    let bubble = (
      <div
        style={{
          // two pixels on each side for border, 2 pixels on each side for margin
          width: stageTrophyEnabled ? width - 3 : width,
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
            {!this.props.hideToolTips && tooltip}
          </div>
        </div>
      </div>
    );

    // If we have an href, wrap in an achor tag
    if (href) {
      bubble = (
        <a href={href} style={{textDecoration: 'none'}} className="uitest-ProgressBubble">
          {bubble}
        </a>
      );
    }

    return bubble;
  }
}

export default Radium(ProgressBubble);
