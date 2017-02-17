import React, { PropTypes } from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import { levelType, lessonType } from './progressTypes';

const lighterBorder = color.border_light_gray;

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderLeftColor: color.border_gray,
    borderTopColor: color.border_gray,
    borderRightColor: lighterBorder,
    borderBottomColor: lighterBorder
  },
  headerRow: {
    backgroundColor: color.table_header,
  },
  lightRow: {
    backgroundColor: color.table_light_row
  },
  darkRow: {
    backgroundColor: color.table_dark_row
  },
  col1: {
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    lineHeight: '52px',
    color: color.charcoal,
    letterSpacing: -0.11,
    whiteSpace: 'nowrap',
    paddingLeft: 20,
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: lighterBorder,
    borderRightStyle: 'solid',
  },
  col2: {
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20
  },
  colText: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

const SummaryProgressTable = React.createClass({
  propTypes: {
    lessons: PropTypes.arrayOf(lessonType).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired,
  },

  render() {
    const { lessons, levelsByLesson } = this.props;
    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={styles.col1}>
              <div style={styles.colText}>{i18n.lessonName()}</div>
            </td>
            <td style={styles.col2}>
              <div style={styles.colText}>{i18n.yourProgress()}</div>
            </td>
          </tr>
        </thead>
        <tbody>
          {
            lessons.map((lesson, index) => (
              <tr
                key={index}
                style={(index % 2 === 0) ? styles.lightRow : styles.darkRow}
              >
                <td style={styles.col1}>
                  <div style={styles.colText}>
                    {`${index + 1}. ${lesson.name}`}
                  </div>
                </td>
                <td style={styles.col2}>
                  <ProgressBubbleSet
                    start={1}
                    levels={levelsByLesson[index]}
                  />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
});

export default SummaryProgressTable;
