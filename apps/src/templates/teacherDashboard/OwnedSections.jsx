/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import LtiFeedbackBanner from '@cdo/apps/lib/ui/simpleSignUp/lti/feedback/LtiFeedbackBanner';
import styleConstants from '@cdo/apps/styleConstants';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import {recordImpression} from './impressionHelpers';
import OwnedPlSectionsTable from './OwnedPlSectionsTable';
import OwnedSectionsTable from './OwnedSectionsTable';
import {recordOpenEditSectionDetails} from './sectionHelpers';
import {beginEditingSection} from './teacherSectionsRedux';

class OwnedSections extends React.Component {
  static propTypes = {
    isPlSections: PropTypes.bool,
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    hiddenSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,

    // redux provided
    beginEditingSection: PropTypes.func.isRequired,
  };

  state = {
    viewHidden: false,
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
  beginEditingSection = () => this.props.beginEditingSection();

  toggleViewHidden = () => {
    this.setState({
      viewHidden: !this.state.viewHidden,
    });
  };

  ownedSectionsTable = showHidden => {
    const {isPlSections, sectionIds, hiddenSectionIds} = this.props;
    const sectionsToShow = showHidden
      ? hiddenSectionIds
      : _.without(sectionIds, ...hiddenSectionIds);

    return isPlSections ? (
      <OwnedPlSectionsTable
        sectionIds={sectionsToShow}
        onEdit={this.onEditSection}
      />
    ) : (
      <OwnedSectionsTable
        sectionIds={sectionsToShow}
        onEdit={this.onEditSection}
      />
    );
  };

  render() {
    const {isPlSections, sectionIds, hiddenSectionIds} = this.props;
    const {viewHidden} = this.state;

    const hasSections = sectionIds.length > 0;

    return (
      <div
        className={
          isPlSections ? 'uitest-owned-pl-sections' : 'uitest-owned-sections'
        }
      >
        {hasSections && (
          <div>
            <LtiFeedbackBanner />
            {this.ownedSectionsTable(false)}
            <div style={styles.buttonContainer}>
              {hiddenSectionIds.length > 0 && (
                <Button
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
                <div style={styles.hiddenSectionDesc}>
                  {i18n.archivedSectionsTeacherDescription()}
                </div>
                {this.ownedSectionsTable(true)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  button: {
    marginBottom: 20,
    float: 'right',
  },
  buttonContainer: {
    width: styleConstants['content-width'],
    textAlign: 'right',
    paddingTop: 10,
    paddingBottom: 10,
  },
  hiddenSectionLabel: {
    fontSize: 18,
    paddingBottom: 10,
    color: color.charcoal,
  },
  hiddenSectionDesc: {
    fontSize: 14,
    lineHeight: '22px',
    paddingBottom: 10,
    color: color.charcoal,
  },
};
export const UnconnectedOwnedSections = OwnedSections;

export default connect(() => ({}), {
  beginEditingSection,
})(OwnedSections);
