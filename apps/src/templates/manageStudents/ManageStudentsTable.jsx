import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PasswordReset from './PasswordReset';
import ShowSecret from './ShowSecret';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import ManageStudentsNameCell from './ManageStudentsNameCell';
import ManageStudentsAgeCell from './ManageStudentsAgeCell';
import ManageStudentsGenderCell from './ManageStudentsGenderCell';
import ManageStudentsSharingCell from './ManageStudentsSharingCell';
import ManageStudentsActionsCell from './ManageStudentsActionsCell';
import ManageStudentsActionsHeaderCell from './ManageStudentsActionsHeaderCell';
import SharingControlActionsHeaderCell from './SharingControlActionsHeaderCell';
import ManageStudentsLoginInfo from './ManageStudentsLoginInfo';
import NoSectionCodeDialog from './NoSectionCodeDialog';
import {
  sectionCode,
  sectionName
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  convertStudentDataToArray,
  AddStatus,
  RowType,
  saveAllStudents,
  editAll,
  TransferStatus,
  TransferType,
  ParentLetterButtonMetricsCategory,
  PrintLoginCardsButtonMetricsCategory
} from './manageStudentsRedux';
import {connect} from 'react-redux';
import Notification, {NotificationType} from '../Notification';
import AddMultipleStudents from './AddMultipleStudents';
import MoveStudents from './MoveStudents';
import DownloadParentLetter from './DownloadParentLetter';
import PrintLoginCards from './PrintLoginCards';
import ManageCodeReviewGroups from './ManageCodeReviewGroups';
import Button from '../Button';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import SafeMarkdown from '../SafeMarkdown';
import experiments from '@cdo/apps/util/experiments';

const LOGIN_TYPES_WITH_PASSWORD_COLUMN = [
  SectionLoginType.word,
  SectionLoginType.picture,
  SectionLoginType.email
];
const LOGIN_TYPES_WITH_ACTIONS_COLUMN = [
  SectionLoginType.word,
  SectionLoginType.picture,
  SectionLoginType.email,
  SectionLoginType.google_classroom,
  SectionLoginType.clever
];

export const studentSectionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  username: PropTypes.string,
  email: PropTypes.string,
  age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gender: PropTypes.string,
  secretWords: PropTypes.string,
  secretPicturePath: PropTypes.string,
  sectionId: PropTypes.number,
  loginType: PropTypes.string,
  hasEverSignedIn: PropTypes.bool,
  dependsOnThisSectionForLogin: PropTypes.bool,
  rowType: PropTypes.oneOf(Object.values(RowType)),
  userType: PropTypes.string
});

/** @enum {number} */
export const COLUMNS = {
  NAME: 0,
  AGE: 1,
  GENDER: 2,
  PASSWORD: 3,
  ACTIONS: 4
};

// The "add row" should always be pinned to the top when sorting.
// The "new student rows" should always be next.
// This function takes into account having multiple "add rows"
export const sortRows = (data, columnIndexList, orderList) => {
  let addRows = [];
  let newStudentRows = [];
  let studentRows = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].rowType === RowType.ADD) {
      addRows.push(data[i]);
    } else if (data[i].rowType === RowType.NEW_STUDENT) {
      newStudentRows.push(data[i]);
    } else {
      studentRows.push(data[i]);
    }
  }
  addRows = orderBy(addRows, columnIndexList, orderList);
  newStudentRows = orderBy(newStudentRows, columnIndexList, orderList);
  studentRows = orderBy(studentRows, columnIndexList, orderList);
  return addRows.concat(newStudentRows).concat(studentRows);
};

