import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import ProgressBubbleSet from './ProgressBubbleSet';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { levelType, lessonType } from './progressTypes';

export const styles = {
  lightRow: {
    backgroundColor: color.table_light_row
  },
  darkRow: {
    backgroundColor: color.table_dark_row
  },
  hiddenRow: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: color.border_gray,
    opacity: 0.6,
    backgroundColor: color.table_light_row
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
    borderRightColor: color.border_light_gray,
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
  },
  icon: {
    marginRight: 5,
    fontSize: 12,
    color: color.cyan
  }
};

const SummaryRow = React.createClass({
  propTypes: {
    dark: PropTypes.bool.isRequired,
    lesson: lessonType.isRequired,
    lessonNumber: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    hiddenForStudents: PropTypes.bool.isRequired,
  },

  render() {
    const { dark, lesson, lessonNumber, levels, hiddenForStudents } = this.props;
    return (
      <tr
        style={{
          ...(!dark && styles.lightRow),
          ...(dark && styles.darkRow),
          ...(hiddenForStudents && styles.hiddenRow)
        }}
      >
        <td style={styles.col1}>
          <div style={styles.colText}>
            {hiddenForStudents &&
              <FontAwesome
                icon="eye-slash"
                style={styles.icon}
              />
            }
            {`${lessonNumber}. ${lesson.name}`}
          </div>
        </td>
        <td style={styles.col2}>
          <ProgressBubbleSet
            start={1}
            levels={levels}
          />
        </td>
      </tr>
    );
  }
});
export default SummaryRow;
