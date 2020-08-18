import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {MultiGrid} from 'react-virtualized';
import StudentProgressDetailCell from '@cdo/apps/templates/sectionProgress/detail/StudentProgressDetailCell';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '../../../styleConstants';
import {
  getColumnWidthsForDetailView,
  getLevels,
  setLessonOfInterest
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import color from '../../../util/color';
import {
  progressStyles,
  ROW_HEIGHT,
  LAST_ROW_MARGIN_HEIGHT,
  MAX_TABLE_SIZE,
  PROGRESS_BUBBLE_WIDTH,
  DIAMOND_BUBBLE_WIDTH,
  tooltipIdForLessonNumber
} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from '@cdo/apps/templates/sectionProgress/SectionProgressNameCell';

const ARROW_PADDING = 60;
// Only show arrow next to lesson numbers if column is larger than a single small bubble and it's margin.
const MAX_COLUMN_WITHOUT_ARROW =
  Math.max(PROGRESS_BUBBLE_WIDTH, DIAMOND_BUBBLE_WIDTH) + 10;

const styles = {
  numberHeader: {
    ...progressStyles.lessonNumberHeading,
    margin: 0,
    paddingLeft: 16
  },
  lessonHeaderContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 2,
    borderBottom: '2px solid',
    borderColor: color.border_gray,
    height: 42
  },
  // Arrow ---> built with CSS requires negative margin
  lessonLine: {
    marginTop: 18,
    marginRight: -8,
    width: 100,
    height: 2,
    backgroundColor: color.charcoal
  },
  lessonArrow: {
    border: 'solid ' + color.charcoal,
    borderWidth: '0 2px 2px 0',
    display: 'inline-block',
    padding: 3,
    marginTop: 15,
    marginRight: 2,
    transform: 'rotate(-45deg)',
    WebkitTransform: 'rotate(-45deg)'
  },
  bubbleSet: {
    paddingLeft: 4
  }
};

