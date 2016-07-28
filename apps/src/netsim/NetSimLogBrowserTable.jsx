/** @file Table of log rows displayed in the log browser */
import React from 'react';
import orderBy from 'lodash/orderBy';
import {Table, sort} from 'reactabular';
import moment from 'moment';
import color from '../color';
import FontAwesome from '../templates/FontAwesome';
import Packet from './Packet';

let style = {
  nowrap: {
    whiteSpace: 'nowrap'
  },
  prewrap: {
    whiteSpace: 'pre-wrap'
  },
  table: {
    marginBottom: 0
  },
  td: {
    color: color.charcoal,
    fontFamily: 'monospace',
    // Make sure table text can be selected and copied
    userSelect: 'text'
  }
};
style.nowrapTd = Object.assign({}, style.td, style.nowrap);
style.prewrapTd = Object.assign({}, style.td, style.prewrap);

/**
 * Table of log rows displayed in the Log Browser modal.
 * Wraps configuration and sorting behavior around a Reactabular table.
 * @see http://reactabular.js.org
 */
const NetSimLogBrowserTable = React.createClass({
  propTypes: {
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    renderedRowLimit: React.PropTypes.number,
    teacherView: React.PropTypes.bool
  },

  getInitialState() {
    return {
      sortingColumns: {
        0: {direction: 'desc', position: 0}
      }
    };
  },

  getSortingColumns() {
    return this.state.sortingColumns || {};
  },

  // The user requested sorting, adjust the sorting state accordingly.
  onSort(selectedColumn) {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        // Custom sortingOrder removes 'no-sort' from the cycle
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc'
        },
        selectedColumn
      })
    });
  },

  render() {
    const headerFields = this.props.headerFields;

    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(sort.sort({
      getSortingColumns: this.getSortingColumns,
      onSort: this.onSort
    }));

    const showToAddress = headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

    const showFromAddress = headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

    const showPacketInfo = headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
      headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

    let columns = [];

    columns.push({
      header: {
        label: 'Time',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {
        property: 'timestamp',
        format: timeFormatter,
        props: {style: style.nowrapTd}
      }
    });

    if (this.props.teacherView) {
      columns.push({
        header: {
          label: 'Sent By',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {property: 'sourceUserName', props: {style: style.nowrap}}
      });
    }

    columns.push({
      header: {
        label: 'Logged By',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {property: 'logged-by', props: {style: style.nowrapTd}}
    });

    columns.push({
      header: {
        label: 'Status',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {property: 'status', props: {style: style.nowrapTd}}
    });

    if (showFromAddress) {
      columns.push({
        header: {
          label: 'From',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {property: 'from-address', props: {style: style.nowrapTd}}
      });
    }

    if (showToAddress) {
      columns.push({
        header: {
          label: 'To',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {property: 'to-address', props: {style: style.nowrapTd}}
      });
    }

    if (showPacketInfo) {
      columns.push({
        header: {
          label: 'Packet',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {property: 'packet-info', props: {style: style.nowrapTd}}
      });
    }

    columns.push({
      header: {
        label: 'Message',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {property: 'message', props: {style: style.prewrapTd}}
    });

    const {logRows} = this.props;
    const {sortingColumns} = this.state;
    let sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(logRows);
    if (this.props.renderedRowLimit !== undefined) {
      sortedRows = sortedRows.slice(0, this.props.renderedRowLimit);
    }

    return (
      <Table.Provider columns={columns} style={style.table}>
        <Table.Header/>
        <Table.Body
          rows={sortedRows}
          rowKey="uuid"
        />
      </Table.Provider>
    );
  }
});
export default NetSimLogBrowserTable;

function timeFormatter(timestamp) {
  return moment(timestamp).format('h:mm:ss.SSS A');
}

/**
 * Wraps the Reactabular cell transform generated by sort.sort so that instead
 * of applying sort classes to the header cell it adds the appropriate FontAwesome
 * component to the cell contents.
 * @param {function(string, object, object):object} defaultSortable
 * @returns {function(string, object, object): object} a new cell transform function
 * @see http://reactabular.js.org/#/column-definition/transforms
 * @see https://github.com/reactabular/reactabular/blob/master/packages/reactabular-sort/src/sort.js
 */
function wrappedSortable(defaultSortable) {
  return (label, columnInfo, originalProps = {}) => {
    const {className: newClassName, ...newProps} = defaultSortable(label, columnInfo, originalProps);

    // Detect new classes applied by sort transform: sort-none, sort-asc, sort-desc
    // Instead of applying those classes, add different FontAwesome icons
    let sortIcon = <FontAwesome icon="sort" className="fa-fw" style={{color: 'rgba(255, 255, 255, 0.2 )'}}/>;
    if (/sort-asc/.test(newClassName)) {
      sortIcon = <FontAwesome icon="sort-asc" className="fa-fw"/>;
    } else if (/sort-desc/.test(newClassName)) {
      sortIcon = <FontAwesome icon="sort-desc" className="fa-fw"/>;
    }

    const {className: originalClassName} = originalProps;
    return {
      ...newProps,
      originalClassName,
      style: Object.assign({}, originalProps.style, {cursor: 'pointer'}),
      children: (
        <span>
          {sortIcon}
          {label}
        </span>
      )
    };
  };
}
