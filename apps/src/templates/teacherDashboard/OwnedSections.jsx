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
      isRtl,
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
              sectionIds={_.without(sectionIds, ...hiddenSectionIds)}
              onEdit={beginEditingSection}
            />
            <div style={styles.buttonContainer}>
              {hiddenSectionIds.length > 0 && (
                <Button
                  onClick={this.toggleViewHidden}
                  icon={viewHidden ? "caret-up" : "caret-down"}
                  text={viewHidden ? i18n.hideHiddenSections() : i18n.viewHiddenSections()}
                  color={Button.ButtonColor.gray}
                />
              )}
            </div>
            {viewHidden &&
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
