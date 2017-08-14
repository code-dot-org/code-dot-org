/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import SectionTable from './SectionTable';
import RosterDialog from './RosterDialog';
import Button from '@cdo/apps/templates/Button';
import {
  newSection,
  beginEditingNewSection,
  beginEditingSection,
  beginImportRosterFlow,
} from './teacherSectionsRedux';
import {OAuthSectionTypes} from './shapes';
import i18n from '@cdo/locale';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import AddSectionDialog from "./AddSectionDialog";
import EditSectionDialog from "./EditSectionDialog";
import SetUpSections from '../studioHomepages/SetUpSections';

const styles = {
  button: {
    marginBottom: 20,
    marginRight: 5,
  }
};

class OwnedSections extends React.Component {
  static propTypes = {
    isRtl: PropTypes.bool,
    defaultCourseId: PropTypes.number,
    defaultScriptId: PropTypes.number,
    queryStringOpen: PropTypes.string,

    // redux provided
    numSections: PropTypes.number.isRequired,
    provider: PropTypes.string,
    asyncLoadComplete: PropTypes.bool.isRequired,
    newSection: PropTypes.func.isRequired,
    beginEditingNewSection: PropTypes.func.isRequired,
    beginEditingSection: PropTypes.func.isRequired,
    beginImportRosterFlow: PropTypes.func.isRequired,
  };

  componentWillMount() {
    if (experiments.isEnabled('importClassroom')) {
      this.provider = this.props.provider;
    }
  }

  componentDidMount() {
    const {
      defaultCourseId,
      defaultScriptId,
      queryStringOpen,
      beginImportRosterFlow,
    } = this.props;

    // If we have a default courseId and/or scriptId, we want to start with our
    // dialog open. Add a new section with this course/script as default
    if (defaultCourseId || defaultScriptId) {
      this.addSection();
    }

    if (experiments.isEnabled('importClassroom')) {
      if (queryStringOpen === 'rosterDialog') {
        beginImportRosterFlow();
      }
    }
  }

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
    const {
      isRtl,
      numSections,
      asyncLoadComplete,
      beginImportRosterFlow
    } = this.props;
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
                onClick={beginImportRosterFlow}
                color={Button.ButtonColor.gray}
              />
            }
            {showCleverClassroom &&
              <Button
                text={i18n.importFromClever()}
                style={styles.button}
                onClick={beginImportRosterFlow}
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
        <RosterDialog/>
        <AddSectionDialog/>
        <EditSectionDialog/>
      </div>
    );
  }
}
export const UnconnectedOwnedSections = OwnedSections;

export default connect(state => ({
  numSections: state.teacherSections.sectionIds.length,
  provider: state.teacherSections.provider,
  asyncLoadComplete: state.teacherSections.asyncLoadComplete,
}), {
  newSection,
  beginEditingNewSection,
  beginEditingSection,
  beginImportRosterFlow,
})(OwnedSections);
