import React, { PropTypes } from 'react';
import FontAwesome from '../FontAwesome';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from "@cdo/apps/util/color";

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/progress_dot';

const styles = {
  table: {
    marginTop: 12
  },
  stepButton: {
    // TODO - this could get us into trouble with i18n?
    width: 90,
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
  // TODO - validate these all look good on other browsers
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

const ProgressStageStep = React.createClass({
  propTypes: {
    start: PropTypes.number.isRequired,
    name: PropTypes.string,
    levels: PropTypes.arrayOf(
      PropTypes.shape({
        level: PropTypes.string,
        url: PropTypes.string
      })
    ).isRequired
  },

  render() {
    const { name, levels, start } = this.props;

    const multiLevelStep = levels.length > 1;
    // TODO - if all the levels have the same status, should we fill it in for
    // the step button?
    const status = multiLevelStep ? 'not_tried' : levels[0].status;

    // In the multiLevel case, clicking the step will take us to the first level
    // TODO possible we dont want the above behavior
    const url = levels[0].url;

    // TODO - dont have this be hardcoded/get icons right
    const icon = "file-text-o";

    const lastStep = start + levels.length - 1;
    let stepNumber = start;
    if (multiLevelStep) {
      stepNumber += `-${lastStep}`;
    }

    // TODO - think about different widths for step 9 vs. step 10
    // TODO - should step button turn orange on mouseover?
    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td>
              <a href={url}>
                <div style={{...styles.stepButton, ...BUBBLE_COLORS[status]}}>
                  <FontAwesome icon={icon}/>
                  <div style={{...styles.buttonText, ...styles.text}}>
                    STEP {stepNumber}
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

export default ProgressStageStep;
