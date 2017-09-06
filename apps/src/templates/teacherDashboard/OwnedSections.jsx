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
import color from '@cdo/apps/util/color';
import styleConstants from '@cdo/apps/styleConstants';
import AddSectionDialog from "./AddSectionDialog";
import EditSectionDialog from "./EditSectionDialog";
import SetUpSections from '../studioHomepages/SetUpSections';

const styles = {
  button: {
    marginBottom: 20,
    marginRight: 5,
  },
  buttonContainer: {
    width: styleConstants['content-width'],
    textAlign: 'right',
    paddingTop: 10,
    paddingBottom: 10,
  },
  hiddenSectionLabel: {
    fontSize: 14,
    paddingBottom: 5,
    color: color.charcoal
  }
};

class OwnedSections extends React.Component {
  static propTypes = {
    isRtl: PropTypes.bool,
    queryStringOpen: PropTypes.string,

    // redux provided
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    sections: PropTypes.object.isRequired,
    asyncLoadComplete: PropTypes.bool.isRequired,
    beginEditingNewSection: PropTypes.func.isRequired,
    beginEditingSection: PropTypes.func.isRequired,
    beginImportRosterFlow: PropTypes.func.isRequired,
  };

  state = {
    viewHidden: false
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

  toggleViewHidden = () => {
    this.setState({
      viewHidden: !this.state.viewHidden
    });
  }

  render() {
    const {
      isRtl,
      sectionIds,
      sections,
      asyncLoadComplete,
    } = this.props;
    const { viewHidden } = this.state;

    if (!asyncLoadComplete) {
      return null;
    }

    const hasSections = sectionIds.length > 0;

    let hiddenSectionIds = [];
    let unhiddenSectionIds = [];
    sectionIds.forEach(id => {
      if (sections[id].hidden) {
        hiddenSectionIds.push(id);
      } else {
        unhiddenSectionIds.push(id);
      }
    });

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
              sectionIds={unhiddenSectionIds}
              onEdit={this.beginEditingSection}
            />
            <div style={styles.buttonContainer}>
              {/* TODO: i18n */}
              {hiddenSectionIds.length > 0 && (
                <Button
                  onClick={this.toggleViewHidden}
                  icon={viewHidden ? "caret-up" : "caret-down"}
                  text={viewHidden ? "Hide hidden sections" : "View hidden sections"}
                  color={Button.ButtonColor.gray}
                />
              )}
            </div>
            {viewHidden &&
              <div>
                <div style={styles.hiddenSectionLabel}>
                  Hidden Sections
                </div>
                <SectionTable
                  sectionIds={hiddenSectionIds}
                  onEdit={this.beginEditingSection}
                />
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
  sectionIds: state.teacherSections.sectionIds,
  sections: state.teacherSections.sections,
  asyncLoadComplete: state.teacherSections.asyncLoadComplete,
}), {
  beginEditingNewSection,
  beginEditingSection,
  beginImportRosterFlow,
})(OwnedSections);
