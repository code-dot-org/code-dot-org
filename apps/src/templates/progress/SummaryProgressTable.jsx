import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import SummaryProgressRow, { styles as rowStyles } from './SummaryProgressRow';
import { isHiddenFromState } from '@cdo/apps/code-studio/hiddenStageRedux';

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderLeftColor: color.border_gray,
    borderTopColor: color.border_gray,
    borderRightColor: color.border_light_gray,
    borderBottomColor: color.border_light_gray
  },
  headerRow: {
    backgroundColor: color.table_header,
  }
};

const SummaryProgressTable = React.createClass({
  propTypes: {
    lessons: PropTypes.arrayOf(lessonType).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired,

    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    sectionId: PropTypes.string,
    hiddenStageMap: PropTypes.object.isRequired,
  },

  render() {
    const { lessons, levelsByLesson, viewAs, sectionId, hiddenStageMap } = this.props;
    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

    let rows = [];
    let dark = false; // start with a light row
    const showHidden = viewAs === ViewType.Teacher;
    lessons.forEach((lesson, index) => {
      // When viewing as a student, we'll filter out hidden rows. When viewing
      // as a teacher, we'll set hiddenForStudents and style the row differntly.
      const isHidden = isHiddenFromState(hiddenStageMap, sectionId, lesson.id);
      if (isHidden && !showHidden) {
        return;
      }
      rows.push(
        <SummaryProgressRow
          key={index}
          hiddenForStudents={isHidden}
          dark={dark}
          lesson={lesson}
          lessonNumber={index + 1}
          levels={levelsByLesson[index]}
        />
      );
      dark = !dark;
    });

    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={rowStyles.col1}>
              <div style={rowStyles.colText}>
                {i18n.lessonName()}
              </div>
            </td>
            <td style={rowStyles.col2}>
              <div style={rowStyles.colText}>
                {i18n.yourProgress()}
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});

// Provide non-connected version for testing
SummaryProgressTable.SummaryProgressTable = SummaryProgressTable;

export default connect(state => ({
  viewAs: state.stageLock.viewAs,
  sectionId: state.sections.selectedSectionId,
  hiddenStageMap: state.hiddenStage.get('bySection'),
}))(SummaryProgressTable);
