import React, { Component, PropTypes } from 'react';
import { MultiGrid } from 'react-virtualized';
import styleConstants from '../../styleConstants';
import { sectionDataPropType, scriptDataPropType, studentLevelProgressPropType } from './sectionProgressRedux';
import StudentProgressSummaryCell from '../sectionProgress/StudentProgressSummaryCell';
import color from "../../util/color";
import {progressStyles, ROW_HEIGHT, NAME_COLUMN_WIDTH, MAX_TABLE_SIZE} from './multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from './SectionProgressNameCell';

const SUMMARY_COLUMN_WIDTH = 50;

export default class VirtualizedDetailView extends Component {

  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    studentLevelProgress: studentLevelProgressPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired
  };

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 1,
    scrollToColumn: 0,
    scrollToRow: 0,
  };

  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {section, scriptData, studentLevelProgress} = this.props;
    // Subtract 1 to account for the header row.
    const studentStartIndex = rowIndex-1;
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
        {(rowIndex === 0 && columnIndex === 0) &&
          <span style={progressStyles.lessonHeading}>
            {i18n.lesson()}
          </span>
        }
        {(rowIndex === 0 && columnIndex >= 1) &&
          <div style={progressStyles.lessonNumberHeading}>
            {columnIndex}
          </div>
        }
        {(rowIndex >= 1 && columnIndex === 0) &&
          <SectionProgressNameCell
            name={section.students[studentStartIndex].name}
            studentId={section.students[studentStartIndex].id}
            sectionId={section.id}
            scriptId={scriptData.id}
          />
        }
        {(rowIndex >= 1 && columnIndex > 0) &&
          <StudentProgressSummaryCell
            studentId={section.students[studentStartIndex].id}
            section={section}
            studentLevelProgress={studentLevelProgress}
            stageId={stageIdIndex}
            scriptData={scriptData}
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
