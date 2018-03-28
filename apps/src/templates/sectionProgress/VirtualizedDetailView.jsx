import React, { Component } from 'react';
import { MultiGrid } from 'react-virtualized';
import ProgressBubble from '../progress/ProgressBubble';

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

export default class VirtualizedDetailView extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      fixedColumnCount: 1,
      fixedRowCount: 1,
      scrollToColumn: 0,
      scrollToRow: 0,
    };

    this._cellRenderer = this._cellRenderer.bind(this);
  }

  render() {

    return (
        <MultiGrid
          {...this.state}
          cellRenderer={this._cellRenderer}
          columnWidth={75}
          columnCount={50}
          enableFixedColumnScroll
          enableFixedRowScroll
          height={300}
          rowHeight={40}
          rowCount={300}
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
      <div className="cell" key={key} style={style}>
        <ProgressBubble
          level={{
            levelNumber: 3,
            status: "perfect",
            url: "/foo/bar",
            icon: "fa-document"
          }}
          disabled={false}
        />
      </div>
    );
  }

}