export const ManageStudentsNotificationFull = ({manageStatus}) => {
  const {sectionCapacity, sectionCode, sectionStudentCount} = manageStatus;

  const sectionSpotsRemaining =
    sectionCapacity - sectionStudentCount > 0
      ? sectionCapacity - sectionStudentCount
      : 0;

  const notificationParams = {
    studentLimit: sectionCapacity,
    currentStudentCount: sectionStudentCount,
    sectionCode: sectionCode,
    availableSpace: sectionSpotsRemaining
  };

  const notification = {
    notice: i18n.manageStudentsNotificationCannotVerb({
      numStudents: manageStatus.numStudents,
      verb: manageStatus.verb || 'add'
    }),
    details: `${
      sectionSpotsRemaining === 0
        ? i18n.manageStudentsNotificationFull(notificationParams)
        : i18n.manageStudentsNotificationWillBecomeFull(notificationParams)
    } 
          ${i18n.contactSupportFullSection({
            supportLink: 'https://support.code.org/hc/en-us/requests/new'
          })}`
  };

  return (
    <Notification
      type={NotificationType.failure}
      notice={notification.notice}
      details={
        // SafeMarkedown required to convert i18n string to clickable link
        <SafeMarkdown markdown={notification.details} />
      }
      dismissible={false}
    />
  );
};

ManageStudentsNotificationFull.propTypes = {
  manageStatus: PropTypes.object.isRequired
};