class VirtualizedDetailView extends Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    columnWidths: PropTypes.arrayOf(PropTypes.number).isRequired,
    getLevels: PropTypes.func,
    onScroll: PropTypes.func,
    stageExtrasEnabled: PropTypes.bool
  };

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 2,
    scrollToColumn: 0,
    scrollToRow: 0
  };

  componentWillReceiveProps(nextProps) {
    // When we replace the script, re-compute the column widths
    if (this.props.scriptData.id !== nextProps.scriptData.id) {
      this.refs.detailView.recomputeGridSize();
      this.refs.detailView.measureAllCells();
    }
  }

  onClickLevel = lessonOfInterest => {
    this.props.setLessonOfInterest(lessonOfInterest);
  };

  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {scriptData, columnWidths} = this.props;
    // Subtract 2 to account for the 2 header rows.
    // We don't want leave off the first 2 students.
    const studentStartIndex = rowIndex - 2;
    // Subtract 1 to account for the student name column.
    const stageIdIndex = columnIndex - 1;

    // Override default cell style from multigrid
    let cellStyle = {
      ...style,
      ...progressStyles.cell
    };

    // Student rows
    if (studentStartIndex >= 0) {
      return this.studentCellRenderer(
        studentStartIndex,
        stageIdIndex,
        key,
        cellStyle
      );
    }

    const stageData = columnIndex > 0 && scriptData.stages[columnIndex - 1];

    // Header rows
    return (
      <div className={progressStyles.Cell} key={key} style={cellStyle}>
        {rowIndex === 0 && columnIndex === 0 && (
          <div style={progressStyles.lessonLabelContainer}>
            <span style={progressStyles.lessonHeading}>{i18n.lesson()}</span>
          </div>
        )}
        {rowIndex === 0 && columnIndex >= 1 && (
          <div style={styles.lessonHeaderContainer}>
            <div
              onClick={() => this.onClickLevel(columnIndex)}
              style={styles.numberHeader}
              data-tip
              data-for={tooltipIdForLessonNumber(columnIndex)}
            >
              {stageData.lockable ? (
                <FontAwesome icon="lock" />
              ) : (
                stageData.relative_position
              )}
            </div>
            {columnWidths[columnIndex] > MAX_COLUMN_WITHOUT_ARROW && (
              <div
                style={{
                  ...styles.lessonLine,
                  width: columnWidths[columnIndex] - ARROW_PADDING
                }}
              />
            )}
            {columnWidths[columnIndex] > MAX_COLUMN_WITHOUT_ARROW && (
              <div>
                <i style={styles.lessonArrow} />
              </div>
            )}
          </div>
        )}
        {rowIndex === 1 && columnIndex === 0 && (
          <div style={progressStyles.lessonLabelContainer}>
            <div style={progressStyles.lessonHeading}>{i18n.levelType()}</div>
          </div>
        )}
        {rowIndex === 1 && columnIndex >= 1 && (
          <span style={styles.bubbleSet}>
            {scriptData.stages[stageIdIndex].levels.map((level, i) => {
              return (
                <span key={i}>
                  <FontAwesome
                    icon={getIconForLevel(level, true)}
                    style={
                      level.isUnplugged
                        ? progressStyles.unpluggedIcon
                        : progressStyles.icon
                    }
                  />
                  {level.sublevels &&
                    level.sublevels.map((sublevel, i) => {
                      return (
                        <span
                          className="filler"
                          key={i}
                          style={{
                            width: 17,
                            display: 'inline-block',
                            color: color.background_gray
                          }}
                        >
                          .
                        </span>
                      );
                    })}
                </span>
              );
            })}
          </span>
        )}
      </div>
    );
  };

  studentCellRenderer = (studentStartIndex, stageIdIndex, key, style) => {
    const {section, getLevels, stageExtrasEnabled} = this.props;

    // Alternate background colour of each row
    if (studentStartIndex % 2 === 1) {
      style = {
        ...style,
        backgroundColor: color.background_gray
      };
    }

    const student = section.students[studentStartIndex];

    return (
      <div className={progressStyles.Cell} key={key} style={style}>
        {stageIdIndex < 0 && (
          <SectionProgressNameCell
            name={student.name}
            studentId={student.id}
            sectionId={section.id}
          />
        )}
        {stageIdIndex >= 0 && (
          <StudentProgressDetailCell
            studentId={student.id}
            sectionId={section.id}
            stageId={stageIdIndex}
            stageExtrasEnabled={stageExtrasEnabled}
            levelsWithStatus={getLevels(student.id, stageIdIndex)}
          />
        )}
      </div>
    );
  };

  getColumnWidth = ({index}) => {
    return this.props.columnWidths[index] || 0;
  };

  render() {
    const {section, scriptData, lessonOfInterest, onScroll} = this.props;
    // Add 2 to account for the 2 header rows
    const rowCount = section.students.length + 2;
    // Add 1 to account for the student name column
    const columnCount = scriptData.stages.length + 1;
    // Calculate height based on the number of rows
    const tableHeightFromRowCount =
      ROW_HEIGHT * rowCount + LAST_ROW_MARGIN_HEIGHT;
    // Use a 'maxHeight' of 680 for when there are many rows
    const tableHeight = Math.min(tableHeightFromRowCount, MAX_TABLE_SIZE);

    return (
      <MultiGrid
        {...this.state}
        cellRenderer={this.cellRenderer}
        columnWidth={this.getColumnWidth}
        columnCount={columnCount}
        enableFixedColumnScroll
        rowHeight={ROW_HEIGHT}
        height={tableHeight}
        scrollToColumn={lessonOfInterest}
        scrollToAlignment={'start'}
        rowCount={rowCount}
        style={progressStyles.multigrid}
        styleBottomLeftGrid={progressStyles.bottomLeft}
        styleTopLeftGrid={progressStyles.topLeft}
        styleTopRightGrid={progressStyles.topRight}
        width={styleConstants['content-width']}
        ref="detailView"
        onScroll={onScroll}
      />
    );
  }
}

export const UnconnectedVirtualizedDetailView = VirtualizedDetailView;

export default connect(
  state => ({
    columnWidths: getColumnWidthsForDetailView(state),
    lessonOfInterest: state.sectionProgress.lessonOfInterest,
    getLevels: (studentId, stageId) => getLevels(state, studentId, stageId)
  }),
  dispatch => ({
    setLessonOfInterest(lessonOfInterest) {
      dispatch(setLessonOfInterest(lessonOfInterest));
    }
  })
)(VirtualizedDetailView);
