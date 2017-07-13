import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import color from "@cdo/apps/util/color";
import SectionTable from './SectionTable';
import RosterDialog from './RosterDialog';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import { setSections, setValidAssignments, newSection } from './teacherSectionsRedux';
import { loadClassroomList, importClassroomStarted } from './googleClassroomRedux';
import { classroomShape, loadErrorShape } from './shapes';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

const styles = {
  breadcrumb: {
    marginTop: 20,
    marginBottom: 28
  },
  button: {
    marginBottom: 20,
    marginRight: 5,
  }
};

class SectionsPage extends Component {
  static propTypes = {
    validScripts: PropTypes.array.isRequired,

    // redux provided
    numSections: PropTypes.number.isRequired,
    studioUrl: PropTypes.string.isRequired,
    classrooms: PropTypes.arrayOf(classroomShape),
    loadError: loadErrorShape,
    newSection: PropTypes.func.isRequired,
    setSections: PropTypes.func.isRequired,
    setValidAssignments: PropTypes.func.isRequired,
    loadClassroomList: PropTypes.func.isRequired,
    importClassroomStarted: PropTypes.func.isRequired,
  };

  state = {
    sectionsLoaded: false,
    rosterDialogOpen: false,
  };

  componentDidMount() {
    const { validScripts, setValidAssignments, setSections } = this.props;
    let validCourses;
    let sections;

    const onAsyncLoad = () => {
      if (validCourses && sections) {
        setValidAssignments(validCourses, validScripts);
        setSections(sections);
        this.setState({sectionsLoaded: true});
      }
    };

    $.getJSON('/dashboardapi/courses').then(response => {
      validCourses = response;
      onAsyncLoad();
    });

    $.getJSON("/v2/sections/").done(response => {
      sections = response;
      onAsyncLoad();
    });
  }

  handleImportOpen = () => {
    this.setState({rosterDialogOpen: true});
    this.props.loadClassroomList();
  };

  handleImportCancel = () => {
    this.setState({rosterDialogOpen: false});
  };

  handleImport = courseId => {
    this.props.importClassroomStarted();

    $.getJSON('/dashboardapi/import_google_classroom', { courseId }).then(() => {
      this.setState({rosterDialogOpen: false, sectionsLoaded: false});

      $.getJSON("/v2/sections/").done(results => {
        this.props.setSections(results, true);
        this.setState({sectionsLoaded: true});
      });
    });
  };

  addSection = () => this.props.newSection();

  render() {
    const { numSections } = this.props;
    const { sectionsLoaded } = this.state;

    const showGoogleClassroom = experiments.isEnabled('googleClassroom');
    return (
      <div>
        <div style={styles.breadcrumb}>
          <a href="/teacher-dashboard#/">
            {i18n.teacherHomePage()}
          </a>
          <span style={{opacity: 0.5}}>{"\u00a0 \u25b6 \u00a0"}</span>
          <b style={{color: color.dark_orange}}>
            {i18n.studentAccountsAndProgress()}
          </b>
        </div>
        {sectionsLoaded &&
          <ProgressButton
            className="uitest-newsection"
            text={i18n.newSection()}
            style={styles.button}
            onClick={this.addSection}
            color={ProgressButton.ButtonColor.gray}
          />
        }
        {sectionsLoaded && showGoogleClassroom &&
          <ProgressButton
            text={i18n.importFromGoogleClassroom()}
            style={styles.button}
            onClick={this.handleImportOpen}
            color={ProgressButton.ButtonColor.gray}
          />
        }
        {sectionsLoaded && numSections === 0 &&
          <div className="jumbotron">
            <p>{i18n.createSectionsInfo()}</p>
          </div>
        }
        {sectionsLoaded && numSections > 0 && <SectionTable/>}
        <RosterDialog
          isOpen={this.state.rosterDialogOpen}
          handleImport={this.handleImport}
          handleCancel={this.handleImportCancel}
          classrooms={this.props.classrooms}
          loadError={this.props.loadError}
          studioUrl={this.props.studioUrl}
        />
      </div>
    );
  }
}
export const UnconnectedSectionsPage = SectionsPage;

export default connect(state => ({
  numSections: state.teacherSections.sectionIds.length,
  studioUrl: state.teacherSections.studioUrl,
  classrooms: state.googleClassroom.classrooms,
  loadError: state.googleClassroom.loadError,
}), { newSection, setSections, setValidAssignments, loadClassroomList, importClassroomStarted })(SectionsPage);
