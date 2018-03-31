import React, { Component } from 'react';
import { MultiGrid } from 'react-virtualized';
import ProgressBubble from '../progress/ProgressBubble';

const styles = {
  cell: {
    padding: 10,
    width: '100%',
    // color: 'red',
  }
};

const STYLE = {
  border: '1px solid #ddd',
};
const STYLE_BOTTOM_LEFT_GRID = {
  borderRight: '2px solid #aaa',
  backgroundColor: '#f7f7f7',
};
const STYLE_TOP_LEFT_GRID = {
  borderBottom: '2px solid #aaa',
  borderRight: '2px solid #aaa',
  fontWeight: 'bold',
};
const STYLE_TOP_RIGHT_GRID = {
  borderBottom: '2px solid #aaa',
  fontWeight: 'bold',
};

const list = [
  ["Lesson", "1", "2", "3", "4"],
  ["Level Type", "1", "2", "3", "4"],
  ["Student 1"],
  ["Student 2"],
  ["Student 3"],
  ["Student 4"],
  ["Student 5"],
  ["Student 6"],
  ["Student 7"],
  ["Student 8"],
  ["Student 9"],
  ["Student 10"],
  ["Student 11"],
  ["Student 12"],
];

const columnWidths = [150, 50, 100, 300, 50];

export default class VirtualizedDetailView extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      fixedColumnCount: 1,
      fixedRowCount: 2,
      scrollToColumn: 0,
      scrollToRow: 0,
    };

    this._cellRenderer = this._cellRenderer.bind(this);
    this._getColumnWidth = this._getColumnWidth.bind(this);
  }

  render() {
    return (
        <MultiGrid
          {...this.state}
          cellRenderer={this._cellRenderer}
          columnWidth={this._getColumnWidth}
          columnCount={5}
          enableFixedColumnScroll
          enableFixedRowScroll
          height={300}
          rowHeight={40}
          rowCount={list.length}
          style={STYLE}
          styleBottomLeftGrid={STYLE_BOTTOM_LEFT_GRID}
          styleTopLeftGrid={STYLE_TOP_LEFT_GRID}
          styleTopRightGrid={STYLE_TOP_RIGHT_GRID}
          width={970}
        />
    );
  }

  _cellRenderer({columnIndex, key, rowIndex, style}) {
    return (
      <div className={styles.Cell} key={key} style={style}>
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
        {(rowIndex <= 1 || columnIndex === 0) && (
          <span style={styles.cell}>
            {list[rowIndex][columnIndex]}
          </span>
        )}
      </div>
    );
  }

  _getColumnWidth({index}) {
    return columnWidths[index];
  }

}
