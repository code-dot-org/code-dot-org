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

const styles = {
  cell: {
    padding: 10,
    width: '100%',
  },
  multigrid: {
    border: '1px solid #ddd',
  },
  bottomLeft: {
    borderRight: '2px solid #aaa',
    backgroundColor: '#f7f7f7',
  },
  topLeft: {
    borderBottom: '2px solid #aaa',
    borderRight: '2px solid #aaa',
    fontWeight: 'bold',
  },
  topRight: {
    borderBottom: '2px solid #aaa',
    fontWeight: 'bold',
  },
  icon: {
    width: 40,
    padding: 3,
    fontSize: 20,
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

    return (
      <div className={styles.Cell} key={key} style={style}>
        {(rowIndex === 0 && columnIndex === 0) && (
          <span style={styles.cell}>Lesson</span>
        )}
        {(rowIndex === 0 && columnIndex >= 1) && (
          <span style={styles.cell}>{columnIndex}</span>
        )}
        {(rowIndex === 1 && columnIndex === 0) && (
          <span style={styles.cell}>Level Type</span>
        )}
        {(rowIndex === 1 && columnIndex >= 1) && (
          <span style={styles.cell}>
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
          <span style={styles.cell}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${section.students[rowIndex-2].id}/script/${scriptData.id}`}>
              {section.students[studentStartIndex].name}
            </a>
          </span>
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
    const PROGRESS_BUBBLE_WIDTH = 50;
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
