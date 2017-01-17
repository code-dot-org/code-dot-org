/**
 * Report Table
 */
import React from 'react';
import {orderBy} from 'lodash';
import {Table, sort} from 'reactabular';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';
import color from '@cdo/apps/util/color';

const styles = {
  container: {
    overflowX: 'auto'
  }
};

const ReportTable = React.createClass({
  propTypes: {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired
  },

  getInitialState() {
    return {
      sortingColumns: {
        workshop_id: {
          direction: 'asc',
          position: 0
        }
      }
    };
  },

  getSortingColumns() {
    return this.state.sortingColumns || {};
  },

  onSort(selectedColumn) {
    const sortingColumns = sort.byColumn({
      sortingColumns: this.state.sortingColumns,
      // Custom sortingOrder removes 'no-sort' from the cycle
      sortingOrder: {
        FIRST: 'asc',
        asc: 'desc',
        desc: 'asc'
      },
      selectedColumn
    });

    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns
      })
    });
  },

  getSortableTransform() {
    return wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      {
        container: {whiteSpace: 'nowrap'},
        default: {color: color.light_gray}
      }
    );
  },

  addTransform(element, transform) {
    element.transforms = element.transforms || [];
    element.transforms.push(transform);
  },

  // Apply to all headers
  applyHeaderTransforms(columns) {
    const sortableTransform = this.getSortableTransform();
    columns.forEach( column => {
      this.addTransform(column.header, sortableTransform);
    });

    return columns;
  },

  render() {
    // Since there may not be a unique id per row, add a rowKey based on pre-sorted index.
    const rows = this.props.rows.map( (row, i) => ({
      ...row,
      rowKey: i + 1
    }));

    const columns = this.applyHeaderTransforms(this.props.columns);
    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(rows);

    return (
      <div style={styles.container}>

        <Table.Provider
          className="table table-bordered table-striped table-condensed"
          columns={columns}
        >
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="rowKey"/>
        </Table.Provider>
      </div>
    );
  }
});
export default ReportTable;
