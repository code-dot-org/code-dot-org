import React, { PropTypes } from 'react';
import SectionSelector from './SectionSelector';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import AssignToSection from '@cdo/apps/templates/courseOverview/AssignToSection';
import experiments, { SECTION_FLOW_2017 } from '@cdo/apps/util/experiments';

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50
  },
  sectionSelector: {
    // offset selector's margin so that we're aligned flush right
    position: 'relative',
    right: 0,
    // vertically center
    bottom: 4
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0
  }
};

const ScriptOverviewTopRow = React.createClass({
  propTypes: {
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    currentCourseId: PropTypes.number,
    professionalLearningCourse: PropTypes.bool,
    hasLevelProgress: PropTypes.bool.isRequired,
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
  },

  render() {
    const {
      sectionsInfo,
      currentCourseId,
      professionalLearningCourse,
      hasLevelProgress,
      scriptId,
      scriptName,
      scriptTitle,
      viewAs,
      isRtl
    } = this.props;

    return (
      <div style={styles.buttonRow}>
        {!professionalLearningCourse && viewAs === ViewType.Student && (
          <div>
            <Button
              href={`/s/${scriptName}/next.next`}
              text={hasLevelProgress ? i18n.continue() : i18n.tryNow()}
              size={Button.ButtonSize.large}
            />
            <Button
              href="//support.code.org"
              text={i18n.getHelp()}
              color={Button.ButtonColor.white}
              size={Button.ButtonSize.large}
              style={{marginLeft: 10}}
            />
          </div>
        )}
        {!professionalLearningCourse && viewAs === ViewType.Teacher &&
            experiments.isEnabled(SECTION_FLOW_2017) && (
          <AssignToSection
            sectionsInfo={sectionsInfo}
            courseId={currentCourseId}
            scriptId={scriptId}
            assignmentName={scriptTitle}
          />
        )}
        <div style={isRtl ? styles.left : styles.right}>
          {viewAs === ViewType.Teacher &&
            <span style={styles.sectionSelector}>
              <SectionSelector/>
            </span>
          }
          <span>
            <ProgressDetailToggle/>
          </span>
        </div>
      </div>
    );
  }
});

export default ScriptOverviewTopRow;
