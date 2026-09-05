import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';
import locale from '@cdo/locale';

import color from '../../util/color';
import BaseDialog from '../BaseDialog';

import ReauthorizeGoogleClassroom from './ReauthorizeGoogleClassroom';
import {classroomShape, loadErrorShape} from './shapes';
import {
  cancelImportRosterFlow,
  importOrUpdateRoster,
  rosterImportFailed,
} from './teacherSectionsRedux';
import {isRosterDialogOpen} from './teacherSectionsReduxSelectors';

import moduleStyles from './rosterDialog.module.scss';

const COMPLETED_EVENT = 'Section Setup Completed';
const CANCELLED_EVENT = 'Section Setup Cancelled';

const ARCHIVED_STATE = 'ARCHIVED';

const ClassroomList = ({classrooms, onSelect, selectedId, rosterProvider}) =>
  classrooms.length ? (
    <div>
      {classrooms.map(classroom => (
        <div
          style={Object.assign(
            {},
            styles.classroomRow,
            selectedId === classroom.id && styles.highlightRow
          )}
          key={classroom.id}
          onClick={onSelect.bind(null, classroom.id)}
        >
          {classroom.name}
          {classroom.section && (
            <span style={{color: '#aaa'}}> ({classroom.section})</span>
          )}
          {classroom.course_state === ARCHIVED_STATE && (
            <span id="course-state" style={{color: color.bootstrap_error_text}}>
              {' '}
              - {classroom.course_state}
            </span>
          )}
          <span style={{float: 'right'}}>
            {locale.code()}
            <span style={{fontFamily: 'monospace'}}>
              {' '}
              {classroom.enrollment_code}
            </span>
          </span>
        </div>
      ))}
    </div>
  ) : (
    <NoClassroomsFound rosterProvider={rosterProvider} />
  );
ClassroomList.propTypes = {
  classrooms: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  rosterProvider: PropTypes.oneOf(Object.keys(OAuthSectionTypes)),
};

const NoClassroomsFound = ({rosterProvider}) => {
  switch (rosterProvider) {
    case OAuthSectionTypes.google_classroom:
      return (
        <div>
          <p>{locale.noClassroomsFound()}</p>
          <a href="https://classroom.google.com/">
            {locale.addRemoveGoogleClassrooms()}
          </a>
        </div>
      );
    case OAuthSectionTypes.clever:
      return (
        <div>
          <p>{locale.noClassroomsFound()}</p>
          <a href="https://clever.com/">{locale.addRemoveCleverClassrooms()}</a>
        </div>
      );
    case OAuthSectionTypes.classlink:
      return (
        <div>
          <p>{locale.noClassroomsFound()}</p>
        </div>
      );
  }
};
NoClassroomsFound.propTypes = {
  rosterProvider: PropTypes.oneOf(Object.keys(OAuthSectionTypes)),
};

const GOOGLE_CLASSROOMS_SYNC_SUPPORT_URL =
  'https://support.code.org/hc/en-us/articles/115001319312';
const ROSTERED_SECTIONS_SUPPORT_URL =
  'https://support.code.org/hc/en-us/articles/6496495212557';

