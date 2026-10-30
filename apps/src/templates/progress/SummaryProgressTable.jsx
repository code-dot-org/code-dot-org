import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {lessonIsVisible} from './progressHelpers';
import {groupedLessonsType} from './progressTypes';
import SummaryProgressRow, {styles as rowStyles} from './SummaryProgressRow';

class SummaryProgressTable extends React.Component {
  static propTypes = {
    groupedLesson: groupedLessonsType.isRequired,
    minimal: PropTypes.bool,
    isOnLevelView: PropTypes.bool,

    // redux provided
    lessonIsVisible: PropTypes.func.isRequired,
  };

  render() {
    const {minimal, isOnLevelView} = this.props;
    const {lessons, levelsByLesson} = this.props.groupedLesson;

    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

    return (
      <table className="uitest-summary-progress-table" style={styles.table}>
        {!minimal && (
          <thead>
            <tr style={styles.headerRow}>
              <td style={rowStyles.col1}>
                <Typography
                  variant="body4"
                  component="div"
                  sx={{fontWeight: 600}}
                >
                  {i18n.lessonName()}
                </Typography>
              </td>
              <td style={rowStyles.col2}>
                <Typography
                  variant="body4"
                  component="div"
                  sx={{fontWeight: 600}}
                >
                  {i18n.progress()}
                </Typography>
              </td>
            </tr>
          </thead>
        )}
        <tbody>
          {
            /*Filter our lessons to those that will be rendered, and then make
            every other (remaining) one dark */
            lessons
              .map((lesson, index) => ({unfilteredIndex: index, lesson}))
              .filter(item => this.props.lessonIsVisible(item.lesson))
              .map((item, filteredIndex) => (
                <SummaryProgressRow
                  key={item.unfilteredIndex}
                  levels={levelsByLesson[item.unfilteredIndex]}
                  lesson={item.lesson}
                  dark={filteredIndex % 2 === 1}
                  isOnLevelView={isOnLevelView}
                />
              ))
          }
        </tbody>
      </table>
    );
  }
}

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderLeftColor: 'var(--borders-neutral-primary)',
    borderTopColor: 'var(--borders-neutral-primary)',
    borderBottomColor: 'var(--borders-neutral-secondary)',
    borderRightColor: 'var(--borders-neutral-secondary)',
  },
  headerRow: {
    backgroundColor: 'var(--background-neutral-secondary)',
  },
};

export const UnconnectedSummaryProgressTable = SummaryProgressTable;
export default connect(state => ({
  lessonIsVisible: lesson => lessonIsVisible(lesson, state, state.viewAs),
}))(SummaryProgressTable);
