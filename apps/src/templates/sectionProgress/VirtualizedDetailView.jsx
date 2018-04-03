import React, { Component, PropTypes } from 'react';
import { MultiGrid } from 'react-virtualized';
import ProgressBubble from '../progress/ProgressBubble';

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
  }
};

const columnWidths = [150, 50, 100, 300, 50];

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
    fixedRowCount: 2,
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
        {(rowIndex === 1 && columnIndex === 0) && (
          <span style={styles.cell}>Level Type</span>
        )}
        {(rowIndex >= 2 && columnIndex === 0) && (
          <span style={styles.cell}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${section.students[rowIndex-2].id}/script/${scriptData.id}`}>
              {section.students[rowIndex-2].name}
            </a>
          </span>
        )}
        {rowIndex > 1 && columnIndex > 0 && (
          <ProgressBubble
            level={{
              levelNumber: 3,
              status: "complete",
              url: "/foo/bar",
              icon: "fa-document"
            }}
            disabled={false}
          />
        )}
      </div>
    );
  };

  getColumnWidth({index}) {
    return columnWidths[index];
  }

  render() {
    const {section} = this.props;
    const rowCount = section.students.length + 2;

    return (
        <MultiGrid
          {...this.state}
          cellRenderer={this.cellRenderer}
          columnWidth={this.getColumnWidth}
          columnCount={5}
          enableFixedColumnScroll
          enableFixedRowScroll
          height={300}
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
