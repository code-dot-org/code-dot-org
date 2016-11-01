import React from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';

/**
 * A simple component that displays the name of the selected section and a link
 * to that section in the teacher dashboard. This is part of the teacher panel
 * on puzzle pages.
 */
const CurrentSection = React.createClass({
  propTypes: {
    sectionId: React.PropTypes.string.isRequired,
    sectionName: React.PropTypes.string
  },

  render() {
    const { sectionId, sectionName } = this.props;
    if (!sectionName) {
      return null;
    }
    return (
      <div className="section">
        <h4>
          {i18n.section() + " "}
          <a href={`${window.dashboard.CODE_ORG_URL}/teacher-dashboard#/sections/${sectionId}`}>{sectionName}</a>
        </h4>
      </div>
    );
  }
});

export default connect(state => {
  const { selectedSectionId, nameById } = state.sections;
  return {
    sectionId: selectedSectionId,
    sectionName: nameById.get(selectedSectionId)
  };
})(CurrentSection);
