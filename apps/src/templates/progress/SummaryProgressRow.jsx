import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
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
    borderColor: color.border_gray
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
    hidden: PropTypes.bool.isRequired,

    // redux provided
    sectionId: PropTypes.string,
    hiddenStageMap: PropTypes.object.isRequired,
  },

  render() {
    const { dark, lesson, lessonNumber, levels, hidden } = this.props;
    return (
      <tr
        style={{
          ...dark ? styles.darkRow: styles.lightRow,
          ...(hidden && styles.hiddenRow)
        }}
      >
        <td style={styles.col1}>
          <div style={styles.colText}>
            {hidden &&
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
export default connect(state => ({
  sectionId: state.sections.selectedSectionId,
  hiddenStageMap: state.hiddenStage.get('bySection'),
}))(SummaryRow);
