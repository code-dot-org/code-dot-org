import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../BaseDialog';
import {classroomShape, loadErrorShape} from './shapes';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import color from '../../util/color';
import locale from '@cdo/locale';
import {
  cancelImportRosterFlow,
  importOrUpdateRoster,
  isRosterDialogOpen
} from './teacherSectionsRedux';
import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';

const ctaButtonStyle = {
  background: color.orange,
  color: color.white,
  border: '1px solid #b07202',
  borderRadius: 3,
  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
  fontSize: 14,
  padding: '8px 20px'
};

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
  rosterProvider: PropTypes.oneOf(Object.keys(OAuthSectionTypes))
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
  }
};
NoClassroomsFound.propTypes = {
  rosterProvider: PropTypes.oneOf(Object.keys(OAuthSectionTypes))
};

const ROSTERED_SECTIONS_SUPPORT_URL =
  'https://support.code.org/hc/en-us/articles/115001319312';

const LoadError = ({rosterProvider, loginType}) => {
  switch (rosterProvider) {
    case OAuthSectionTypes.google_classroom:
      return (
        <div>
          <p>{locale.authorizeGoogleClassroomsText()}</p>
          <ReauthorizeGoogleClassroom />
          <p>
            <a
              href={ROSTERED_SECTIONS_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale.errorLoadingRosteredSectionsSupport()}
            </a>
          </p>
        </div>
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
  loginType: PropTypes.string
};

const REAUTHORIZE_URL =
  '/users/auth/google_oauth2?scope=userinfo.email,userinfo.profile,classroom.courses.readonly,classroom.rosters.readonly';
function ReauthorizeGoogleClassroom() {
  return (
    <form method="POST" action={REAUTHORIZE_URL}>
      <RailsAuthenticityToken />
      <button type="submit" style={ctaButtonStyle}>
        {locale.authorizeGoogleClassrooms()}
      </button>
    </form>
  );
}

class RosterDialog extends React.Component {
  static propTypes = {
    // Provided by Redux
    handleImport: PropTypes.func,
    handleCancel: PropTypes.func,
    isOpen: PropTypes.bool,
    classrooms: PropTypes.arrayOf(classroomShape),
    loadError: loadErrorShape,
    rosterProvider: PropTypes.oneOf(Object.keys(OAuthSectionTypes))
  };

  state = {selectedId: null};

  importClassroom = () => {
    const classrooms = this.props.classrooms;
    const selectedName =
      classrooms &&
      classrooms.find(classroom => {
        return classroom.id === this.state.selectedId;
      }).name;

    this.props.handleImport(this.state.selectedId, selectedName);
    this.setState({selectedId: null});
  };

  cancel = () => {
    this.props.handleCancel();
  };

  onClassroomSelected = id => {
    this.setState({selectedId: id});
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
        <div style={styles.footer}>
          <button
            type="button"
            onClick={this.cancel}
            style={{...styles.buttonPrimary, ...styles.buttonSecondary}}
          >
            {locale.dialogCancel()}
          </button>
          <button
            type="button"
            onClick={this.importClassroom}
            style={Object.assign(
              {},
              styles.buttonPrimary,
              !this.state.selectedId && {opacity: 0.5}
            )}
            disabled={!this.state.selectedId}
          >
            {locale.chooseSection()}
          </button>
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
    margin: '15px 0'
  },
  content: {
    position: 'absolute',
    left: 20,
    top: 50,
    right: 20,
    bottom: 70,
    overflowY: 'scroll'
  },
  classroomRow: {
    padding: 10,
    cursor: 'pointer'
  },
  highlightRow: {
    backgroundColor: color.default_blue,
    color: color.white
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    left: 20
  },
  buttonPrimary: {
    ...ctaButtonStyle,
    float: 'right'
  },
  buttonSecondary: {
    float: 'left',
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5'
  }
};
export const UnconnectedRosterDialog = RosterDialog;
export default connect(
  state => ({
    isOpen: isRosterDialogOpen(state),
    classrooms: state.teacherSections.classrooms,
    loadError: state.teacherSections.loadError,
    rosterProvider: state.teacherSections.rosterProvider
  }),
  {
    handleImport: importOrUpdateRoster,
    handleCancel: cancelImportRosterFlow
  }
)(RosterDialog);
