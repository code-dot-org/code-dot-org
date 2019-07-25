/** @file Table of log rows displayed in the log browser */
import PropTypes from 'prop-types';
import React from 'react';
import orderBy from 'lodash/orderBy';
import {Table, sort} from 'reactabular';
import moment from 'moment';
import color from '../util/color';
import wrappedSortable from '../templates/tables/wrapped_sortable';
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
export default class NetSimLogBrowserTable extends React.Component {
  static propTypes = {
    logRows: PropTypes.arrayOf(PropTypes.object).isRequired,
    headerFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    renderedRowLimit: PropTypes.number,
    teacherView: PropTypes.bool,
    currentSentByFilter: PropTypes.string.isRequired
  };

  state = {
    sortingColumns: {
      0: {direction: 'desc', position: 0}
    }
  };

  getSortingColumns = () => this.state.sortingColumns || {};

  // The user requested sorting, adjust the sorting state accordingly.
  onSort = selectedColumn => {
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
  };

  render() {
    const headerFields = this.props.headerFields;

    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, {
      default: {color: 'rgba(255, 255, 255, 0.2 )'}
    });

    const showToAddress =
      headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

    const showFromAddress =
      headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

    const showPacketInfo =
      headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
      headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

    let columns = [];

    columns.push({
      property: 'timestamp',
      header: {
        label: 'Time',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {
        format: timeFormatter,
        props: {style: style.nowrapTd}
      }
    });

    if (this.props.teacherView) {
      columns.push({
        property: 'sent-by',
        header: {
          label: 'Sent By',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {props: {style: style.nowrapTd}}
      });
    }

    columns.push({
      property: 'logged-by',
      header: {
        label: 'Logged By',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {props: {style: style.nowrapTd}}
    });

    columns.push({
      property: 'status',
      header: {
        label: 'Status',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {props: {style: style.nowrapTd}}
    });

    if (showFromAddress) {
      columns.push({
        property: 'from-address',
        header: {
          label: 'From',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {props: {style: style.nowrapTd}}
      });
    }

    if (showToAddress) {
      columns.push({
        property: 'to-address',
        header: {
          label: 'To',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {props: {style: style.nowrapTd}}
      });
    }

    if (showPacketInfo) {
      columns.push({
        property: 'packet-info',
        header: {
          label: 'Packet',
          transforms: [sortable],
          props: {style: style.nowrap}
        },
        cell: {props: {style: style.nowrapTd}}
      });
    }

    columns.push({
      property: 'message',
      header: {
        label: 'Message',
        transforms: [sortable],
        props: {style: style.nowrap}
      },
      cell: {props: {style: style.prewrapTd}}
    });

    const {logRows} = this.props;
    const {sortingColumns} = this.state;
    let sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(logRows);

    // Filter by "sent by"
    const sentByMatch = this.props.currentSentByFilter.match(/^by (.*)$/);
    if (sentByMatch) {
      sortedRows = sortedRows.filter(row => row['sent-by'] === sentByMatch[1]);
    }

    // Limit number of rendered rows
    if (this.props.renderedRowLimit !== undefined) {
      sortedRows = sortedRows.slice(0, this.props.renderedRowLimit);
    }

    return (
      <Table.Provider columns={columns} style={style.table}>
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="uuid" />
      </Table.Provider>
    );
  }
}

function timeFormatter(timestamp) {
  return moment(timestamp).format('h:mm:ss.SSS A');
}
