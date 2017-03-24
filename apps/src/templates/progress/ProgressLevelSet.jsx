import React, { PropTypes } from 'react';
import Radium from 'radium';
import FontAwesome from '../FontAwesome';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import { levelType } from './progressTypes';

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';

const styles = {
  table: {
    marginTop: 12
  },
  levelPill: {
    // TODO - fixed width isn't great for i18n. likely want to come up with some
    // way of having this be dynamic, but the same size across all instances
    width: 110,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5
  },
  hoverStyle: {
    ':hover': {
      textDecoration: 'none',
      color: color.white,
      backgroundColor: color.level_current
    }
  },
  buttonText: {
    marginLeft: 10
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
    paddingLeft: 30
  },
  linesAndDot: {
    whiteSpace: 'nowrap',
    marginLeft: '50%',
    marginRight: 14,
  },
  verticalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    height: 15,
    width: 3,
    position: 'relative',
    bottom: 2,
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

/**
 * A set of one or more levels that are part of the same progression
 */
const ProgressLevelSet = React.createClass({
  propTypes: {
    start: PropTypes.number.isRequired,
    name: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
  },

  getIcon() {
    const { levels } = this.props;
    const level = levels[0];

    // TODO - Once we know what peer reviews are going to look like in the
    // redesign, we'll need add logic for those here.

    if (level.icon) {
      // Eventually I'd like to have dashboard return an icon type. For now, I'm just
      // going to treat the css class it sends as a type, and map it to an icon name.
      const match = /fa-(.*)/.exec(level.icon);
      if (!match || !match[1]) {
        throw new Error('Unknown iconType: ' + level.icon);
      }
      return match[1];
    }

    return 'desktop';
  },

  render() {
    const { name, levels, start, disabled } = this.props;

    const multiLevelStep = levels.length > 1;
    const status = multiLevelStep ? 'multi_level' : levels[0].status;

    const url = levels[0].url;

    const lastStep = start + levels.length - 1;
    let levelNumber = start;
    if (multiLevelStep) {
      levelNumber += `-${lastStep}`;
    }

    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td>
              <a href={multiLevelStep ? undefined : url}>
                <div
                  style={{
                    ...styles.levelPill,
                    ...BUBBLE_COLORS[status],
                    ...(multiLevelStep ? undefined : styles.hoverStyle)
                  }}
                >
                  <FontAwesome icon={this.getIcon()}/>
                  <div style={{...styles.buttonText, ...styles.text}}>
                    {i18n.levelN({levelNumber})}
                  </div>
                </div>
              </a>
            </td>
            <td style={styles.col2}>
              <a href={url}>
                <div style={{...styles.nameText, ...styles.text}}>
                  {name}
                </div>
              </a>
            </td>
          </tr>
          {multiLevelStep &&
            <tr>
              <td>
                <div style={styles.linesAndDot}>
                  <div style={styles.verticalLine}/>
                  <div style={styles.horizontalLine}/>
                  <div style={styles.dot}/>
                </div>
              </td>
              <td style={styles.col2}>
                <ProgressBubbleSet
                  start={start}
                  levels={levels}
                  disabled={disabled}
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    );
  }
});

export default Radium(ProgressLevelSet);