class ManageStudentsTable extends Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,

    // Provided by redux
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    studentData: PropTypes.arrayOf(studentSectionDataPropType),
    loginType: PropTypes.string,
    isSectionAssignedCSA: PropTypes.bool,
    editingData: PropTypes.object,
    addStatus: PropTypes.object,
    saveAllStudents: PropTypes.func,
    showSharingColumn: PropTypes.bool,
    editAll: PropTypes.func,
    transferData: PropTypes.object,
    transferStatus: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.renderTransferSuccessNotification = this.renderTransferSuccessNotification.bind(
      this
    );
    this.studentDataMinusBlanks = this.studentDataMinusBlanks.bind(this);
    this.isMoveStudentsEnabled = this.isMoveStudentsEnabled.bind(this);
    this.passwordHeaderFormatter = this.passwordHeaderFormatter.bind(this);
    this.passwordFormatter = this.passwordFormatter.bind(this);
    this.actionsFormatter = this.actionsFormatter.bind(this);
    this.actionsHeaderFormatter = this.actionsHeaderFormatter.bind(this);
    this.getSortingColumns = this.getSortingColumns.bind(this);
    this.onSort = this.onSort.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.copySectionCode = this.copySectionCode.bind(this);
    this.onPrintLoginCards = this.onPrintLoginCards.bind(this);
    this.showSectionCodeDialog = this.showSectionCodeDialog.bind(this);
    this.close = this.close.bind(this);
  }

  state = {
    sortingColumns: {
      [COLUMNS.NAME]: {
        direction: 'asc',
        position: 0
      }
    },
    showCopiedMsg: false,
    showSectionCodeDialog: false
  };

  renderTransferSuccessNotification() {
    const {type, numStudents, sectionDisplay} = this.props.transferStatus;
    let notification = {};

    switch (type) {
      case TransferType.MOVE_STUDENTS:
        notification.notice = i18n.studentsSuccessfullyMovedNotice;
        notification.details = i18n.studentsSuccessfullyMovedDetails;
        break;
      case TransferType.COPY_STUDENTS:
        notification.notice = i18n.studentsSuccessfullyCopiedNotice;
        notification.details = i18n.studentsSuccessfullyCopiedDetails;
        break;
    }

    return (
      <Notification
        type={NotificationType.success}
        notice={notification.notice()}
        details={notification.details({
          numStudents: numStudents,
          section: sectionDisplay
        })}
        dismissible={false}
      />
    );
  }

  studentDataMinusBlanks() {
    return this.props.studentData.filter(sd => sd.rowType === RowType.STUDENT);
  }

  isMoveStudentsEnabled() {
    const {loginType} = this.props;
    return (
      loginType === SectionLoginType.word ||
      loginType === SectionLoginType.picture ||
      loginType === SectionLoginType.email
    );
  }

  // Editing is disabled if the "student" in the section is a teacher
  // (e.g., their userType is 'teacher').
  isEditingDisabled(userType) {
    return userType === 'teacher';
  }

  // Cell formatters.
  passwordHeaderFormatter() {
    const {loginType} = this.props;
    return (
      <span style={styles.verticalAlign}>
        <div data-for="password" data-tip="" id="password-header">
          {this.getPasswordLabel(loginType)}
        </div>
        <ReactTooltip
          id="password"
          class="react-tooltip-hover-stay"
          role="tooltip"
          effect="solid"
          place="top"
          delayHide={1000}
        >
          <div>{this.getPasswordTooltip(loginType)}</div>
        </ReactTooltip>
      </span>
    );
  }

  getPasswordLabel(loginType) {
    const labels = {
      [SectionLoginType.picture]: i18n.picturePassword(),
      [SectionLoginType.word]: i18n.secretWords(),
      [SectionLoginType.email]: i18n.password()
    };

    return labels[loginType];
  }

  getPasswordTooltip(loginType) {
    const tooltipContent = {
      [SectionLoginType.picture]: i18n.editSectionLoginTypePicDesc(),
      [SectionLoginType.word]: i18n.editSectionLoginTypeWordDesc(),
      [SectionLoginType.email]: i18n.editSectionLoginTypeEmailDesc()
    };

    return tooltipContent[loginType];
  }

  passwordFormatter(loginType, {rowData}) {
    const {sectionId} = this.props;
    const resetDisabled = this.isEditingDisabled(rowData.userType);
    return (
      <div>
        {!rowData.isEditing && (
          <div>
            {rowData.loginType === SectionLoginType.email && (
              <PasswordReset
                initialIsResetting={false}
                sectionId={sectionId}
                studentId={rowData.id}
                resetDisabled={resetDisabled}
              />
            )}
            {(rowData.loginType === SectionLoginType.word ||
              rowData.loginType === SectionLoginType.picture) && (
              <ShowSecret
                initialIsShowing={false}
                secretWord={rowData.secretWords}
                secretPicture={rowData.secretPicturePath}
                loginType={rowData.loginType}
                id={rowData.id}
                sectionId={sectionId}
                resetDisabled={resetDisabled}
              />
            )}
          </div>
        )}
        {rowData.isEditing && <div>{i18n.autoGenerated()}</div>}
      </div>
    );
  }

  ageFormatter(age, {rowData}) {
    const editedValue = rowData.isEditing ? rowData.editingData.age : 0;
    return (
      <ManageStudentsAgeCell
        age={age}
        id={rowData.id}
        isEditing={rowData.isEditing}
        editedValue={editedValue}
      />
    );
  }

  genderFormatter(gender, {rowData}) {
    const editedValue = rowData.isEditing ? rowData.editingData.gender : '';
    return (
      <ManageStudentsGenderCell
        gender={gender}
        id={rowData.id}
        isEditing={rowData.isEditing}
        editedValue={editedValue}
      />
    );
  }

  nameFormatter(name, {rowData}) {
    const editedValue = rowData.isEditing ? rowData.editingData.name : '';
    return (
      <ManageStudentsNameCell
        id={rowData.id}
        sectionId={rowData.sectionId}
        name={name}
        username={rowData.username}
        email={rowData.email}
        isEditing={rowData.isEditing}
        editedValue={editedValue}
      />
    );
  }

  actionsFormatter(actions, {rowData}) {
    let disableSaving = rowData.isEditing
      ? rowData.editingData.name.length === 0
      : false;
    return (
      <ManageStudentsActionsCell
        id={rowData.id}
        sectionId={rowData.sectionId}
        isEditing={rowData.isEditing}
        isSaving={rowData.isSaving}
        disableSaving={disableSaving}
        rowType={rowData.rowType}
        loginType={rowData.loginType}
        studentName={rowData.name}
        hasEverSignedIn={rowData.hasEverSignedIn}
        dependsOnThisSectionForLogin={rowData.dependsOnThisSectionForLogin}
        canEdit={!this.isEditingDisabled(rowData.userType)}
      />
    );
  }

  actionsHeaderFormatter() {
    const numberOfEditingRows = Object.keys(this.props.editingData).length;
    return (
      <div>
        {numberOfEditingRows > 1 && (
          <Button
            __useDeprecatedTag
            onClick={this.props.saveAllStudents}
            color={Button.ButtonColor.orange}
            text={i18n.saveAll()}
          />
        )}
        {numberOfEditingRows <= 1 && (
          <span style={styles.verticalAlign}>
            <div style={styles.headerName}>{i18n.actions()}</div>
            <div style={styles.headerIcon}>
              <ManageStudentsActionsHeaderCell
                editAll={this.props.editAll}
                isShareColumnVisible={this.props.showSharingColumn}
              />
            </div>
          </span>
        )}
      </div>
    );
  }

  projectSharingHeaderFormatter() {
    return (
      <span style={styles.verticalAlign}>
        <div style={styles.headerName} data-for="explain-sharing" data-tip="">
          {i18n.projectSharingColumnHeader()}
        </div>
        <ReactTooltip
          id="explain-sharing"
          class="react-tooltip-hover-stay"
          role="tooltip"
          effect="solid"
          place="top"
          delayHide={1000}
        >
          <div>{i18n.shareSettingMoreDetailsTooltip()}</div>
        </ReactTooltip>
        <div style={styles.headerIcon}>
          <SharingControlActionsHeaderCell />
        </div>
      </span>
    );
  }

  projectSharingFormatter(projectSharing, {rowData}) {
    let disabled = rowData.isEditing
      ? rowData.editingData.age.length === 0
      : true;
    const editedValue = rowData.isEditing
      ? rowData.editingData.sharingDisabled
      : true;

    return (
      <ManageStudentsSharingCell
        id={rowData.id}
        isEditing={rowData.isEditing}
        disabled={disabled}
        checked={!rowData.sharingDisabled}
        editedValue={!editedValue}
      />
    );
  }

  getSortingColumns() {
    return this.state.sortingColumns || {};
  }

  // The user requested a new sorting column. Adjust the state accordingly.
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
  }

  getColumns(sortable) {
    const {loginType} = this.props;

    const columns = [
      this.nameColumn(sortable),
      this.ageColumn(sortable),
      this.genderColumn(sortable)
    ];

    if (LOGIN_TYPES_WITH_PASSWORD_COLUMN.includes(loginType)) {
      columns.push(this.passwordColumn());
    }
    if (this.props.showSharingColumn) {
      columns.push(this.projectSharingColumn());
    }

    if (LOGIN_TYPES_WITH_ACTIONS_COLUMN.includes(loginType)) {
      columns.push(this.controlsColumn());
    }

    return columns;
  }

  nameColumn(sortable) {
    return {
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
        formatters: [this.nameFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell
          }
        }
      }
    };
  }

  ageColumn(sortable) {
    return {
      property: 'age',
      header: {
        label: i18n.age(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            width: 90
          }
        },
        transforms: [sortable]
      },
      cell: {
        formatters: [this.ageFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
            width: 90
          }
        }
      }
    };
  }

  genderColumn(sortable) {
    return {
      property: 'gender',
      header: {
        label: i18n.gender(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            width: 120
          }
        },
        transforms: [sortable]
      },
      cell: {
        formatters: [this.genderFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
            width: 120
          }
        }
      }
    };
  }

  passwordColumn() {
    return {
      property: 'password',
      header: {
        formatters: [this.passwordHeaderFormatter],
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...tableLayoutStyles.unsortableHeader,
            width: 180
          }
        }
      },
      cell: {
        formatters: [this.passwordFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
            width: 180
          }
        }
      }
    };
  }

  projectSharingColumn() {
    return {
      property: 'projectSharing',
      header: {
        label: i18n.projectSharingColumnHeader(),
        formatters: [this.projectSharingHeaderFormatter],
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...tableLayoutStyles.unsortableHeader,
            width: 130
          }
        }
      },
      cell: {
        formatters: [this.projectSharingFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
            ...{textAlign: 'center', width: 130}
          }
        }
      }
    };
  }

  controlsColumn() {
    return {
      property: 'actions',
      header: {
        label: i18n.actions(),
        formatters: [this.actionsHeaderFormatter],
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...tableLayoutStyles.unsortableHeader
          }
        }
      },
      cell: {
        formatters: [this.actionsFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell
          }
        }
      }
    };
  }

  copySectionCode() {
    const {sectionId, sectionCode, studioUrlPrefix} = this.props;
    const joinLink = `${studioUrlPrefix}/join/${sectionCode}`;
    copyToClipboard(joinLink);
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'copy-section-code-join-link',
        data_json: JSON.stringify({
          sectionId: sectionId
        })
      },
      {includeUserId: true}
    );
    this.setState({showCopiedMsg: true});
    setTimeout(() => {
      this.setState({showCopiedMsg: false});
    }, 5000);
    clearTimeout();
  }

  onPrintLoginCards() {
    const {sectionId} = this.props;
    const url =
      teacherDashboardUrl(sectionId, '/login_info') + `?autoPrint=true`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  showSectionCodeDialog() {
    const {sectionId} = this.props;
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'no-section-code-link',
        data_json: JSON.stringify({
          sectionId: sectionId
        })
      },
      {includeUserId: true}
    );
    this.setState({showSectionCodeDialog: true});
  }

  close() {
    this.setState({showSectionCodeDialog: false});
  }

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const decoratedRows = this.props.studentData.map(rowData => ({
      ...rowData,
      editingData: this.props.editingData[rowData.id]
    }));
    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: sortRows
    })(decoratedRows);

    const {
      addStatus,
      loginType,
      transferStatus,
      transferData,
      sectionId,
      sectionName,
      sectionCode,
      studentData,
      isSectionAssignedCSA
    } = this.props;

    const noSectionCode = [
      SectionLoginType.google_classroom,
      SectionLoginType.clever
    ];

    return (
      <div>
        {addStatus.status === AddStatus.SUCCESS && (
          <Notification
            type={NotificationType.success}
            notice={i18n.manageStudentsNotificationSuccess()}
            details={i18n.manageStudentsNotificationAddSuccess({
              numStudents: addStatus.numStudents
            })}
            dismissible={false}
          />
        )}
        {addStatus.status === AddStatus.FULL && (
          <ManageStudentsNotificationFull manageStatus={addStatus} />
        )}
        {transferStatus.status === TransferStatus.FULL && (
          <ManageStudentsNotificationFull manageStatus={transferStatus} />
        )}
        {addStatus.status === AddStatus.FAIL && (
          <Notification
            type={NotificationType.failure}
            notice={i18n.manageStudentsNotificationFailure()}
            details={i18n.manageStudentsNotificationCannotAdd({
              numStudents: addStatus.numStudents
            })}
            dismissible={false}
          />
        )}
        {transferStatus.status === TransferStatus.SUCCESS &&
          this.renderTransferSuccessNotification()}
        <div>
          {(loginType === SectionLoginType.word ||
            loginType === SectionLoginType.picture) && (
            <div style={styles.buttonWithMargin}>
              <AddMultipleStudents sectionId={this.props.sectionId} />
            </div>
          )}
          {this.isMoveStudentsEnabled() && (
            <div style={styles.button}>
              <MoveStudents
                studentData={this.studentDataMinusBlanks()}
                transferData={transferData}
                transferStatus={transferStatus}
              />
            </div>
          )}
          {(loginType === SectionLoginType.word ||
            loginType === SectionLoginType.picture) && (
            <div style={styles.button}>
              <PrintLoginCards
                sectionId={this.props.sectionId}
                entryPointForMetrics={
                  PrintLoginCardsButtonMetricsCategory.MANAGE_STUDENTS
                }
                onPrintLoginCards={this.onPrintLoginCards}
              />
            </div>
          )}
          <div style={styles.button}>
            <DownloadParentLetter
              sectionId={this.props.sectionId}
              buttonMetricsCategory={
                ParentLetterButtonMetricsCategory.ABOVE_TABLE
              }
            />
          </div>
          {/* Passes button style to ManageCodeReviewGroups to avoid extra div,
            but is otherwise similar to other button/modal components here */}
          {isSectionAssignedCSA &&
            experiments.isEnabled(experiments.CODE_REVIEW_GROUPS) && (
              <ManageCodeReviewGroups
                sectionId={sectionId}
                buttonContainerStyle={styles.button}
              />
            )}
          {LOGIN_TYPES_WITH_PASSWORD_COLUMN.includes(loginType) && (
            <div
              style={styles.sectionCodeBox}
              data-for="section-code"
              data-tip
              onClick={this.copySectionCode}
            >
              {!this.state.showCopiedMsg && (
                <span>
                  <span>{i18n.sectionCodeWithColon()}</span>
                  <span style={styles.sectionCode}>{sectionCode}</span>
                  <ReactTooltip id="section-code" role="tooltip" effect="solid">
                    <div>{i18n.copySectionCodeTooltip()}</div>
                  </ReactTooltip>
                </span>
              )}
              {this.state.showCopiedMsg && (
                <span>{i18n.copySectionCodeSuccess()}</span>
              )}
            </div>
          )}
          {noSectionCode.includes(loginType) && (
            <div style={styles.sectionCodeBox}>
              {i18n.sectionCodeWithColon()}
              <span
                style={styles.sectionCodeNotApplicable}
              >{` ${i18n.notApplicable()}. `}</span>
              <span style={styles.noSectionCode}>
                <a onClick={() => this.showSectionCodeDialog()}>
                  {i18n.whyWithQuestionMark()}
                </a>
              </span>
              <NoSectionCodeDialog
                typeClassroom={loginType}
                handleClose={this.close}
                isOpen={this.state.showSectionCodeDialog}
              />
            </div>
          )}
        </div>
        <Table.Provider
          columns={columns}
          style={tableLayoutStyles.table}
          id="uitest-manage-students-table"
        >
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" />
        </Table.Provider>
        <ManageStudentsLoginInfo
          sectionId={sectionId}
          sectionName={sectionName}
          studentData={studentData}
          loginType={loginType}
          sectionCode={this.props.sectionCode}
          studioUrlPrefix={this.props.studioUrlPrefix}
        />
      </div>
    );
  }
}

