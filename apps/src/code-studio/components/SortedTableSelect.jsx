import React from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import {Heading1} from '@cdo/apps/lib/ui/Headings';
import {tableLayoutStyles, sortableOptions} from '@cdo/apps/templates/tables/tableConstants';
import i18n from '@cdo/locale';
import {orderBy} from 'lodash';
import * as sort from 'sortabular';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const PADDING = 20;
const TABLE_WIDTH = 300;
const CHECKBOX_CELL_WIDTH = 50;

const styles = {
  checkboxCell: {
    width: CHECKBOX_CELL_WIDTH,
    textAlign: 'center'
  },
  checkbox: {
    margin: 0
  },
  container: {
    display: 'flex'
  },
  table: {
    width: TABLE_WIDTH,
    margin: 2
  },
  rightColumn: {
    flex: 1,
    paddingLeft: PADDING,
    paddingRight: PADDING
  },
  infoText: {
    paddingTop: PADDING / 4,
    paddingBottom: PADDING / 2
  },
  label: {
    paddingTop: PADDING / 2
  },
  input: {
    marginLeft: PADDING / 2
  }
};

const DEFAULT_SORT = {
  1: {
    direction: 'asc',
    position: 0
  }
};

export default class SortedTableSelect extends React.Component {
  static propTypes = {
    rowData: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired,
    onRowChecked: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    onChooseOption: PropTypes.func.isRequired,
    descriptionText: PropTypes.string,
    optionsDescriptionText: PropTypes.string,
    titleText: PropTypes.string,
    children: PropTypes.node
  }

  state = {
    sortingColumns: DEFAULT_SORT,
    rowsChecked: [],
    selectedOption: undefined
  }

  areAllSelected = () => {
    return this.state.rowsChecked.count === this.props.rowData.count;
  };

  toggleSelectAll = () => {
    let rowsToCheck = [];

    if (!this.areAllSelected()) {
      rowsToCheck = this.props.rowData.map(data => data.id);
    }
    this.setState({rowsChecked: rowsToCheck});
    this.props.onRowChecked(rowsToCheck);
  };

  toggleRowChecked = (id) => {
    this.setState(state => {
      if(state.rowsChecked.includes(id)) {
        state.rowsChecked = state.rowsChecked.filter(row => row.id === id);
      } else {
        state.rowsChecked.push(id);
      }
      return state;
    }, this.props.onRowChecked(this.state.rowsChecked));
  }

  selectedRowHeaderFormatter = () => {
    return (
      <input
        style={styles.checkbox}
        type="checkbox"
        checked={this.areAllSelected()}
        onChange={this.toggleSelectAll}
      />
    );
  };

  selectedRowFormatter = (_, {rowData}) => {
    return (
      <input
        style={styles.checkbox}
        type="checkbox"
        checked={this.state.rowsChecked.includes(rowData.id)}
        onChange={() => this.toggleRowChecked(rowData.id)}
      />
    );
  };

  getColumns = sortable => {
    return [
      {
        property: 'selected',
        header: {
          label: '',
          formatters: [this.selectedRowHeaderFormatter],
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.checkboxCell
            }
          }
        },
        cell: {
          formatters: [this.selectedRowFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.checkboxCell
            }
          }
        }
      },
      {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            id: 'uitest-name-header',
            style: {
              ...tableLayoutStyles.headerCell
            }
          },
          transforms: [sortable]
        },
        cell: {
          props: {
            className: 'uitest-name-cell',
            style: {
              ...tableLayoutStyles.cell
            }
          }
        }
      }
    ];
  };

  renderOptions = () => {
    const {options} = this.props;
    let selectOptions = options.map(option => {
      return(
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      );
    });
    selectOptions.unshift(<option key="empty" value="" />);
    return selectOptions;
  }

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  // The user requested a new sorting column. Adjust the state accordingly.
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
    const {
      rowData,
      onChooseOption,
      descriptionText,
      optionsDescriptionText,
      titleText,
      children
    } = this.props;

    const sortingColumns = this.getSortingColumns();
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(rowData);
    return(
      <div>
        {titleText &&
          <Heading1>{titleText}</Heading1>
        }
        <div style={styles.container}>
          <Table.Provider columns={columns} style={styles.table}>
            <Table.Header />
            <Table.Body rows={sortedRows} rowKey="id" />
          </Table.Provider>
          <div style={styles.rightColumn}>
            {descriptionText &&
              <div style={styles.infoText}>{descriptionText}</div>
            }
            {optionsDescriptionText &&
              <label htmlFor="selectOption" style={styles.label}>
                {optionsDescriptionText}
              </label>
            }
            <select
              name="selectOption"
              style={styles.input}
              onChange={onChooseOption}
            >
              {this.renderOptions()}
            </select>
            {children}
          </div>
        </div>
      </div>
    );
  }
}