import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import Immutable from 'immutable';
import orderBy from 'lodash/orderBy';
import Button from '../Button';
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";

const PADDING = 20;
const TABLE_WIDTH = 300;
const CHECKBOX_CELL_WIDTH = 50;

const styles = {
  dialog: {
    paddingLeft: PADDING,
    paddingRight: PADDING,
    paddingTop: PADDING,
    paddingBottom: PADDING
  },
  table: {
    width: TABLE_WIDTH
  },
  checkboxCell: {
    width: CHECKBOX_CELL_WIDTH,
    textAlign: 'center'
  },
  checkbox: {
    margin: 0
  }
};

class MoveStudents extends Component {
  static propTypes = {
    studentData: PropTypes.arrayOf(
      React.PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired
  };

  state = {
    isDialogOpen: false,
    selectedIds: []
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({
      isDialogOpen: false,
      selectedIds: []
    });
  };

  getStudentIds = () => {
    return this.props.studentData.map(s => s.id);
  };

  areAllSelected = () => {
    return Immutable.Set(this.state.selectedIds).isSuperset(this.getStudentIds());
  };

  toggleSelectAll = () => {
    if (this.areAllSelected()) {
      this.setState({selectedIds: []});
    } else {
      this.setState({selectedIds: this.getStudentIds()});
    }
  };

  toggleStudentSelected = (studentId) => {
    let selectedIds = [...this.state.selectedIds];

    if (this.state.selectedIds.includes(studentId)) {
      const studentIndex = selectedIds.indexOf(studentId);
      selectedIds.splice(studentIndex, 1);
    } else {
      selectedIds.push(studentId);
    }

    this.setState({selectedIds});
  };

  selectedStudentHeaderFormatter = () => {
    return (
      <input
        style={styles.checkbox}
        type="checkbox"
        checked={this.areAllSelected()}
        onChange={this.toggleSelectAll}
      />
    );
  };

  selectedStudentFormatter = (_, {rowData}) => {
    const isChecked = this.state.selectedIds.includes(rowData.id);

    return (
      <input
        style={styles.checkbox}
        type="checkbox"
        checked={isChecked}
        onChange={() => this.toggleStudentSelected(rowData.id)}
      />
    );
  };

  getColumns = (sortable) => {
    return [
      {
        property: 'selected',
        header: {
          label: '',
          format: this.selectedStudentHeaderFormatter,
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.checkboxCell
          }}
        },
        cell: {
          format: this.selectedStudentFormatter,
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.checkboxCell
          }}
        }
      }, {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }},
          transforms: [sortable]
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      }
    ];
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  // The user requested a new sorting column. Adjust the state accordingly.
  onSort = (selectedColumn) => {
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
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.studentData);

    return (
      <div>
        <Button
          onClick={this.openDialog}
          color={Button.ButtonColor.gray}
          text={i18n.moveStudents()}
        />
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <Table.Provider
            columns={columns}
            style={styles.table}
          >
            <Table.Header />
            <Table.Body rows={sortedRows} rowKey="id" />
          </Table.Provider>
          <DialogFooter>
            <Button
              text={i18n.dialogCancel()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={i18n.moveStudents()}
              onClick={() => {}}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

export default MoveStudents;
