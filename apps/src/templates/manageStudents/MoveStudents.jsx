import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import orderBy from 'lodash/orderBy';
import Button from '../Button';
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

class MoveStudents extends Component {
  static propTypes = {
    studentData: PropTypes.array.isRequired
  };

  state = {
    isDialogOpen: false
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  getColumns = (sortable) => {
    return [{
      property: 'name',
        header: {
          label: i18n.name(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
            }},
            transforms: [sortable],
        }
      }];
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

  sortRows = (data, columnIndexList, orderList) => {
    return orderBy(data, columnIndexList, orderList);
  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: this.sortRows,
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
            style={tableLayoutStyles.table}
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
