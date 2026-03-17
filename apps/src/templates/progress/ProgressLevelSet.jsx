import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import ProgressBubbleSet from './ProgressBubbleSet';
import {getIconForLevel} from './progressHelpers';
import ProgressPill from './ProgressPill';
import moduleStyles from './progress-level-set.module.scss';
import {levelWithProgressType} from './progressTypes';

/**
 * A set of one or more levels that are part of the same progression
 */
class ProgressLevelSet extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    lessonName: PropTypes.string,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.number,
    onBubbleClick: PropTypes.func,
    // Redux
    isRtl: PropTypes.bool,
  };

  render() {
    const {
      name,
      levels,
      disabled,
      selectedSectionId,
      onBubbleClick,
      isRtl,
      lessonName,
    } = this.props;

    const multiLevelStep = levels.length > 1;
    const url = multiLevelStep || onBubbleClick ? undefined : levels[0].url;
    const onClick = multiLevelStep ? undefined : () => onBubbleClick(levels[0]);

    // Adjust column styles if locale is RTL
    const col2Class = isRtl ? moduleStyles.col2RTL : moduleStyles.col2;

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
      <table className={moduleStyles.table}>
        <tbody>
          <tr>
            <td>
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
            <td className={col2Class}>
              <a href={url} onClick={onClick}>
                <div className={moduleStyles.nameText}>{name}</div>
              </a>
            </td>
          </tr>
          {multiLevelStep && (
            <tr>
              <td>
                <div className={moduleStyles.linesAndDot}>
                  <div className={moduleStyles.verticalLine} />
                  <div className={moduleStyles.horizontalLine} />
                  <div className={moduleStyles.dot} />
                </div>
              </td>
              <td className={moduleStyles.col2}>
                <ProgressBubbleSet
                  levels={levels}
                  disabled={disabled}
                  selectedSectionId={selectedSectionId}
                  onBubbleClick={onBubbleClick}
                  lessonName={lessonName}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export const UnconnectedProgressLevelSet = ProgressLevelSet;

export default connect(state => ({
  isRtl: state.isRtl,
}))(ProgressLevelSet);
