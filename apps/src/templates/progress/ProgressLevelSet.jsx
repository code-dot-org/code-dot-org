import React, { PropTypes } from 'react';
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
  stepButton: {
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
    levels: PropTypes.arrayOf(levelType).isRequired
  },

  render() {
    const { name, levels, start } = this.props;

    const multiLevelStep = levels.length > 1;
    const status = multiLevelStep ? 'multi_level' : levels[0].status;

    const url = levels[0].url;

    // TODO - dont have this be hardcoded/get icons right
    const icon = "file-text-o";

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
                <div style={{...styles.stepButton, ...BUBBLE_COLORS[status]}}>
                  <FontAwesome icon={icon}/>
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
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    );
  }
});

export default ProgressLevelSet;
