import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {groupedLessonsType} from './progressTypes';
import SummaryProgressRow, {styles as rowStyles} from './SummaryProgressRow';
import {connect} from 'react-redux';
import {lessonIsVisible} from './progressHelpers';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

class SummaryProgressTable extends React.Component {
  static propTypes = {
    groupedLesson: groupedLessonsType.isRequired,
    minimal: PropTypes.bool,

    // redux provided
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    lessonIsVisible: PropTypes.func.isRequired
  };

  render() {
    const {viewAs, minimal} = this.props;
    const {lessons, levelsByLesson} = this.props.groupedLesson;

    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

    return (
      <table style={styles.table}>
        {!minimal && (
          <thead>
            <tr style={styles.headerRow}>
              <td style={rowStyles.col1}>
                <div style={rowStyles.colText}>{i18n.lessonName()}</div>
              </td>
              <td style={rowStyles.col2}>
                <div style={rowStyles.colText}>{i18n.progress()}</div>
              </td>
            </tr>
          </thead>
        )}
        <tbody>
          {/*Filter our lessons to those that will be rendered, and then make
            every other (remaining) one dark */
          lessons
            .map((lesson, index) => ({unfilteredIndex: index, lesson}))
            .filter(item => this.props.lessonIsVisible(item.lesson, viewAs))
            .map((item, filteredIndex) => (
              <SummaryProgressRow
                key={item.unfilteredIndex}
                levels={levelsByLesson[item.unfilteredIndex]}
                lesson={item.lesson}
                dark={filteredIndex % 2 === 1}
              />
            ))}
        </tbody>
      </table>
    );
  }
}

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderLeftColor: color.border_gray,
    borderTopColor: color.border_gray,
    borderBottomColor: color.border_light_gray,
    borderRightColor: color.border_light_gray
  },
  headerRow: {
    backgroundColor: color.table_header
  }
};

export const UnconnectedSummaryProgressTable = SummaryProgressTable;
export default connect(state => ({
  viewAs: state.viewAs,
  lessonIsVisible: (lesson, viewAs) => lessonIsVisible(lesson, state, viewAs)
}))(SummaryProgressTable);
