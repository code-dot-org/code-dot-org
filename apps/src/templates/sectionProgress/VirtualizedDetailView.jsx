import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { MultiGrid } from 'react-virtualized';
import StudentProgressDetailCell from '@cdo/apps/templates/sectionProgress/StudentProgressDetailCell';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '../../styleConstants';
import {
  sectionDataPropType,
  scriptDataPropType,
  studentLevelProgressPropType,
  getColumnWidthsForDetailView
} from './sectionProgressRedux';
import { getIconForLevel } from '@cdo/apps/templates/progress/progressHelpers';
import color from "../../util/color";
import {
  progressStyles,
  ROW_HEIGHT,
  MAX_TABLE_SIZE,
  PROGRESS_BUBBLE_WIDTH,
  DIAMOND_BUBBLE_WIDTH,
} from './multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from './SectionProgressNameCell';

const ARROW_PADDING = 60;
// Only show arrow next to lesson numbers if column is larger than a single small bubble
const MAX_COLUMN_WITHOUT_ARROW = Math.max(PROGRESS_BUBBLE_WIDTH, DIAMOND_BUBBLE_WIDTH);

const styles = {
  numberHeader: {
    ...progressStyles.lessonNumberHeading,
    margin: 0,
    paddingLeft: 16,
    width: 39,
  },
  lessonHeaderContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 2,
    borderBottom: '2px solid',
    borderColor: color.border_gray,
    height: 42,
  },
  lessonLabelContainer: {
    borderBottom: '2px solid',
    borderColor: color.border_gray,
    height: 44,
    paddingTop: 8,
  },
  // Arrow ---> built with CSS requires negative margin
  lessonLine: {
    marginTop: 18,
    marginRight: -8,
    width: 100,
    height: 2,
    backgroundColor: color.charcoal,
  },
  lessonArrow: {
    border: 'solid ' + color.charcoal,
    borderWidth: '0 2px 2px 0',
    display: 'inline-block',
    padding: 3,
    marginTop: 15,
    transform: 'rotate(-45deg)',
    WebkitTransform: 'rotate(-45deg)',
  },
};

class VirtualizedDetailView extends Component {

  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    studentLevelProgress: studentLevelProgressPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    columnWidths: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 2,
    scrollToColumn: 0,
    scrollToRow: 0,
  };

  componentWillReceiveProps(nextProps) {
    // When we replace the script, re-compute the column widths
    if (this.props.scriptData.id !== nextProps.scriptData.id) {
      this.refs.detailView.recomputeGridSize();
      this.refs.detailView.measureAllCells();
    }
  }

  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {section, scriptData, studentLevelProgress, columnWidths} = this.props;
    // Subtract 2 to account for the 2 header rows.
    // We don't want leave off the first 2 students.
    const studentStartIndex = rowIndex-2;
    // Subtract 1 to account for the student name column.
    const stageIdIndex = columnIndex-1;

    // Override default cell style from multigrid
    let cellStyle = {
      ...style,
      ...progressStyles.cell,
    };
    // Alternate background colour of each row
    if (studentStartIndex%2 === 1) {
      cellStyle = {
        ...cellStyle,
        backgroundColor: color.background_gray,
      };
    }

    return (
      <div className={progressStyles.Cell} key={key} style={cellStyle}>
        {(rowIndex === 0 && columnIndex === 0) && (
          <div style={styles.lessonLabelContainer}>
            <span style={progressStyles.lessonHeading}>
              {i18n.lesson()}
            </span>
          </div>
        )}
        {(rowIndex === 0 && columnIndex >= 1) && (
          <div style={styles.lessonHeaderContainer}>
            <div style={styles.numberHeader}>
              {columnIndex}
            </div>
            {(columnWidths[columnIndex] > MAX_COLUMN_WITHOUT_ARROW) &&
              <div style={{...styles.lessonLine, width: columnWidths[columnIndex] - ARROW_PADDING}}>
              </div>
            }
            {(columnWidths[columnIndex] > MAX_COLUMN_WITHOUT_ARROW) &&
              <div>
                <i style={styles.lessonArrow}></i>
              </div>
            }
          </div>
        )}
        {(rowIndex === 1 && columnIndex === 0) && (
          <div style={progressStyles.lessonHeading}>
            {i18n.levelType()}
          </div>
        )}
        {(rowIndex === 1 && columnIndex >= 1) && (
          <span>
            {scriptData.stages[stageIdIndex].levels.map((level, i) =>
              <FontAwesome
                icon={getIconForLevel(level)}
                style={
                  level.kind === "unplugged" ? progressStyles.unpluggedIcon : progressStyles.icon
                }
                key={i}
              />
            )}
          </span>
        )}
        {(rowIndex >= 2 && columnIndex === 0) && (
          <SectionProgressNameCell
            name={section.students[studentStartIndex].name}
            studentId={section.students[studentStartIndex].id}
            sectionId={section.id}
            scriptId={scriptData.id}
          />
        )}
        {rowIndex > 1 && columnIndex > 0 && (
          <StudentProgressDetailCell
            studentId={section.students[studentStartIndex].id}
            studentLevelProgress={studentLevelProgress}
            stageId={stageIdIndex}
            scriptData={scriptData}
          />
        )}
      </div>
    );
  };

  getColumnWidth = ({index}) => {
    return this.props.columnWidths[index] || 0;
  };

  render() {
    const {section, scriptData, lessonOfInterest} = this.props;
    // Add 2 to account for the 2 header rows
    const rowCount = section.students.length + 2;
    // Add 1 to account for the student name column
    const columnCount = scriptData.stages.length + 1;
    // Calculate height based on the number of rows
    const tableHeightFromRowCount = ROW_HEIGHT * rowCount;
    // Use a 'maxHeight' of 680 for when there are many rows
    const tableHeight = Math.min(tableHeightFromRowCount, MAX_TABLE_SIZE);

    return (
      <MultiGrid
        {...this.state}
        cellRenderer={this.cellRenderer}
        columnWidth={this.getColumnWidth}
        columnCount={columnCount}
        enableFixedColumnScroll
        enableFixedRowScroll
        rowHeight={ROW_HEIGHT}
        height={tableHeight}
        scrollToColumn={lessonOfInterest}
        scrollToAlignment={"start"}
        rowCount={rowCount}
        style={progressStyles.multigrid}
        styleBottomLeftGrid={progressStyles.bottomLeft}
        styleTopLeftGrid={progressStyles.topLeft}
        styleTopRightGrid={progressStyles.topRight}
        width={styleConstants['content-width']}
        ref="detailView"
      />
    );
  }
}

export const UnconnectedVirtualizedDetailView = VirtualizedDetailView;

export default connect(state => ({
  columnWidths: getColumnWidthsForDetailView(state),
  lessonOfInterest: state.sectionProgress.lessonOfInterest
}))(VirtualizedDetailView);
