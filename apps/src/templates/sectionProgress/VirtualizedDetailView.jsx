import React, { Component } from 'react';
import { MultiGrid } from 'react-virtualized';
import StudentProgressDetailCell from '@cdo/apps/templates/sectionProgress/StudentProgressDetailCell';
import LessonSelector from '../sectionProgress/LessonSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '../../styleConstants';
import {
  sectionDataPropType,
  scriptDataPropType,
  studentLevelProgressPropType
} from './sectionProgressRedux';
import color from "../../util/color";
import {progressStyles, ROW_HEIGHT, NAME_COLUMN_WIDTH, MAX_TABLE_SIZE} from './multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from './SectionProgressNameCell';

const PROGRESS_BUBBLE_WIDTH = 39;
// TODO(caleybrock): Calculate the width differently for progress bubbles
// const UNPLUGGED_BUBBLE_WIDTH = 190;

export default class VirtualizedDetailView extends Component {

  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    studentLevelProgress: studentLevelProgressPropType.isRequired,
  };

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 2,
    scrollToColumn: 0,
    scrollToRow: 0,
    lessonOfInterest: 1
  };

  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {section, scriptData, studentLevelProgress} = this.props;
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

    let lessonNumberStyle = {
      ...progressStyles.lessonNumberHeading,
    };

    if (columnIndex === this.state.lessonOfInterest) {
      lessonNumberStyle = {
        ...progressStyles.lessonNumberHeading,
        ...progressStyles.lessonOfInterest
      };
    }

    return (
      <div className={progressStyles.Cell} key={key} style={cellStyle}>
        {(rowIndex === 0 && columnIndex === 0) && (
          <span style={progressStyles.lessonHeading}>
            {i18n.lesson()}
          </span>
        )}
        {(rowIndex === 0 && columnIndex >= 1) && (
          <div style={lessonNumberStyle}>
            {columnIndex}
          </div>
        )}
        {(rowIndex === 1 && columnIndex === 0) && (
          <span style={progressStyles.lessonHeading}>
            {i18n.levelType()}
          </span>
        )}
        {(rowIndex === 1 && columnIndex >= 1) && (
          <span>
            {scriptData.stages[stageIdIndex].levels.map((level, i) =>
              <FontAwesome
                className={level.icon ? level.icon: "fas fa-question"}
                style={progressStyles.icon}
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
            section={section}
            studentLevelProgress={studentLevelProgress}
            stageId={stageIdIndex}
            scriptData={scriptData}
          />
        )}
      </div>
    );
  };

  getColumnWidth = ({index}) => {
    const {scriptData} = this.props;

    // Subtract 1 to account for the student name column.
    const stageIdIndex = index-1;

    if (index === 0) {
      return NAME_COLUMN_WIDTH;
    }
    return scriptData.stages[stageIdIndex].levels.length * PROGRESS_BUBBLE_WIDTH;
  };

  onChangeLevel = lessonNumber => {
    this.setState({lessonOfInterest: lessonNumber});
  };

  render() {
    const {section, scriptData} = this.props;
    // Add 2 to account for the 2 header rows
    const rowCount = section.students.length + 2;
    // Add 1 to account for the student name column
    const columnCount = scriptData.stages.length + 1;
    // Calculate height based on the number of rows
    const tableHeightFromRowCount = ROW_HEIGHT * rowCount;
    // Use a 'maxHeight' of 680 for when there are many rows
    const lessonNumbers =  Array(scriptData.stages.length).fill().map((e,i)=>i+1);
    const tableHeight = Math.min(tableHeightFromRowCount, MAX_TABLE_SIZE);

    return (
      <div>
        <LessonSelector
          lessonNumbers={lessonNumbers}
          onChange={this.onChangeLevel}
        />
        <MultiGrid
          {...this.state}
          cellRenderer={this.cellRenderer}
          columnWidth={this.getColumnWidth}
          columnCount={columnCount}
          enableFixedColumnScroll
          enableFixedRowScroll
          rowHeight={ROW_HEIGHT}
          height={tableHeight}
          scrollToColumn={this.state.lessonOfInterest}
          rowCount={rowCount}
          style={progressStyles.multigrid}
          styleBottomLeftGrid={progressStyles.bottomLeft}
          styleTopLeftGrid={progressStyles.topLeft}
          styleTopRightGrid={progressStyles.topRight}
          width={styleConstants['content-width']}
        />
      </div>
    );
  }
}
