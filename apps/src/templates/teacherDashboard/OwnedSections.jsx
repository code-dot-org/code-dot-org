/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import SectionTable from './SectionTable';
import RosterDialog from './RosterDialog';
import Button from '@cdo/apps/templates/Button';
import {
  beginEditingNewSection,
  beginEditingSection,
  beginImportRosterFlow,
} from './teacherSectionsRedux';
import i18n from '@cdo/locale';
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
    queryStringOpen: PropTypes.string,

    // redux provided
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    asyncLoadComplete: PropTypes.bool.isRequired,
    beginEditingNewSection: PropTypes.func.isRequired,
    beginEditingSection: PropTypes.func.isRequired,
    beginImportRosterFlow: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const {
      queryStringOpen,
      beginImportRosterFlow,
    } = this.props;

    if (queryStringOpen === 'rosterDialog') {
      beginImportRosterFlow();
    }
  }

  // Wrapped to avoid passing event args
  beginEditingNewSection = () => this.props.beginEditingNewSection();

  beginEditingSection = section => this.props.beginEditingSection(section.id);

  render() {
    const {
      isRtl,
      sectionIds,
      asyncLoadComplete,
    } = this.props;
    if (!asyncLoadComplete) {
      return null;
    }

    const hasSections = sectionIds.length > 0;

    return (
      <div className="uitest-owned-sections">
        {!hasSections &&
          <SetUpSections isRtl={isRtl}/>
        }
        {hasSections && (
          <div>
            <Button
              className="uitest-newsection"
              text={i18n.newSection()}
              style={styles.button}
              onClick={this.beginEditingNewSection}
              color={Button.ButtonColor.gray}
            />
            <SectionTable
              sectionIds={sectionIds}
              onEdit={this.beginEditingSection}
            />
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
  sectionIds: state.teacherSections.sectionIds,
  asyncLoadComplete: state.teacherSections.asyncLoadComplete,
}), {
  beginEditingNewSection,
  beginEditingSection,
  beginImportRosterFlow,
})(OwnedSections);