const styles = {
  headerName: {
    width: '60%',
    float: 'left',
    marginRight: 5
  },
  headerIcon: {
    width: '20%',
    float: 'left'
  },
  button: {
    float: 'left'
  },
  buttonWithMargin: {
    marginRight: 5,
    float: 'left'
  },
  verticalAlign: {
    display: 'flex',
    alignItems: 'center'
  },
  sectionCodeBox: {
    float: 'right',
    lineHeight: '30px'
  },
  sectionCode: {
    marginLeft: 5,
    color: color.teal,
    fontFamily: '"Gotham 7r", sans-serif',
    cursor: 'copy'
  },
  noSectionCode: {
    color: color.teal,
    textDecoration: 'none',
    cursor: 'pointer'
  },
  sectionCodeNotApplicable: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

export const UnconnectedManageStudentsTable = ManageStudentsTable;

export default connect(
  state => ({
    sectionId: state.sectionData.section.id,
    sectionCode: sectionCode(state, state.sectionData.section.id),
    sectionName: sectionName(state, state.sectionData.section.id),
    loginType: state.manageStudents.loginType,
    studentData: convertStudentDataToArray(state.manageStudents.studentData),
    isSectionAssignedCSA: state.sectionData.section.isAssignedCSA,
    editingData: state.manageStudents.editingData,
    showSharingColumn: state.manageStudents.showSharingColumn,
    addStatus: state.manageStudents.addStatus,
    transferData: state.manageStudents.transferData,
    transferStatus: state.manageStudents.transferStatus
  }),
  dispatch => ({
    saveAllStudents() {
      dispatch(saveAllStudents());
    },
    editAll() {
      dispatch(editAll());
    }
  })
)(ManageStudentsTable);
