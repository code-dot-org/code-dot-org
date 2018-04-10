import React, { Component } from 'react';
import { MultiGrid } from 'react-virtualized';
import StudentProgressDetailCell from '@cdo/apps/templates/sectionProgress/StudentProgressDetailCell';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '../../styleConstants';
import {
  sectionDataPropType,
  scriptDataPropType,
  studentLevelProgressPropType
} from './sectionProgressRedux';
import color from "../../util/color";

const styles = {
  lessonHeading: {
    fontFamily: '"Gotham 5r", sans-serif',
  },
  lessonNumberHeading: {
    margin: '9px 16px',
    fontFamily: '"Gotham 5r", sans-serif',
  },
  multigrid: {
    border: '1px solid',
    borderColor: color.border_gray,
  },
  bottomLeft: {
    borderRight: '2px solid',
    borderColor: color.border_gray,
  },
  topLeft: {
    borderBottom: '2px solid',
    borderRight: '2px solid',
    borderColor: color.border_gray,
    padding: '8px 10px',
    backgroundColor: color.table_header,
  },
  topRight: {
    borderBottom: '2px solid',
    borderRight: '1px solid',
    borderColor: color.border_gray,
    backgroundColor: color.table_header,
  },
  icon: {
    padding: '3px 10px',
    width: 38,
    fontSize: 20,
  },
  link: {
    color: color.teal,
  },
  summaryCell: {
    margin: '8px 12px',
  },
  nameCell: {
    margin: '10px',
  },
  cell: {
    borderRight: '1px solid',
    borderColor: color.border_gray,
  }
};

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
      ...styles.cell,
    };
    // Alternate background colour of each row
    if (studentStartIndex%2 === 1) {
      cellStyle = {
        ...cellStyle,
        backgroundColor: color.background_gray,
      };
    }

    return (
      <div className={styles.Cell} key={key} style={cellStyle}>
        {(rowIndex === 0 && columnIndex === 0) && (
          <span style={styles.lessonHeading}>
            Lesson
          </span>
        )}
        {(rowIndex === 0 && columnIndex >= 1) && (
          <div style={styles.lessonNumberHeading}>
            {columnIndex}
          </div>
        )}
        {(rowIndex === 1 && columnIndex === 0) && (
          <span style={styles.lessonHeading}>
            Level Type
          </span>
        )}
        {(rowIndex === 1 && columnIndex >= 1) && (
          <span style={{}}>
            {scriptData.stages[stageIdIndex].levels.map((level, i) =>
              <FontAwesome
                className={level.icon ? level.icon: "fas fa-question"}
                style={styles.icon}
                key={i}
              />
            )}
          </span>
        )}
        {(rowIndex >= 2 && columnIndex === 0) && (
          <div style={styles.nameCell}>
            <a
              href={`/teacher-dashboard#/sections/${section.id}/student/${section.students[studentStartIndex].id}/script/${scriptData.id}`}
              style={styles.link}
            >
              {section.students[studentStartIndex].name}
            </a>
          </div>
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
    const NAME_COLUMN_WIDTH = 150;
    const PROGRESS_BUBBLE_WIDTH = 39;
    // TODO(caleybrock): Calculate the width differently for progress bubbles
    // const UNPLUGGED_BUBBLE_WIDTH = 100;
    // Subtract 1 to account for the student name column.
    const stageIdIndex = index-1;

    if (index === 0) {
      return NAME_COLUMN_WIDTH;
    }
    return scriptData.stages[stageIdIndex].levels.length * PROGRESS_BUBBLE_WIDTH;
  };

  render() {
    const {section, scriptData} = this.props;
    // Add 2 to account for the 2 header rows
    const rowCount = section.students.length + 2;
    // Add 1 to account for the student name column
    const columnCount = scriptData.stages.length + 1;

    return (
        <MultiGrid
          {...this.state}
          cellRenderer={this.cellRenderer}
          columnWidth={this.getColumnWidth}
          columnCount={columnCount}
          enableFixedColumnScroll
          enableFixedRowScroll
          height={520}
          rowHeight={40}
          rowCount={rowCount}
          style={styles.multigrid}
          styleBottomLeftGrid={styles.bottomLeft}
          styleTopLeftGrid={styles.topLeft}
          styleTopRightGrid={styles.topRight}
          width={styleConstants['content-width']}
        />
    );
  }
}
