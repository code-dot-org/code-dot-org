import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from "@cdo/apps/util/color";

const lighterBorder = '#D8D8D8';

// TODO - figure out responsiveness
const styles = {
  table: {
    backgroundColor: '#F6F6F6'
    // TODO - get borderRadius working correctly (mgith be able to have all of
    // our existing borders become less complicated?)
    // TODO - current approach makes it so that we have a 1 pixel difference in
    // top border?
  },
  headerRow: {
    borderTopWidth: 1,
    borderTopColor: color.border_gray,
    borderTopStyle: 'solid',
    backgroundColor: '#ECECEC',
  },
  bottomRow: {
    borderBottomWidth: 1,
    // TODO - should this be primary or secondary?
    borderBottomColor: lighterBorder,
    borderBottomStyle: 'solid',
  },
  lightRow: {
    backgroundColor: '#FCFCFC'
  },
  darkRow: {
    // TODO - this wasnt provided to me
    backgroundColor: '#F4F4F4'
  },
  col1: {
    borderLeftWidth: 1,
    borderLeftColor: color.border_gray,
    borderLeftStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: lighterBorder,
    borderRightStyle: 'solid',
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    lineHeight: '52px',
    color: '#5B6770',
    letterSpacing: -0.11,
    whiteSpace: 'nowrap',
    paddingLeft: 20,
    paddingRight: 20
  },
  col2: {
    width: '100%',
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: lighterBorder,
    paddingLeft: 20,
    paddingRight: 20
  },
  colText: {
    color: '#5B6770',
    // TODO - "correct" font?
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

// TODO - i18n
const ProgressTable = React.createClass({
  render() {
    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={styles.col1}>
              <div style={styles.colText}>Stage Name</div>
            </td>
            <td style={styles.col2}>
              <div style={styles.colText}>Your Progress</div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.lightRow}>
            <td style={styles.col1}>
              <div style={styles.colText}>1. Happy Maps</div>
            </td>
            <td style={styles.col2}>
              <ProgressBubbleSet
                startingNumber={1}
                statuses={["perfect", "not_tried", "attempted", "passed", "submitted"]}
              />
            </td>
          </tr>
          <tr style={styles.darkRow}>
            <td style={styles.col1}>
              <div style={styles.colText}>2. Move it, Move it</div>
            </td>
            <td style={styles.col2}>
              <ProgressBubbleSet
                startingNumber={1}
                statuses={["perfect", "not_tried", "not_tried", "not_tried"]}
              />
            </td>
          </tr>
          <tr style={{...styles.lightRow, ...styles.bottomRow}}>
            <td style={styles.col1}>
              <div style={styles.colText}>3. Real-life Algorithms: Plant a Seed</div>
            </td>
            <td style={styles.col2}>
              <ProgressBubbleSet
                startingNumber={1}
                statuses={[
                  "perfect", "not_tried", "not_tried", "not_tried", "not_tried",
                  "not_tried", "not_tried", "not_tried", "not_tried", "not_tried",
                  "not_tried", "not_tried", "not_tried", "not_tried", "not_tried",
                  "not_tried", "not_tried", "not_tried", "not_tried", "not_tried"
                ]}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
});

export default ProgressTable;
