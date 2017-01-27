import React, { PropTypes } from 'react';
import FontAwesome from '../FontAwesome';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from "@cdo/apps/util/color";

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/progress_dot';

const styles = {
  main: {
  },
  stepButton: {
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
  text: {
    display: 'inline-block',
    color: color.charcoal,
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
    status: PropTypes.string,
    name: PropTypes.string.isRequired
  },

  render() {
    const { status, name } = this.props;

    // TODO - think about different widths for step 9 vs. step 10
    return (
      <table>
        <tbody>
          <tr>
            <td>
              <div style={{...styles.stepButton, ...BUBBLE_COLORS[status]}}>
                <FontAwesome icon="file-text-o"/>
                <div style={{...styles.buttonText, ...styles.text}}>
                  STEP 1
                </div>
              </div>
            </td>
            <td style={styles.col2}>
              <div style={styles.text}>
                {name}
              </div>
            </td>
          </tr>
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
                start={1}
                levels={[
                  {
                    status: 'perfect',
                    url: '/foo/bar',
                  },
                  {
                    status: 'not_tried',
                    url: '/foo/bar',
                  },
                  {
                    status: 'not_tried',
                    url: '/foo/bar',
                  },
                  {
                    status: 'not_tried',
                    url: '/foo/bar',
                  },
                  {
                    status: 'not_tried',
                    url: '/foo/bar',
                  },
                ]}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
});

export default ProgressStageStep;
