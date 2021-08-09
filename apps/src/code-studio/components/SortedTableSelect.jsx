import React from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import {Heading1} from '@cdo/apps/lib/ui/Headings';
import color from '@cdo/apps/util/color';
import {
  tableLayoutStyles,
  sortableOptions
} from '@cdo/apps/templates/tables/tableConstants';
import i18n from '@cdo/locale';
import {orderBy} from 'lodash';
import * as sort from 'sortabular';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const PADDING = 20;
const TABLE_WIDTH = 300;
const CHECKBOX_CELL_WIDTH = 50;

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
    children: PropTypes.node,
    onSelectAll: PropTypes.func,
    tableDescriptionText: PropTypes.string
  };

  state = {
    sortingColumns: DEFAULT_SORT,
    selectedOption: undefined
  };

  areAllSelected = () => {
    const existsUncheckedRow = this.props.rowData.find(row => !row.isChecked);
    return !existsUncheckedRow;
  };

  toggleSelectAll = () => {
    this.props.onSelectAll(!this.areAllSelected());
  };

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
    const {onRowChecked} = this.props;
    return (
      <input
        style={styles.checkbox}
        type="checkbox"
        checked={rowData.isChecked}
        onChange={() => onRowChecked(rowData.id)}
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
            style: {
              ...tableLayoutStyles.headerCell
            }
          },
          transforms: [sortable]
        },
        cell: {
          props: {
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
      return (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      );
    });
    selectOptions.unshift(<option key="empty" value="" />);
    return selectOptions;
  };

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
      children,
      tableDescriptionText
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
    return (
      <div className="ui-test-sortable-table-select">
        {titleText && <Heading1>{titleText}</Heading1>}
        <div style={styles.container}>
          <div style={styles.leftColumn}>
            <Table.Provider columns={columns} style={styles.table}>
              <Table.Header />
              <Table.Body rows={sortedRows} rowKey="id" />
            </Table.Provider>
            {tableDescriptionText && (
              <i style={styles.italics}>{tableDescriptionText}</i>
            )}
          </div>
          <div style={styles.rightColumn}>
            {descriptionText && (
              <div style={styles.infoText}>{descriptionText}</div>
            )}
            {optionsDescriptionText && (
              <label htmlFor="selectOption" style={styles.label}>
                {optionsDescriptionText}
              </label>
            )}
            <select name="selectOption" onChange={onChooseOption}>
              {this.renderOptions()}
            </select>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

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
  leftColumn: {
    width: TABLE_WIDTH
  },
  rightColumn: {
    flex: 1,
    paddingLeft: PADDING
  },
  infoText: {
    paddingTop: PADDING / 4,
    paddingBottom: PADDING / 2
  },
  label: {
    paddingTop: PADDING / 2
  },
  italics: {
    color: color.purple
  }
};
