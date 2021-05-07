import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from '@cdo/apps/util/color';
import {levelWithProgressType} from './progressTypes';
import {getIconForLevel} from './progressHelpers';
import ProgressPill from './ProgressPill';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';

/**
 * A set of one or more levels that are part of the same progression
 */
class ProgressLevelSet extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string,
    onBubbleClick: PropTypes.func,
    // Redux
    isRtl: PropTypes.bool
  };

  render() {
    const {
      name,
      levels,
      disabled,
      selectedSectionId,
      onBubbleClick,
      isRtl
    } = this.props;

    const multiLevelStep = levels.length > 1;
    const url = multiLevelStep || onBubbleClick ? undefined : levels[0].url;
    const onClick = multiLevelStep ? undefined : () => onBubbleClick(levels[0]);

    // Adjust column styles if locale is RTL
    const col2Style = isRtl ? styles.col2RTL : styles.col2;

    let pillText, icon;
    let progressStyle = false;
    if (levels[0].isUnplugged || levels[levels.length - 1].isUnplugged) {
      // We explicitly don't want any text in this case
      if (multiLevelStep) {
        pillText = '';
        icon = getIconForLevel(levels[0]);
      } else {
        pillText = i18n.unpluggedActivity();
        progressStyle = true;
      }
    } else {
      pillText = levels[0].levelNumber.toString();
      icon = getIconForLevel(levels[0]);
      if (multiLevelStep) {
        pillText += `-${levels[levels.length - 1].levelNumber}`;
      }
    }

    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.col1}>
              <ProgressPill
                levels={levels}
                icon={icon}
                text={pillText}
                disabled={disabled}
                selectedSectionId={selectedSectionId}
                progressStyle={progressStyle}
                onSingleLevelClick={onBubbleClick}
              />
            </td>
            <td style={col2Style}>
              <a href={url} onClick={onClick}>
                <div style={{...styles.nameText, ...styles.text}}>{name}</div>
              </a>
            </td>
          </tr>
          {multiLevelStep && (
            <tr>
              <td>
                <div style={styles.linesAndDot}>
                  <div style={styles.verticalLine} />
                  <div style={styles.horizontalLine} />
                  <div style={styles.dot} />
                </div>
              </td>
              <td style={styles.col2}>
                <ProgressBubbleSet
                  levels={levels}
                  disabled={disabled}
                  selectedSectionId={selectedSectionId}
                  onBubbleClick={onBubbleClick}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

const styles = {
  table: {
    marginTop: 12
  },
  nameText: {
    color: color.charcoal
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    letterSpacing: -0.12
  },
  col2: {
    paddingLeft: 20
  },
  col2RTL: {
    paddingRight: 20
  },
  linesAndDot: {
    whiteSpace: 'nowrap',
    marginLeft: '50%',
    marginRight: 14
  },
  verticalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    height: 15,
    width: 3,
    position: 'relative',
    bottom: 2
  },
  horizontalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    position: 'relative',
    top: -2,
    height: 3,
    width: '100%'
  },
  dot: {
    display: 'inline-block',
    position: 'relative',
    left: -2,
    top: 1,
    backgroundColor: color.lighter_gray,
    height: 10,
    width: 10,
    borderRadius: 10
  }
};

export const UnconnectedProgressLevelSet = ProgressLevelSet;

export default connect(state => ({
  isRtl: state.isRtl
}))(Radium(ProgressLevelSet));
