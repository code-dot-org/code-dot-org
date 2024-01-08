import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

import {Grid, ScrollSync, AutoSizer} from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once
import * as color from '../../../util/color';
import styles from './VirtualTable.module.css';
import fontConstants from '@cdo/apps/fontConstants';

const scrollbarSize = () => 15;

export function getColorForValue(value, min, max) {
  if (typeof value !== 'number') {
    return 'white';
  }
  const lightest = 100;
  const darkest = 56;
  const lightness =
    lightest - ((value - min) / (max - min)) * (lightest - darkest);
  return `hsl(217, 89%, ${lightness}%)`;
}

const cellStyle = {
  height: '2em',
  border: '1px solid black',
  textAlign: 'center',
};
const topCellStyle = {
  ...cellStyle,
  backgroundColor: color.lightest_gray,
  color: 'black',
};
const leftCellStyle = {
  ...cellStyle,
  backgroundColor: color.dark_charcoal,
  color: 'white',
  padding: '0 1em',
  whiteSpace: 'nowrap',
};
const innerCellStyle = {
  ...cellStyle,
  overflow: 'hidden',
};
const axisTitleStyle = {
  ...fontConstants['main-font-semi-bold'],
};

const VirtualTable = ({
  columns,
  chartData,
  selectedColumn1,
  selectedColumn2,
}) => {
  const numericValues = useMemo(() => {
    const numericValues = [];
    chartData.forEach(record => {
      Object.entries(record).forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        if (typeof value === 'number' && key !== selectedColumn1) {
          numericValues.push(value);
        }
      });
    });
    return numericValues;
  }, [chartData, selectedColumn1]);

  const {min, max} = useMemo(
    () =>
      numericValues.reduce(
        (values, currentVal) => {
          return {
            min: Math.min(currentVal, values.min),
            max: Math.max(currentVal, values.max),
          };
        },
        {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY}
      ),
    [numericValues]
  );

  const rowHeight = 27;
  const tableHeight = 800;
  const tableWidth = 700;
  const headerColumnWidth = 250;
  const dataColumnWidth = 100;

  return (
    <>
      <div
        style={{
          ...topCellStyle,
          ...axisTitleStyle,
          width: tableWidth + headerColumnWidth,
        }}
      >
        {selectedColumn2}
      </div>
      <ScrollSync>
        {({
          clientHeight,
          clientWidth,
          onScroll,
          scrollHeight,
          scrollLeft,
          scrollTop,
          scrollWidth,
        }) => {
          // const x = scrollLeft / (scrollWidth - clientWidth);
          // const y = scrollTop / (scrollHeight - clientHeight);
          return (
            <div className={styles.GridRow}>
              <div
                className={styles.LeftSideGridContainer}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              >
                {/* spacer grid */}
                <Grid
                  cellRenderer={({style}) => (
                    <div
                      key={`${0},${0}`}
                      style={{
                        ...leftCellStyle,
                        ...style,
                        width: headerColumnWidth,
                      }}
                    >
                      {columns[0]}
                    </div>
                  )}
                  className={styles.HeaderGrid}
                  width={headerColumnWidth}
                  height={rowHeight}
                  rowHeight={rowHeight}
                  columnWidth={headerColumnWidth}
                  rowCount={1}
                  columnCount={1}
                />
              </div>
              <div
                className={styles.LeftSideGridContainer}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: rowHeight,
                }}
              >
                {/* row header */}
                <Grid
                  //cellRenderer={this._cellRenderer}
                  cellRenderer={({
                    columnIndex,
                    rowIndex,
                    style,
                    isScrolling,
                  }) => {
                    if (isScrolling) {
                      return (
                        <div key={`${columnIndex},${rowIndex}`} style={style}>
                          ...
                        </div>
                      );
                    }

                    const value = chartData[rowIndex][columns[columnIndex]];
                    const cellStyle =
                      columnIndex === 0
                        ? {...leftCellStyle}
                        : {
                            ...innerCellStyle,
                            width: dataColumnWidth,
                            backgroundColor: getColorForValue(value, min, max),
                          };
                    return (
                      <div
                        key={`${columnIndex},${rowIndex}`}
                        style={{...style, ...cellStyle}}
                      >
                        {value}
                      </div>
                    );
                  }}
                  //className={styles.BodyGrid}
                  columnWidth={headerColumnWidth}
                  columnCount={1}
                  height={tableHeight}
                  noContentRenderer={() => 'empty'}
                  overscanColumnCount={50}
                  overscanRowCount={50}
                  rowHeight={27}
                  rowCount={chartData.length}
                  //scrollToColumn={scrollToColumn}
                  //scrollToRow={scrollToRow}
                  width={headerColumnWidth}
                  scrollTop={scrollTop}
                  onScroll={onScroll}
                />
              </div>
              <div className={styles.GridColumn}>
                <AutoSizer disableHeight>
                  {({width}) => (
                    <div>
                      <div
                        style={{
                          height: rowHeight,
                          width: width - scrollbarSize(),
                        }}
                      >
                        {/* column header */}
                        <Grid
                          //cellRenderer={this._cellRenderer}
                          cellRenderer={({
                            columnIndex,
                            rowIndex,
                            style,
                            isScrolling,
                          }) => {
                            if (columnIndex < 1) {
                              return;
                            }
                            if (isScrolling) {
                              return (
                                <div
                                  key={`${columnIndex},${rowIndex}`}
                                  style={style}
                                >
                                  ...
                                </div>
                              );
                            }

                            const value = columns[columnIndex];
                            const cellStyle = {
                              ...(columnIndex === 0
                                ? {...leftCellStyle, ...axisTitleStyle}
                                : topCellStyle),
                              width: columnIndex === 0 ? 250 : dataColumnWidth,
                            };

                            return (
                              <div
                                key={`${columnIndex},${rowIndex}`}
                                style={{...style, ...cellStyle}}
                              >
                                {value}
                              </div>
                            );
                          }}
                          //className={styles.BodyGrid}
                          columnWidth={({index}) =>
                            index === 0 ? headerColumnWidth : dataColumnWidth
                          }
                          columnCount={columns.length}
                          height={27 * 1}
                          noContentRenderer={() => 'empty'}
                          overscanColumnCount={50}
                          overscanRowCount={50}
                          rowHeight={27 * 1}
                          rowCount={1}
                          width={tableWidth + headerColumnWidth}
                          scrollLeft={scrollLeft}
                        />
                      </div>
                      <div
                        style={{
                          tableHeight,
                          width,
                          paddingLeft: headerColumnWidth,
                        }}
                      >
                        {/* data */}
                        <Grid
                          //cellRenderer={this._cellRenderer}
                          cellRenderer={({
                            columnIndex,
                            rowIndex,
                            style,
                            isScrolling,
                          }) => {
                            if (isScrolling) {
                              return (
                                <div
                                  key={`${columnIndex},${rowIndex}`}
                                  style={style}
                                >
                                  ...
                                </div>
                              );
                            }

                            const value =
                              chartData[rowIndex][columns[columnIndex + 1]];
                            const cellStyle = {
                              ...innerCellStyle,
                              width: dataColumnWidth,
                              backgroundColor: getColorForValue(
                                value,
                                min,
                                max
                              ),
                            };
                            return (
                              <div
                                key={`${columnIndex},${rowIndex}`}
                                style={{...style, ...cellStyle}}
                              >
                                {value}
                              </div>
                            );
                          }}
                          //className={styles.BodyGrid}
                          columnWidth={dataColumnWidth}
                          columnCount={columns.length}
                          height={tableHeight}
                          noContentRenderer={() => 'empty'}
                          overscanColumnCount={50}
                          overscanRowCount={50}
                          rowHeight={rowHeight}
                          rowCount={chartData.length}
                          //scrollToColumn={scrollToColumn}
                          //scrollToRow={scrollToRow}
                          width={tableWidth}
                          onScroll={onScroll}
                        />
                      </div>
                    </div>
                  )}
                </AutoSizer>
              </div>
            </div>
          );
        }}
      </ScrollSync>
    </>
  );
};

VirtualTable.propTypes = {
  columns: PropTypes.array,
  chartData: PropTypes.array,
  selectedColumn1: PropTypes.string,
  selectedColumn2: PropTypes.string,
};

export default React.memo(VirtualTable);
