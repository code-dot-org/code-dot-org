import React, { Component } from 'react';
import { MultiGrid } from 'react-virtualized';
import styleConstants from '../../styleConstants';
import { sectionDataPropType, scriptDataPropType, studentLevelProgressPropType } from './sectionProgressRedux';
import StudentProgressSummaryCell from '../sectionProgress/StudentProgressSummaryCell';
import color from "../../util/color";

// TODO(caleybrock): share these styles with detail view
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
    width: 40,
    padding: 3,
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
    fixedRowCount: 1,
    scrollToColumn: 0,
    scrollToRow: 0,
  };

  // TODO(caleybrock): Look at sharing this component with the detail view.
  // This function and the renderer are very similar to VirtualizedDetailView.
  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {section, scriptData, studentLevelProgress} = this.props;
    // Subtract 1 to account for the header row.
    const studentStartIndex = rowIndex-1;
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
        {(rowIndex === 0 && columnIndex === 0) &&
          <span style={styles.lessonHeading}>Lesson</span>
        }
        {(rowIndex === 0 && columnIndex >= 1) &&
          <div style={styles.lessonNumberHeading}>
            {columnIndex}
          </div>
        }
        {(rowIndex >= 1 && columnIndex === 0) &&
          <div style={styles.nameCell}>
            <a
              href={`/teacher-dashboard#/sections/${section.id}/student/${section.students[studentStartIndex].id}/script/${scriptData.id}`}
              style={styles.link}
            >
              {section.students[studentStartIndex].name}
            </a>
          </div>
        }
        {(rowIndex >= 1 && columnIndex > 0) &&
          <StudentProgressSummaryCell
            studentId={section.students[studentStartIndex].id}
            section={section}
            studentLevelProgress={studentLevelProgress}
            stageId={stageIdIndex}
            scriptData={scriptData}
            style={styles.summaryCell}
          />
        }
      </div>
    );
  };

  getColumnWidth = ({index}) => {
    if (index === 0) {
      return 150;
    }
    return 50;
  };

  render() {
    const {section, scriptData} = this.props;
    // Add 1 to account for the header row
    const rowCount = section.students.length + 1;
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
          height={650}
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
