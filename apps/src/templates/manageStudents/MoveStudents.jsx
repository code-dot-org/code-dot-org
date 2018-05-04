import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import Immutable from 'immutable';
import orderBy from 'lodash/orderBy';
import Button from '../Button';
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";
import {sectionsNameAndId} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  updateStudentTransfer,
  transferStudents,
  TransferType,
  TransferStatus,
  cancelStudentTransfer
} from './manageStudentsRedux';
import color from "@cdo/apps/util/color";

const OTHER_TEACHER = "otherTeacher";
const PADDING = 20;
const TABLE_WIDTH = 300;
const DIALOG_WIDTH = 800;
const INPUT_WIDTH = 225;
const CHECKBOX_CELL_WIDTH = 50;

const styles = {
  dialog: {
    padding: PADDING,
    width: DIALOG_WIDTH,
    marginLeft: -(DIALOG_WIDTH / 2)
  },
  container: {
    display: 'flex'
  },
  table: {
    width: TABLE_WIDTH,
    margin: 2
  },
  checkboxCell: {
    width: CHECKBOX_CELL_WIDTH,
    textAlign: 'center'
  },
  checkbox: {
    margin: 0
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
  },
  sectionInput: {
    marginLeft: PADDING / 2,
    width: INPUT_WIDTH
  },
  radioOption: {
    paddingLeft: PADDING / 2,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  error: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red,
    paddingBottom: PADDING / 2
  }
};

