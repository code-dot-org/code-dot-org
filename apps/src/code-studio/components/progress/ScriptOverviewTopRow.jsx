import React, { PropTypes } from 'react';
import SectionSelector from './SectionSelector';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import AssignToSection from '@cdo/apps/templates/courseOverview/AssignToSection';
import { stringForType, resourceShape } from '@cdo/apps/templates/courseOverview/resourceType';

export const NOT_STARTED = 'NOT_STARTED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';

const NEXT_BUTTON_TEXT = {
  [NOT_STARTED]: i18n.tryNow(),
  [IN_PROGRESS]: i18n.continue(),
  [COMPLETED]: i18n.printCertificate(),
};

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50,
    position: 'relative',
  },
  sectionSelector: {
    // offset selector's margin so that we're aligned flush right
    position: 'relative',
    margin: 10,
    right: 0,
    // vertically center
    bottom: 4,
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
  },
  dropdown: {
    display: 'inline-block',
    marginLeft: 10,
  }
};

export default class ScriptOverviewTopRow extends React.Component {
  static propTypes = {
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    currentCourseId: PropTypes.number,
    professionalLearningCourse: PropTypes.bool,
    scriptProgress: PropTypes.oneOf([NOT_STARTED, IN_PROGRESS, COMPLETED]),
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    scriptHasLockableStages: PropTypes.bool.isRequired,
    scriptAllowsHiddenStages: PropTypes.bool.isRequired,
  };

  render() {
    const {
      sectionsInfo,
      currentCourseId,
      professionalLearningCourse,
      scriptProgress,
      scriptId,
      scriptName,
      scriptTitle,
      viewAs,
      isRtl,
      resources,
      scriptHasLockableStages,
      scriptAllowsHiddenStages,
    } = this.props;

    return (
      <div style={styles.buttonRow}>
        {!professionalLearningCourse && viewAs === ViewType.Student && (
          <div>
            <Button
              href={`/s/${scriptName}/next.next`}
              text={NEXT_BUTTON_TEXT[scriptProgress]}
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
        {!professionalLearningCourse && viewAs === ViewType.Teacher && (
          <AssignToSection
            sectionsInfo={sectionsInfo}
            courseId={currentCourseId}
            scriptId={scriptId}
            assignmentName={scriptTitle}
          />
        )}
        {!professionalLearningCourse && viewAs === ViewType.Teacher &&
            resources.length > 0 &&
          <div style={styles.dropdown}>
            <DropdownButton
              text={i18n.teacherResources()}
              color={Button.ButtonColor.blue}
            >
              {resources.map(({type, link}, index) =>
                <a
                  key={index}
                  href={link}
                  target="_blank"
                >
                  {stringForType[type]}
                </a>
              )}
            </DropdownButton>
          </div>
        }
        <div style={isRtl ? styles.left : styles.right}>
          {viewAs === ViewType.Teacher &&
            (scriptHasLockableStages || scriptAllowsHiddenStages) &&
            <SectionSelector style={styles.sectionSelector}/>
          }
          <span>
            <ProgressDetailToggle/>
          </span>
        </div>
      </div>
    );
  }
}