const LoadError = ({rosterProvider, loginType, loadError}) => {
  switch (rosterProvider) {
    case OAuthSectionTypes.google_classroom:
      return (
        <div>
          <p>{locale.authorizeGoogleClassroomsText()}</p>
          <ReauthorizeGoogleClassroom />
          <p>
            <a
              href={GOOGLE_CLASSROOMS_SYNC_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale.errorLoadingRosteredSectionsSupport()}
            </a>
          </p>
        </div>
      );
    case OAuthSectionTypes.clever:
      if (loadError && loadError.status === 404) {
        return (
          <p>
            {locale.cleverClassroomsNotFound()}{' '}
            <a
              href={ROSTERED_SECTIONS_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale.errorLoadingRosteredSectionsSupport()}
            </a>
          </p>
        );
      }
      return (
        <p>
          {locale.errorLoadingRosteredSections({type: loginType})}{' '}
          <a
            href={ROSTERED_SECTIONS_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {locale.errorLoadingRosteredSectionsSupport()}
          </a>
        </p>
      );
    case OAuthSectionTypes.classlink:
      // The server distinguishes the ClassLink failure states (district not
      // enabled, no v2 credential, empty class) and sends the user-facing
      // copy; anything without a message gets the generic fallback so no
      // failure renders an empty dialog.
      return (
        <p>
          {(loadError && loadError.message) || locale.classlinkRosterError()}{' '}
          <a
            href={ROSTERED_SECTIONS_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {locale.errorLoadingRosteredSectionsSupport()}
          </a>
        </p>
      );
    default:
      return (
        <p>
          {locale.errorLoadingRosteredSections({type: loginType})}{' '}
          <a
            href={ROSTERED_SECTIONS_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {locale.errorLoadingRosteredSectionsSupport()}
          </a>
        </p>
      );
  }
};
LoadError.propTypes = {
  rosterProvider: PropTypes.string,
  loginType: PropTypes.string,
  loadError: loadErrorShape,
};

class RosterDialog extends React.Component {
  static propTypes = {
    // Provided by Redux
    handleImport: PropTypes.func,
    handleCancel: PropTypes.func,
    handleImportFailure: PropTypes.func,
    isOpen: PropTypes.bool,
    classrooms: PropTypes.arrayOf(classroomShape),
    loadError: loadErrorShape,
    rosterProvider: PropTypes.oneOf(Object.keys(OAuthSectionTypes)),
  };

  state = {selectedId: null};

  importClassroom = () => {
    this.recordSectionSetupExitEvent(COMPLETED_EVENT);
    const classrooms = this.props.classrooms;
    const selectedName =
      classrooms &&
      classrooms.find(classroom => {
        return classroom.id === this.state.selectedId;
      }).name;
    this.props.handleImport(this.state.selectedId, selectedName);
    this.setState({selectedId: null});
  };

  // create new function for redirect to NewEditPage
  redirectToEditSectionPage = sectionId => {
    const redirectUrl = '/sections/' + sectionId + '/edit';
    window.location.href = redirectUrl;
  };

  // Creates the section and redirects to the edit page
  handleRedirect = async () => {
    const classrooms = this.props.classrooms;
    const courseName =
      classrooms &&
      classrooms.find(classroom => {
        return classroom.id === this.state.selectedId;
      }).name;
    const courseId = this.state.selectedId;

    try {
      let response;
      if (this.props.rosterProvider === OAuthSectionTypes.classlink) {
        // The ClassLink import route is POST-only: importing mutates a
        // section, and a GET request would skip Rails CSRF verification.
        response = await HttpClient.post(
          '/dashboardapi/import_classlink_classroom',
          JSON.stringify({courseId, courseName}),
          true,
          {'Content-Type': 'application/json'}
        );
      } else {
        const importSectionUrl =
          this.props.rosterProvider === OAuthSectionTypes.google_classroom
            ? '/dashboardapi/import_google_classroom'
            : '/dashboardapi/import_clever_classroom';
        const query = new URLSearchParams({courseId, courseName});
        response = await HttpClient.get(`${importSectionUrl}?${query}`);
      }
      const newSection = await response.json();
      // Recorded after the import so the event can carry the new section's id.
      this.recordSectionSetupExitEvent(COMPLETED_EVENT, {
        sectionId: newSection.id,
      });
      this.redirectToEditSectionPage(newSection.id);
    } catch (error) {
      let status = 0;
      let message = '';
      if (isNetworkError(error)) {
        status = error.response.status;
        message = await error.response
          .json()
          .then(body => body.error || '')
          .catch(() => '');
      }
      this.props.handleImportFailure({status, message});
      throw error;
    }
  };

  cancel = () => {
    this.recordSectionSetupExitEvent(CANCELLED_EVENT);
    this.props.handleCancel();
  };

  onClassroomSelected = id => {
    this.setState({selectedId: id});
  };

  // valid event names: 'Section Setup Completed', 'Section Setup Cancelled'.
  recordSectionSetupExitEvent = (eventName, metadata = {}) => {
    const {rosterProvider} = this.props;

    analyticsReporter.sendEvent(eventName, {
      oauthSource: rosterProvider,
      ...metadata,
    });
  };

  render() {
    let title = '';
    let loginType = '';
    switch (this.props.rosterProvider) {
      case OAuthSectionTypes.google_classroom:
        title = locale.selectGoogleClassroom();
        loginType = locale.loginTypeGoogleClassroom();
        break;
      case OAuthSectionTypes.clever:
        title = locale.selectCleverSection();
        loginType = locale.loginTypeClever();
        break;
      case OAuthSectionTypes.classlink:
        title = locale.selectClasslinkSection();
        loginType = locale.loginTypeClasslink();
        break;
    }

    return (
      <BaseDialog
        useUpdatedStyles
        fixedHeight={480}
        isOpen={this.props.isOpen}
        handleClose={this.cancel}
        {...this.props}
      >
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.content}>
          {this.props.loadError ? (
            <LoadError
              rosterProvider={this.props.rosterProvider}
              loginType={loginType}
              loadError={this.props.loadError}
            />
          ) : this.props.classrooms ? (
            <ClassroomList
              classrooms={this.props.classrooms}
              onSelect={this.onClassroomSelected}
              selectedId={this.state.selectedId}
              rosterProvider={this.props.rosterProvider}
            />
          ) : (
            locale.loading()
          )}
        </div>
        <div className={moduleStyles.footer}>
          <MuiButton
            id="roster-cancel-button"
            variant="outlined"
            color="tertiary"
            size="small"
            type="button"
            onClick={this.cancel}
          >
            {locale.dialogCancel()}
          </MuiButton>
          <MuiButton
            id="import-button-and-redirect"
            variant="contained"
            color="primary"
            size="small"
            type="button"
            onClick={this.handleRedirect}
            disabled={!this.state.selectedId}
          >
            {locale.chooseSection()}
          </MuiButton>
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  title: {
    position: 'absolute',
    left: 20,
    color: color.dark_charcoal,
    margin: '15px 0',
  },
  content: {
    position: 'absolute',
    left: 20,
    top: 50,
    right: 20,
    bottom: 70,
    overflowY: 'scroll',
  },
  classroomRow: {
    padding: 10,
    cursor: 'pointer',
  },
  highlightRow: {
    backgroundColor: color.default_blue,
    color: color.white,
  },
};
export const UnconnectedRosterDialog = RosterDialog;
export default connect(
  state => ({
    isOpen: isRosterDialogOpen(state),
    classrooms: state.teacherSections.classrooms,
    loadError: state.teacherSections.loadError,
    rosterProvider: state.teacherSections.rosterProvider,
  }),
  {
    handleImport: importOrUpdateRoster,
    handleCancel: cancelImportRosterFlow,
    handleImportFailure: rosterImportFailed,
  }
)(RosterDialog);
