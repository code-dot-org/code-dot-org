/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import SectionTable from './SectionTable';
import RosterDialog from './RosterDialog';
import Button from '@cdo/apps/templates/Button';
import {
  newSection,
  beginEditingNewSection,
  beginEditingSection,
  asyncLoadSectionData,
} from './teacherSectionsRedux';
import {loadClassroomList, importClassroomStarted} from './oauthClassroomRedux';
import {classroomShape, loadErrorShape, OAuthSectionTypes} from './shapes';
import i18n from '@cdo/locale';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import AddSectionDialog from "./AddSectionDialog";
import EditSectionDialog from "./EditSectionDialog";
import SetUpSections from '../studioHomepages/SetUpSections';

const urlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/import_google_classroom',
  [OAuthSectionTypes.clever]: '/dashboardapi/import_clever_classroom',
};

const styles = {
  button: {
    marginBottom: 20,
    marginRight: 5,
  }
};

class OwnedSections extends Component {
  static propTypes = {
    isRtl: PropTypes.bool,
    defaultCourseId: PropTypes.number,
    defaultScriptId: PropTypes.number,

    // redux provided
    numSections: PropTypes.number.isRequired,
    studioUrl: PropTypes.string.isRequired,
    provider: PropTypes.string,
    classrooms: PropTypes.arrayOf(classroomShape),
    loadError: loadErrorShape,
    asyncLoadComplete: PropTypes.bool.isRequired,
    newSection: PropTypes.func.isRequired,
    loadClassroomList: PropTypes.func.isRequired,
    importClassroomStarted: PropTypes.func.isRequired,
    beginEditingNewSection: PropTypes.func.isRequired,
    beginEditingSection: PropTypes.func.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
  };

  state = {
    rosterDialogOpen: false,
  };

  componentWillMount() {
    if (experiments.isEnabled('importClassroom')) {
      this.provider = this.props.provider;
    }
  }

  componentDidMount() {
    const {
      defaultCourseId,
      defaultScriptId
    } = this.props;

    // If we have a default courseId and/or scriptId, we want to start with our
    // dialog open. Add a new section with this course/script as default
    if (defaultCourseId || defaultScriptId) {
      this.addSection();
    }
  }

  handleImportOpen = () => {
    this.setState({rosterDialogOpen: true});
    this.props.loadClassroomList(this.provider);
  };

  handleImportCancel = () => {
    this.setState({rosterDialogOpen: false});
  };

  handleImport = courseId => {
    this.props.importClassroomStarted();

    const url = urlByProvider[this.provider];
    $.getJSON(url, { courseId }).then(() => {
      this.setState({rosterDialogOpen: false});
      this.props.asyncLoadSectionData();
    });
  };

  addSection = () => {
    const { defaultCourseId, defaultScriptId } = this.props;
    if (experiments.isEnabled(SECTION_FLOW_2017)) {
      this.props.beginEditingNewSection(defaultCourseId, defaultScriptId);
    } else {
      // This is the only usage of the newSection action, and can be removed once
      // SECTION_FLOW_2017 is finished
      return this.props.newSection(defaultCourseId);
    }
  };

  handleEditRequest = section => {
    if (experiments.isEnabled(SECTION_FLOW_2017)) {
      this.props.beginEditingSection(section.id);
    }
  };

  render() {
    const { isRtl, numSections, asyncLoadComplete } = this.props;
    if (!asyncLoadComplete) {
      return null;
    }

    const newSectionFlow = experiments.isEnabled(SECTION_FLOW_2017);
    const showGoogleClassroom = !newSectionFlow && this.provider === OAuthSectionTypes.google_classroom;
    const showCleverClassroom = !newSectionFlow && this.provider === OAuthSectionTypes.clever;
    return (
      <div className="uitest-owned-sections">
        {newSectionFlow && numSections === 0 ? (
          <SetUpSections isRtl={isRtl}/>
        ) : (
          <div>
            <Button
              className="uitest-newsection"
              text={i18n.newSection()}
              style={styles.button}
              onClick={this.addSection}
              color={Button.ButtonColor.gray}
            />
            {showGoogleClassroom &&
              <Button
                text={i18n.importFromGoogleClassroom()}
                style={styles.button}
                onClick={this.handleImportOpen}
                color={Button.ButtonColor.gray}
              />
            }
            {showCleverClassroom &&
              <Button
                text={i18n.importFromClever()}
                style={styles.button}
                onClick={this.handleImportOpen}
                color={Button.ButtonColor.gray}
              />
            }
            {numSections > 0 &&
              <SectionTable onEdit={this.handleEditRequest}/>
            }
            {numSections === 0 && !newSectionFlow &&
              <div className="jumbotron">
                <p>{i18n.createSectionsInfo()}</p>
              </div>
            }
          </div>
        )}
        <RosterDialog
          isOpen={this.state.rosterDialogOpen}
          handleImport={this.handleImport}
          handleCancel={this.handleImportCancel}
          classrooms={this.props.classrooms}
          loadError={this.props.loadError}
          studioUrl={this.props.studioUrl}
          provider={this.provider}
        />
        <AddSectionDialog handleImportOpen={this.handleImportOpen}/>
        <EditSectionDialog/>
      </div>
    );
  }
}
export const UnconnectedOwnedSections = OwnedSections;

export default connect(state => ({
  numSections: state.teacherSections.sectionIds.length,
  studioUrl: state.teacherSections.studioUrl,
  provider: state.teacherSections.provider,
  classrooms: state.oauthClassroom.classrooms,
  loadError: state.oauthClassroom.loadError,
  asyncLoadComplete: state.teacherSections.asyncLoadComplete,
}), {
  newSection,
  beginEditingNewSection,
  beginEditingSection,
  loadClassroomList,
  importClassroomStarted,
  asyncLoadSectionData,
})(OwnedSections);
