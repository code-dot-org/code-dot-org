import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import TeacherInfoBox from '@cdo/apps/templates/progress/TeacherInfoBox';
import HiddenStageToggle from '@cdo/apps/templates/progress/HiddenStageToggle';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

class CourseScriptTeacherInfo extends Component {
  static propTypes = {
    courseId: PropTypes.number.isRequired,
    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    hasNoSections: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string.isRequired,
    hiddenStageState: PropTypes.object.isRequired,
  };

  render() {
    const { courseId, viewAs, hasNoSections, selectedSectionId, hiddenStageState } = this.props;
    if (!experiments.isEnabled('hidden-scripts')) {
      return null;
    }

    if (viewAs !== ViewType.Teacher) {
      return null;
    }

    // Note: Students should always have no (owned) sections
    const showHiddenScriptToggle = !hasNoSections;
    const tooltipId = _.uniqueId();

    const isHidden = isHiddenForSection(hiddenStageState, selectedSectionId, courseId);

    return (
      <TeacherInfoBox>
        {showHiddenScriptToggle &&
          <div
            data-tip
            data-for={tooltipId}
            aria-describedby={tooltipId}
          >
            <HiddenStageToggle
              hidden={isHidden}
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
  viewAs: state.viewAs,
  hasNoSections: state.teacherSections.sectionsAreLoaded &&
    state.teacherSections.sectionIds.length === 0,
  selectedSectionId: state.teacherSections.selectedSectionId,
  hiddenStageState: state.hiddenStage,
}))(CourseScriptTeacherInfo);
