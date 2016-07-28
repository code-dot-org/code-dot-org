/** @file Table of log rows displayed in the log browser */
import React from 'react';
import orderBy from 'lodash/orderBy';
import {Table, sort} from 'reactabular';
import moment from 'moment';
import Packet from './Packet';

/**
 * Table of log rows displayed in the Log Browser modal.
 * Wraps configuration and sorting behavior around a Reactabular table.
 * @see http://reactabular.js.org
 */
const NetSimLogBrowserTable = React.createClass({
  propTypes: {
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    renderedRowLimit: React.PropTypes.number
  },

  getInitialState() {
    return {
      sortingColumns: {
        0: {direction: 'desc', position: 0}
      }
    };
  },

  render() {
    const headerFields = this.props.headerFields;

    // Define a sorting transform that can be applied to each column
    const sortable = sort.sort({
      // Point the transform to your rows. React state can work for this purpose
      // but you can use a state manager as well.
      getSortingColumns: () => this.state.sortingColumns || {},

      // The user requested sorting, adjust the sorting state accordingly.
      // This is a good chance to pass the request through a sorter.
      onSort: selectedColumn => {
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
      }
    });

    const showToAddress = headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

    const showFromAddress = headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

    const showPacketInfo = headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
      headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

    let columns = [
      {
        header: {label: 'Time', transforms: [sortable]},
        cell: {property: 'timestamp', format: timeFormatter}
      },
      {
        header: {label: 'Logged By', transforms: [sortable]},
        cell: {property: 'logged-by'}
      },
      {
        header: {label: 'Status', transforms: [sortable]},
        cell: {property: 'status'}
      },
    ];

    if (showFromAddress) {
      columns.push({
        header: {label: 'From', transforms: [sortable]},
        cell: {property: 'from-address'}
      });
    }

    if (showToAddress) {
      columns.push({
        header: {label: 'To', transforms: [sortable]},
        cell: {property: 'to-address'}
      });
    }

    if (showPacketInfo) {
      columns.push({
        header: {label: 'Packet', transforms: [sortable]},
        cell: {property: 'packet-info'}
      });
    }

    columns.push({
      header: {label: 'Message', transforms: [sortable]},
      cell: {property: 'message'}
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
      <Table.Provider columns={columns}>
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
