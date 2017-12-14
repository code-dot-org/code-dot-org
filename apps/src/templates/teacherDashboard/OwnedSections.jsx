/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import SectionTable from './SectionTable';
import RosterDialog from './RosterDialog';
import Button from '@cdo/apps/templates/Button';
import {
  hiddenSectionIds,
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
import Notification from '../Notification';

const styles = {
  button: {
    marginBottom: 20,
    float: 'right'
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
    queryStringOpen: PropTypes.string,

    // redux provided
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    hiddenSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
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

  toggleViewHidden = () => {
    this.setState({
      viewHidden: !this.state.viewHidden
    });
  }

  render() {
    const {
      sectionIds,
      hiddenSectionIds,
      asyncLoadComplete,
      beginEditingSection,
    } = this.props;
    const { viewHidden } = this.state;

    if (!asyncLoadComplete) {
      return null;
    }

    const hasSections = sectionIds.length > 0;
    const visibleSectionIds = _.without(sectionIds, ...hiddenSectionIds);

    return (
      <div className="uitest-owned-sections">
        {!hasSections &&
          <SetUpSections/>
        }
        {hasSections && (
          <div>
            <Notification
              type="course"
              notice={i18n.newSectionAdd()}
              details={i18n.createNewClassroom()}
              dismissible={false}
              buttonText={i18n.newSectionCreate()}
              newWindow={true}
              onButtonClick={this.beginEditingNewSection}
              buttonClassName="uitest-newsection"
            />
            {visibleSectionIds.length > 0 &&
              <SectionTable
                sectionIds={visibleSectionIds}
                onEdit={beginEditingSection}
              />
            }
            <div style={styles.buttonContainer}>
              {hiddenSectionIds.length > 0 && (
                <Button
                  className="ui-test-show-hide"
                  onClick={this.toggleViewHidden}
                  icon={viewHidden ? "caret-up" : "caret-down"}
                  text={viewHidden ? i18n.hideHiddenSections() : i18n.viewHiddenSections()}
                  color={Button.ButtonColor.gray}
                />
              )}
            </div>
            {viewHidden && hiddenSectionIds.length > 0 &&
              <div>
                <div style={styles.hiddenSectionLabel}>
                  {i18n.hiddenSections()}
                </div>
                <SectionTable
                  sectionIds={hiddenSectionIds}
                  onEdit={beginEditingSection}
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
  hiddenSectionIds: hiddenSectionIds(state),
  asyncLoadComplete: state.teacherSections.asyncLoadComplete,
}), {
  beginEditingNewSection,
  beginEditingSection,
  beginImportRosterFlow,
})(OwnedSections);
