import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../BaseDialog';
import { classroomShape, loadErrorShape, OAuthSectionTypes } from './shapes';
import color from '../../util/color';
import locale from '@cdo/locale';
import {
  cancelImportRosterFlow,
  importOrUpdateRoster,
  isRosterDialogOpen,
} from './teacherSectionsRedux';

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
  footer: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    left: 20,
  },
  buttonPrimary: {
    float: 'right',
    background: color.orange,
    color: color.white,
    border: '1px solid #b07202',
    borderRadius: 3,
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
    fontSize: 14,
    padding: '8px 20px',
  },
  buttonSecondary: {
    float: 'left',
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5',
  },
  error: {
    fontSize: 10,
    color: color.light_gray,
    display: 'none',
  },
};

const ClassroomList = ({classrooms, onSelect, selectedId, provider}) => classrooms.length ?
  <div>
    {classrooms.map(classroom => (
      <div
        style={Object.assign({},
          styles.classroomRow,
          selectedId === classroom.id && styles.highlightRow
        )}
        key={classroom.id}
        onClick={onSelect.bind(null, classroom.id)}
      >
        {classroom.name}
        {classroom.section &&
          <span style={{color: '#aaa'}}> ({classroom.section})</span>
        }
        <span style={{float: 'right'}}>
          {locale.code()}
          <span style={{fontFamily: 'monospace'}}> {classroom.enrollment_code}</span>
        </span>
      </div>
    ))}
  </div> :
  <NoClassroomsFound provider={provider}/>
;
ClassroomList.propTypes = {
  classrooms: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  provider: PropTypes.oneOf(Object.keys(OAuthSectionTypes)),
};

const NoClassroomsFound = ({provider}) => {
  switch (provider) {
    case OAuthSectionTypes.google_classroom:
      return (
        <div>
          <p>
            {locale.noClassroomsFound()}
          </p>
          <a href="https://classroom.google.com/">
              {locale.addRemoveGoogleClassrooms()}
          </a>
        </div>
      );
    case OAuthSectionTypes.clever:
      return (
        <div>
          <p>
            {locale.noClassroomsFound()}
          </p>
          <a href="https://classroom.google.com/">
            {locale.addRemoveCleverClassrooms()}
          </a>
        </div>
      );
  }
};
NoClassroomsFound.propTypes = {
  provider: PropTypes.oneOf(Object.keys(OAuthSectionTypes)),
};

const LoadError = ({error}) =>
  <div>
    <p>
      {locale.authorizeGoogleClassroomsText()}
    </p>
    <a href={`/users/auth/google_oauth2?scope=userinfo.email,userinfo.profile,classroom.courses.readonly,classroom.rosters.readonly`}>
      {locale.authorizeGoogleClassrooms()}
    </a>
    <p style={styles.error}>
      {error.status} {error.message}
    </p>
  </div>;
LoadError.propTypes = {
  error: loadErrorShape,
};

class RosterDialog extends React.Component {
  static propTypes = {
    // Provided by Redux
    handleImport: PropTypes.func,
    handleCancel: PropTypes.func,
    isOpen: PropTypes.bool,
    classrooms: PropTypes.arrayOf(classroomShape),
    loadError: loadErrorShape,
    provider: PropTypes.oneOf(Object.keys(OAuthSectionTypes)),
  };

  state = {selectedId: null};

  importClassroom = () => {
    const classrooms = this.props.classrooms;
    const selectedName = classrooms && classrooms.find(classroom => {
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
    switch (this.props.provider) {
      case OAuthSectionTypes.google_classroom:
        title = locale.selectGoogleClassroom();
        break;
      case OAuthSectionTypes.clever:
        title = locale.selectCleverSection();
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
        <h2 style={styles.title}>
          {title}
        </h2>
        <div style={styles.content}>
          {this.props.loadError ?
            <LoadError error={this.props.loadError}/> :
            this.props.classrooms ?
              <ClassroomList
                classrooms={this.props.classrooms}
                onSelect={this.onClassroomSelected}
                selectedId={this.state.selectedId}
                provider={this.props.provider}
              /> :
              locale.loading()
          }
        </div>
        <div style={styles.footer}>
          <button
            onClick={this.cancel}
            style={{...styles.buttonPrimary, ...styles.buttonSecondary}}
          >
            {locale.dialogCancel()}
          </button>
          <button
            onClick={this.importClassroom}
            style={Object.assign({},
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
export const UnconnectedRosterDialog = RosterDialog;
export default connect(state => ({
  isOpen: isRosterDialogOpen(state),
  classrooms: state.teacherSections.classrooms,
  loadError: state.teacherSections.loadError,
  provider: state.teacherSections.provider,
}), {
  handleImport: importOrUpdateRoster,
  handleCancel: cancelImportRosterFlow,
})(RosterDialog);