class MoveStudents extends Component {
  static propTypes = {
    studentData: PropTypes.arrayOf(
      React.PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    transferData: PropTypes.shape({
      studentIds: PropTypes.array.isRequired,
      sectionId: PropTypes.number,
      otherTeacher: PropTypes.bool.isRequired,
      otherTeacherSection: PropTypes.string.isRequired,
      copyStudents: PropTypes.bool.isRequired
    }),
    transferStatus: PropTypes.shape({
      status: PropTypes.string,
      type: PropTypes.string,
      error: PropTypes.string
    }),

    // redux provided
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired
      }).isRequired
    ),
    currentSectionId: PropTypes.number.isRequired,
    updateStudentTransfer: PropTypes.func.isRequired,
    transferStudents: PropTypes.func.isRequired,
    cancelStudentTransfer: PropTypes.func.isRequired
  };

  state = {
    isDialogOpen: false
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
    this.props.cancelStudentTransfer();
  };

  getStudentIds = () => {
    return this.props.studentData.map(s => s.id);
  };

  areAllSelected = () => {
    return Immutable.Set(this.props.transferData.studentIds).isSuperset(this.getStudentIds());
  };

  toggleSelectAll = () => {
    let studentIds = [];

    if (!this.areAllSelected()) {
      studentIds = this.getStudentIds();
    }

    this.props.updateStudentTransfer({studentIds});
  };

  toggleStudentSelected = (studentId) => {
    let studentIds = [...this.props.transferData.studentIds];

    if (studentIds.includes(studentId)) {
      const studentIndex = studentIds.indexOf(studentId);
      studentIds.splice(studentIndex, 1);
    } else {
      studentIds.push(studentId);
    }

    this.props.updateStudentTransfer({studentIds});
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
    const isChecked = this.props.transferData.studentIds.includes(rowData.id);

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
            id: 'uitest-name-header',
            style: {
              ...tableLayoutStyles.headerCell
          }},
          transforms: [sortable]
        },
        cell: {
          props: {
            className: 'uitest-name-cell',
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

  renderOptions = () => {
    const {sections, currentSectionId} = this.props;
    let options = sections.map(section => {
      if (section.id === currentSectionId) {
        return null;
      } else {
        return <option key={section.id} value={section.id}>{section.name}</option>;
      }
    });

    // Add initial empty and final 'other teacher' options
    options.unshift(<option key="empty" value=""></option>);
    options.push(<option key={OTHER_TEACHER} value={OTHER_TEACHER}>{i18n.otherTeacher()}</option>);

    return options;
  };

  onChangeSection = (event) => {
    const sectionValue = event.target.value;
    let newTransferData;

    if (sectionValue === OTHER_TEACHER) {
      newTransferData = {
        otherTeacher: true,
        sectionId: null
      };
    } else {
      newTransferData = {
        otherTeacher: false,
        sectionId: parseInt(sectionValue),
        copyStudents: false
      };
    }

    this.props.updateStudentTransfer({...newTransferData});
  };

  onChangeTeacherSection = (event) => {
    this.props.updateStudentTransfer({
      otherTeacherSection: event.target.value
    });
  };

  onChangeMoveOrCopy = (event) => {
    this.props.updateStudentTransfer({
      copyStudents: event.target.value === TransferType.COPY_STUDENTS
    });
  };

  transfer = () => {
    this.props.transferStudents(this.closeDialog);
  };

  isButtonDisabled = () => {
    const {studentIds, sectionId, otherTeacher, otherTeacherSection} = this.props.transferData;
    if (otherTeacher) {
      return (studentIds.length === 0) || !otherTeacherSection;
    } else {
      return (studentIds.length === 0) || !sectionId;
    }
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

    const {transferData, transferStatus} = this.props;

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
          <div style={styles.container}>
            <Table.Provider
              columns={columns}
              style={styles.table}
            >
              <Table.Header />
              <Table.Body rows={sortedRows} rowKey="id" />
            </Table.Provider>
            <div style={styles.rightColumn}>
              {transferStatus.status === TransferStatus.FAIL &&
                <div
                  id="uitest-error"
                  style={styles.error}
                >
                  {transferStatus.error}
                </div>
              }
              <div style={styles.infoText}>{i18n.selectStudentsToMove()}</div>
              <label
                htmlFor="sections"
                style={styles.label}
              >
                {`${i18n.moveToSection()}:`}
              </label>
              <select
                name="sections"
                style={styles.input}
                onChange={this.onChangeSection}
              >
                {this.renderOptions()}
              </select>
              {transferData.otherTeacher &&
                <div id="uitest-other-teacher">
                  <label
                    htmlFor="sectionCode"
                    style={styles.label}
                  >
                    {`${i18n.enterSectionCode()}:`}
                  </label>
                  <input
                    required
                    name="sectionCode"
                    style={styles.sectionInput}
                    value={transferData.otherTeacherSection}
                    onChange={this.onChangeTeacherSection}
                    placeholder={i18n.sectionCodePlaceholder()}
                  />
                  <label style={styles.label}>{i18n.bothSectionsQuestion()}</label>
                  <label style={styles.input}>
                    <input
                      type="radio"
                      value={TransferType.COPY_STUDENTS}
                      checked={transferData.copyStudents}
                      onChange={this.onChangeMoveOrCopy}
                    />
                    <span style={styles.radioOption}>{i18n.copyStudentsConfirm()}</span>
                  </label>
                  <label style={styles.input}>
                    <input
                      type="radio"
                      value="move"
                      checked={!transferData.copyStudents}
                      onChange={this.onChangeMoveOrCopy}
                    />
                    <span style={styles.radioOption}>{i18n.moveStudentsConfirm()}</span>
                  </label>
                </div>
              }
            </div>
          </div>
          <DialogFooter>
            <Button
              id="uitest-cancel"
              text={i18n.dialogCancel()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              id="uitest-submit"
              text={i18n.moveStudents()}
              onClick={this.transfer}
              color={Button.ButtonColor.orange}
              disabled={this.isButtonDisabled()}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

export const UnconnectedMoveStudents = MoveStudents;

export default connect(state => ({
  sections: sectionsNameAndId(state.teacherSections),
  currentSectionId: state.manageStudents.sectionId
}), dispatch => ({
  updateStudentTransfer(transferData) {
    dispatch(updateStudentTransfer(transferData));
  },
  transferStudents(onComplete) {
    dispatch(transferStudents(onComplete));
  },
  cancelStudentTransfer() {
    dispatch(cancelStudentTransfer());
  }
}))(MoveStudents);
