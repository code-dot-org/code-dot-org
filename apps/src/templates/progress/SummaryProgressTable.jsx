import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import { levelType, lessonType } from './progressTypes';
import SummaryProgressRow, { styles as rowStyles } from './SummaryProgressRow';
import { connect } from 'react-redux';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

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
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    sectionId: PropTypes.string,
    hiddenStageState: PropTypes.object.isRequired,
  },

  render() {
    const { lessons, levelsByLesson, viewAs, sectionId, hiddenStageState } = this.props;
    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

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
          {/*Filter our lessons to those that will be rendered, and then make
            every other (remaining) one dark*/
            lessons.map((lesson, index) => ({
              key: index,
              lessonNumber: index + 1,
              levels: levelsByLesson[index],
              lesson,
              viewAs,
              sectionId,
              hiddenStageState
            }))
            .filter(props => SummaryProgressRow.shouldRender(props))
            .map((props, index) => (
              <SummaryProgressRow
                {...props}
                dark={index % 2 === 1}
              />
            ))
          }
        </tbody>
      </table>
    );
  }
});

// Provide non-connected version for testing
export const UnconnectedSummaryProgressTable = SummaryProgressTable;

export default connect(state => ({
  viewAs: state.stageLock.viewAs,
  sectionId: state.sections.selectedSectionId,
  hiddenStageState: state.hiddenStage,
}))(SummaryProgressTable);
