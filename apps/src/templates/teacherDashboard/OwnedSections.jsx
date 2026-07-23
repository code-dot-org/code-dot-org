/** @file Reusable widget to display and manage sections owned by the
 *        current user. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {beginEditingSection} from '@code-dot-org/teacher-dashboard/redux';
import {Button as MuiButton} from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import styleConstants from '@cdo/apps/styleConstants';
import i18n from '@cdo/locale';

import OwnedPlSectionsTable from './OwnedPlSectionsTable';
import OwnedSectionsTable from './OwnedSectionsTable';

import moduleStyles from './ownedSections.module.scss';

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
  }

  onEditSection(id) {
    this.props.beginEditingSection(id);
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
    const {sectionIds, hiddenSectionIds} = this.props;
    const {viewHidden} = this.state;

    const hasSections = sectionIds.length > 0;

    return (
      <div>
        {hasSections && (
          <div>
            {this.ownedSectionsTable(false)}
            <div
              className={moduleStyles.buttonContainer}
              style={{width: styleConstants['content-width']}}
            >
              {hiddenSectionIds.length > 0 && (
                <MuiButton
                  className="ui-test-show-hide"
                  onClick={this.toggleViewHidden}
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={
                    <FontAwesomeV6Icon
                      iconName={viewHidden ? 'caret-up' : 'caret-down'}
                    />
                  }
                >
                  {viewHidden
                    ? i18n.hideArchivedSections()
                    : i18n.viewArchivedSections()}
                </MuiButton>
              )}
            </div>
            {viewHidden && hiddenSectionIds.length > 0 && (
              <div>
                <div className={moduleStyles.hiddenSectionLabel}>
                  {i18n.archivedSections()}
                </div>
                <div className={moduleStyles.hiddenSectionDesc}>
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

export const UnconnectedOwnedSections = OwnedSections;

export default connect(() => ({}), {
  beginEditingSection,
})(OwnedSections);
