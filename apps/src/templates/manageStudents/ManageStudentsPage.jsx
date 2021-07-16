import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import ManageStudentsRow from './ManageStudentsRow';
import ManageStudentsActionsHeaderCell from './ManageStudentsActionsHeaderCell';
import ManageStudentsNotifications from './ManageStudentsNotifications';
import ManageStudentsTopControls from './ManageStudentsTopControls';
import Button from '../Button';
import {studentSectionDataPropType} from './manageStudentsTypes';
import './styles.scss';

const ManageStudentsPage = ({
  sectionId,
  studentData,
  loginType,
  addStatus,
  transferStatus,
  transferData
}) => {
  return (
    <div className="manage-students">
      <ManageStudentsNotifications
        addStatus={addStatus}
        transferStatus={transferStatus}
      />
      <ManageStudentsTopControls
        sectionId={sectionId}
        loginType={loginType}
        studentData={studentData}
        transferStatus={transferStatus}
        transferData={transferData}
      />
      <table>
        <Header loginType={loginType} />
        <tbody>
          {studentData.map(student => (
            <ManageStudentsRow
              key={student.id}
              sectionId={sectionId}
              student={student}
              loginType={loginType}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
ManageStudentsPage.propTypes = {
  studioUrlPrefix: PropTypes.string,
  sectionId: PropTypes.string.isRequired,
  sectionCode: PropTypes.string,
  sectionName: PropTypes.string,
  studentData: PropTypes.arrayOf(studentSectionDataPropType),
  loginType: PropTypes.string,

  // TODO
  editingData: PropTypes.object,
  addStatus: PropTypes.object,
  saveAllStudents: PropTypes.func,
  showSharingColumn: PropTypes.bool,
  editAll: PropTypes.func,
  transferData: PropTypes.object,
  transferStatus: PropTypes.object
};

export default ManageStudentsPage;

const Header = props => (
  <thead>
    <tr>
      <th>{i18n.name()}</th>
      <th style={{width: 90}}>{i18n.age()}</th>
      <th style={{width: 120}}>{i18n.gender()}</th>
      <th>
        <PasswordHeaderCell loginType={props.loginType} />
      </th>
      <th>
        <ActionsHeaderCell
          isSaveEnabled={false}
          showSharingColumn={false}
          saveAllFunc={() => {}}
          editAllFunc={() => {}}
        />
      </th>
    </tr>
  </thead>
);
Header.propTypes = {
  loginType: PropTypes.string.isRequired
};

const PasswordHeaderCell = ({loginType}) => {
  return (
    <span style={styles.verticalAlign}>
      <div data-for="password" data-tip="" id="password-header">
        {passwordLabels[loginType]}
      </div>
      <ReactTooltip
        id="password"
        class="react-tooltip-hover-stay"
        role="tooltip"
        effect="solid"
        place="top"
        delayHide={1000}
      >
        <div>{passwordTooltips[loginType]}</div>
      </ReactTooltip>
    </span>
  );
};
PasswordHeaderCell.propTypes = {
  loginType: PropTypes.string.isRequired
};

const passwordLabels = {
  [SectionLoginType.picture]: i18n.picturePassword(),
  [SectionLoginType.word]: i18n.secretWords(),
  [SectionLoginType.email]: i18n.password()
};

const passwordTooltips = {
  [SectionLoginType.picture]: i18n.editSectionLoginTypePicDesc(),
  [SectionLoginType.word]: i18n.editSectionLoginTypeWordDesc(),
  [SectionLoginType.email]: i18n.editSectionLoginTypeEmailDesc()
};

const ActionsHeaderCell = ({
  isSaveEnabled,
  showSharingColumn,
  saveAllFunc,
  editAllFunc
}) => {
  if (isSaveEnabled) {
    return (
      <Button
        __useDeprecatedTag
        onClick={saveAllFunc}
        color={Button.ButtonColor.orange}
        text={i18n.saveAll()}
      />
    );
  }
  return (
    <span style={styles.verticalAlign}>
      <div style={styles.headerName}>{i18n.actions()}</div>
      <div style={styles.headerIcon}>
        <ManageStudentsActionsHeaderCell
          editAll={editAllFunc}
          isShareColumnVisible={showSharingColumn}
        />
      </div>
    </span>
  );
};
ActionsHeaderCell.propTypes = {
  isSaveEnabled: PropTypes.bool.isRequired,
  showSharingColumn: PropTypes.bool.isRequired,
  saveAllFunc: PropTypes.func.isRequired,
  editAllFunc: PropTypes.func.isRequired
};

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
