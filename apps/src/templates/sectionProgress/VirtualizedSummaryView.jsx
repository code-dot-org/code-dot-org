import React, { Component, PropTypes } from 'react';
import { MultiGrid } from 'react-virtualized';
import ProgressBox from '../sectionProgress/ProgressBox';

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
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      students: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })).isRequired
    }).isRequired,
    scriptData: PropTypes.shape({
      stages: PropTypes.arrayOf(PropTypes.shape({
        levels: PropTypes.arrayOf(PropTypes.object).isRequired
      })),
      id: PropTypes.number.isRequired,
    }).isRequired,
  };

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 1,
    scrollToColumn: 0,
    scrollToRow: 0,
  };

  cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {section, scriptData} = this.props;

    return (
      <div className={styles.Cell} key={key} style={style}>
        {(rowIndex === 0 && columnIndex === 0) && (
          <span style={styles.cell}>Lesson</span>
        )}
        {(rowIndex === 0 && columnIndex >= 1) && (
          <span style={styles.cell}>{columnIndex}</span>
        )}
        {(rowIndex >= 1 && columnIndex === 0) && (
          <span style={styles.cell}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${section.students[rowIndex-1].id}/script/${scriptData.id}`}>
              {section.students[rowIndex-1].name}
            </a>
          </span>
        )}
        {rowIndex >= 1 && columnIndex > 0 && (
          <ProgressBox
            started={true}
            incomplete={5}
            imperfect={5}
            perfect={10}
          />
        )}
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
          width={970}
        />
    );
  }
}
