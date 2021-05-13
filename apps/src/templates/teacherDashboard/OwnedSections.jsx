/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import OwnedSectionsTable from './OwnedSectionsTable';
import RosterDialog from './RosterDialog';
import Button from '@cdo/apps/templates/Button';
import {
  hiddenSectionIds,
  beginEditingNewSection,
  beginEditingSection
} from './teacherSectionsRedux';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import styleConstants from '@cdo/apps/styleConstants';
import AddSectionDialog from './AddSectionDialog';
import EditSectionDialog from './EditSectionDialog';
import SetUpSections from '../studioHomepages/SetUpSections';
import {recordOpenEditSectionDetails} from './sectionHelpers';
import experiments from '@cdo/apps/util/experiments';
import {recordImpression} from './impressionHelpers';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

class OwnedSections extends React.Component {
  static propTypes = {
    // redux provided
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    hiddenSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    asyncLoadComplete: PropTypes.bool.isRequired,
    beginEditingNewSection: PropTypes.func.isRequired,
    beginEditingSection: PropTypes.func.isRequired
  };

  state = {
    viewHidden: false
  };

  constructor(props) {
    super(props);
    this.onEditSection = this.onEditSection.bind(this);
    if (experiments.isEnabled(experiments.TEACHER_DASHBOARD_SECTION_BUTTONS)) {
      recordImpression('owned_sections_table_with_dashboard_header_buttons');
    } else {
      recordImpression('owned_sections_table_without_dashboard_header_buttons');
    }
  }

  onEditSection(id) {
    this.props.beginEditingSection(id);
    if (experiments.isEnabled(experiments.TEACHER_DASHBOARD_SECTION_BUTTONS)) {
      recordOpenEditSectionDetails(
        id,
        'owned_sections_table_with_dashboard_header_buttons'
      );
    } else {
      recordOpenEditSectionDetails(
        id,
        'owned_sections_table_without_dashboard_header_buttons'
      );
    }
  }

  // Wrapped to avoid passing event args
  beginEditingNewSection = () => this.props.beginEditingNewSection();

  toggleViewHidden = () => {
    this.setState({
      viewHidden: !this.state.viewHidden
    });
  };

  render() {
    const {sectionIds, hiddenSectionIds, asyncLoadComplete} = this.props;
    const {viewHidden} = this.state;

    if (!asyncLoadComplete) {
      return <Spinner size="large" style={styles.spinner} />;
    }

    const hasSections = sectionIds.length > 0;
    const visibleSectionIds = _.without(sectionIds, ...hiddenSectionIds);

    return (
      <div className="uitest-owned-sections">
        <SetUpSections hasSections={hasSections} />
        {hasSections && (
          <div>
            {visibleSectionIds.length > 0 && (
              <OwnedSectionsTable
                sectionIds={visibleSectionIds}
                onEdit={this.onEditSection}
              />
            )}
            <div style={styles.buttonContainer}>
              {hiddenSectionIds.length > 0 && (
                <Button
                  __useDeprecatedTag
                  className="ui-test-show-hide"
                  onClick={this.toggleViewHidden}
                  icon={viewHidden ? 'caret-up' : 'caret-down'}
                  text={
                    viewHidden
                      ? i18n.hideArchivedSections()
                      : i18n.viewArchivedSections()
                  }
                  color={Button.ButtonColor.gray}
                />
              )}
            </div>
            {viewHidden && hiddenSectionIds.length > 0 && (
              <div>
                <div style={styles.hiddenSectionLabel}>
                  {i18n.archivedSections()}
                </div>
                <OwnedSectionsTable
                  sectionIds={hiddenSectionIds}
                  onEdit={this.onEditSection}
                />
              </div>
            )}
          </div>
        )}
        <RosterDialog />
        <AddSectionDialog />
        <EditSectionDialog />
      </div>
    );
  }
}

const styles = {
  button: {
    marginBottom: 20,
    float: 'right'
  },
  buttonContainer: {
    width: styleConstants['content-width'],
    textAlign: 'right',
    paddingTop: 10,
    paddingBottom: 10
  },
  hiddenSectionLabel: {
    fontSize: 14,
    paddingBottom: 5,
    color: color.charcoal
  },
  spinner: {
    marginTop: '10px'
  }
};
export const UnconnectedOwnedSections = OwnedSections;

export default connect(
  state => ({
    sectionIds: state.teacherSections.sectionIds,
    hiddenSectionIds: hiddenSectionIds(state),
    asyncLoadComplete: state.teacherSections.asyncLoadComplete
  }),
  {
    beginEditingNewSection,
    beginEditingSection
  }
)(OwnedSections);
