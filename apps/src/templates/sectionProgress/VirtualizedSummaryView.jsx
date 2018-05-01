import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { MultiGrid } from 'react-virtualized';
import styleConstants from '../../styleConstants';
import { sectionDataPropType, scriptDataPropType, getLevels } from './sectionProgressRedux';
import StudentProgressSummaryCell from '../sectionProgress/StudentProgressSummaryCell';
import SectionProgressLessonNumberCell from '../sectionProgress/SectionProgressLessonNumberCell';
import color from "../../util/color";
import {progressStyles, ROW_HEIGHT, NAME_COLUMN_WIDTH, MAX_TABLE_SIZE} from './multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from './SectionProgressNameCell';

const SUMMARY_COLUMN_WIDTH = 40;

class VirtualizedSummaryView extends Component {

  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    getLevels: PropTypes.func,
  };

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 1,
    scrollToColumn: 0,
    scrollToRow: 0,
  };

  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    // Subtract 1 to account for the header row.
    const studentStartIndex = rowIndex-1;
    // Subtract 1 to account for the student name column.
    const stageIdIndex = columnIndex-1;

    // Override default cell style from multigrid
    let cellStyle = {
      ...style,
      ...progressStyles.cell,
    };

    // Student rows
    if (studentStartIndex >= 0) {
      return this.studentCellRenderer(studentStartIndex, stageIdIndex, key, cellStyle);
    }

    // Header rows
    return (
      <div className={progressStyles.Cell} key={key} style={cellStyle}>
        {(rowIndex === 0 && columnIndex === 0) &&
          <div style={progressStyles.lessonHeading}>
            {i18n.lesson()}
          </div>
        }
        {(rowIndex === 0 && columnIndex >= 1) &&
          <SectionProgressLessonNumberCell
            lessonNumber={columnIndex}
          />
        }
      </div>
    );
  };

  studentCellRenderer = (studentStartIndex, stageIdIndex, key, style) => {
    const {section, scriptData, getLevels} = this.props;

    // Alternate background colour of each row
    if (studentStartIndex%2 === 1) {
      style = {
        ...style,
        backgroundColor: color.background_gray,
      };
    }

    const student = section.students[studentStartIndex];

    return (
      <div className={progressStyles.Cell} key={key} style={style}>
        {(stageIdIndex < 0) &&
          <SectionProgressNameCell
            name={student.name}
            studentId={student.id}
            sectionId={section.id}
            scriptId={scriptData.id}
          />
        }
        {(stageIdIndex >= 0) &&
          <StudentProgressSummaryCell
            studentId={student.id}
            levelsWithStatus={getLevels(student.id, stageIdIndex)}
            style={progressStyles.summaryCell}
          />
        }
      </div>
    );
  };

  getColumnWidth = ({index}) => {
    if (index === 0) {
      return NAME_COLUMN_WIDTH;
    }
    return SUMMARY_COLUMN_WIDTH;
  };

  render() {
    const {section, scriptData, lessonOfInterest} = this.props;
    // Add 1 to account for the header row
    const rowCount = section.students.length + 1;
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
      />
    );
  }
}

export const UnconnectedVirtualizedSummaryView = VirtualizedSummaryView;

export default connect(state => ({
  lessonOfInterest: state.sectionProgress.lessonOfInterest,
  getLevels: (studentId, stageId) => getLevels(state, studentId, stageId),
}))(VirtualizedSummaryView);
