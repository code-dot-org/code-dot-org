import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
// TODO: rename component
import TeacherInfoBox from '@cdo/apps/templates/progress/TeacherInfoBox';
import HiddenStageToggle from '@cdo/apps/templates/progress/HiddenStageToggle';
import i18n from '@cdo/locale';

class CourseScriptTeacherInfo extends Component {
  static propTypes = {
    hasNoSections: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string.isRequired,
  };

  render() {
    const { hasNoSections, selectedSectionId } = this.props;
    // Note: Students should always have no (owned) sections
    const showHiddenScriptToggle = !hasNoSections;
    const tooltipId = _.uniqueId();

    return (
      <TeacherInfoBox>
        {showHiddenScriptToggle &&
          <div
            data-tip
            data-for={tooltipId}
            aria-describedby={tooltipId}
          >
            <HiddenStageToggle
              hidden={false}
              disabled={!selectedSectionId}
              onChange={() => console.log('change')}
            />
          </div>
        }
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
          disable={!!selectedSectionId}
        >
          {i18n.hiddenScriptTooltip()}
        </ReactTooltip>
      </TeacherInfoBox>
    );
  }
}

export default connect(state => ({
  hasNoSections: state.teacherSections.sectionsAreLoaded &&
    state.teacherSections.sectionIds.length === 0,
  selectedSectionId: state.teacherSections.selectedSectionId,
}))(CourseScriptTeacherInfo);
