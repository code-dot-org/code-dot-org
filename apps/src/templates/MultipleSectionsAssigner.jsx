import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {
  assignToSection,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';

import {
  Heading3,
  Heading5,
  BodyTwoText,
} from '@cdo/apps/componentLibrary/typography';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';

import moduleStyle from './multiple-sections-assigner.module.scss';

const MultipleSectionsAssigner = ({
  courseId,
  assignmentName,
  onClose,
  courseOfferingId,
  courseVersionId,
  scriptId,
  reassignConfirm = () => {},
  isAssigningCourse,
  isStandAloneUnit,
  participantAudience,
  onAssignSuccess,
  sectionDirections = i18n.chooseSectionsDirections(),
  // Redux
  sections,
  unassignSection,
  assignToSection,
  updateHiddenScript,
}) => {
  let initialSectionsAssigned = [];

  // check to see if this is coming from the UNIT landing page - if so add courses featuring this unit
  if (!isAssigningCourse) {
    if (isStandAloneUnit) {
      for (let i = 0; i < sections.length; i++) {
        if (courseVersionId === sections[i].courseVersionId) {
          initialSectionsAssigned.push(sections[i]);
        }
      }
    } else {
      for (let i = 0; i < sections.length; i++) {
        if (scriptId === sections[i].unitId) {
          initialSectionsAssigned.push(sections[i]);
        }
      }
    }
  } else if (isAssigningCourse) {
    // checks to see if this is coming from the COURSE landing page
    for (let i = 0; i < sections.length; i++) {
      if (courseId === sections[i].courseId) {
        initialSectionsAssigned.push(sections[i]);
      }
    }
  }

  const [currentSectionsAssigned, setCurrentSectionsAssigned] = useState(
    initialSectionsAssigned
  );

  const handleChangedCheckbox = currentSection => {
    const isUnchecked = currentSectionsAssigned.some(
      s => s.code === currentSection.code
    );
    if (isUnchecked) {
      const newList = currentSectionsAssigned.filter(
        s => s.code !== currentSection.code
      );
      setCurrentSectionsAssigned(newList);
    } else {
      const newList = [...currentSectionsAssigned];
      newList.push(currentSection);
      setCurrentSectionsAssigned(newList);
    }
  };

  const reassignSections = () => {
    // Assign any courses that need to be assigned
    for (let i = 0; i < currentSectionsAssigned.length; i++) {
      const needsToBeAssigned = !initialSectionsAssigned.some(
        s => s.code === currentSectionsAssigned[i].code
      );
      if (needsToBeAssigned) {
        if (isAssigningCourse) {
          const sectionId = currentSectionsAssigned[i].id;
          assignToSectionWithConfirmation(
            sectionId,
            courseId,
            courseOfferingId,
            courseVersionId,
            scriptId
          );
        } else {
          unhideAndAssignUnit(currentSectionsAssigned[i]);
        }
      }
    }

    // If any sections need to be removed from being assigned, remove them
    for (let i = 0; i < initialSectionsAssigned.length; i++) {
      const isSectionToBeRemoved = !currentSectionsAssigned.some(
        s => s.code === initialSectionsAssigned[i].code
      );

      if (isSectionToBeRemoved) {
        // if on COURSE landing page or a STANDALONE UNIT, unassign entirely
        isAssigningCourse || isStandAloneUnit
          ? unassignSection(initialSectionsAssigned[i].id, '')
          : assignCourseWithoutUnit(initialSectionsAssigned[i]);
      }
    }
    // close dialogue
    reassignConfirm();
    onClose();
  };

  const selectAllHandler = () => {
    let newSectionsAssigned = [...currentSectionsAssigned];
    for (let i = 0; i < sections.length; i++) {
      // if the section is NOT in currentSections assigned, assign it
      const isSectionToBeAssigned = !currentSectionsAssigned.some(
        s => s.code === sections[i].code
      );
      if (isSectionToBeAssigned) {
        newSectionsAssigned.push(sections[i]);
      }
    }
    setCurrentSectionsAssigned(newSectionsAssigned);
  };

  const unhideAndAssignUnit = section => {
    const sectionId = section.id;
    updateHiddenScript(sectionId, scriptId, false);
    assignToSectionWithConfirmation(
      sectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId
    );
  };

  // this is identical to unhideAndAssignUnit above but just has null as the scriptId
  const assignCourseWithoutUnit = section => {
    const sectionId = section.id;
    assignToSectionWithConfirmation(
      sectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      null
    );
  };

  const assignToSectionWithConfirmation = (
    sectionId,
    courseId,
    courseOfferingId,
    courseVersionId,
    scriptId
  ) => {
    onAssignSuccess
      ? assignToSection(
          sectionId,
          courseId,
          courseOfferingId,
          courseVersionId,
          scriptId
        ).then(onAssignSuccess)
      : assignToSection(
          sectionId,
          courseId,
          courseOfferingId,
          courseVersionId,
          scriptId
        );
  };

  const isAssignableToSection = sectionParticipantType => {
    return sectionParticipantType === participantAudience;
  };

  return (
    <AccessibleDialog onClose={onClose}>
      <div tabIndex="0" className={moduleStyle.modalHeader}>
        <Heading3>{i18n.chooseSectionsPrompt({assignmentName})}</Heading3>
      </div>
      <div className={moduleStyle.sectionsDirections}>
        <BodyTwoText>{sectionDirections}</BodyTwoText>
      </div>
      <div className={moduleStyle.sectionList}>
        <Heading5>{i18n.yourSectionsList()}</Heading5>
        <div className={moduleStyle.sectionListOptionsContainer}>
          {sections &&
            sections.map(
              section =>
                isAssignableToSection(section.participantType) && (
                  <Checkbox
                    key={section.id}
                    checked={
                      !!currentSectionsAssigned.some(
                        s => s.code === section.code
                      )
                    }
                    onChange={() => handleChangedCheckbox(section)} // this function should update the state of multiple section assigner
                    name={section.id}
                    label={section.name}
                  />
                )
            )}
        </div>
        <Button
          id="select-all-sections"
          text={i18n.selectAll()}
          onClick={selectAllHandler}
          styleAsText
          color={Button.ButtonColor.brandSecondaryDefault}
        />
      </div>

      <div className={moduleStyle.buttonContainer}>
        <Button
          text={i18n.dialogCancel()}
          onClick={onClose}
          color={Button.ButtonColor.neutralDark}
        />
        <Button
          id="confirm-assign"
          text={i18n.confirmAssignment()}
          onClick={reassignSections}
          color={Button.ButtonColor.brandSecondaryDefault}
        />
      </div>
    </AccessibleDialog>
  );
};

MultipleSectionsAssigner.propTypes = {
  courseId: PropTypes.number,
  assignmentName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  courseOfferingId: PropTypes.number,
  courseVersionId: PropTypes.number,
  scriptId: PropTypes.number,
  reassignConfirm: PropTypes.func,
  isAssigningCourse: PropTypes.bool.isRequired,
  isStandAloneUnit: PropTypes.bool,
  participantAudience: PropTypes.string,
  onAssignSuccess: PropTypes.func,
  sectionDirections: PropTypes.string,
  // Redux
  sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
  unassignSection: PropTypes.func.isRequired,
  assignToSection: PropTypes.func.isRequired,
  updateHiddenScript: PropTypes.func.isRequired,
};

export const UnconnectedMultipleSectionsAssigner = MultipleSectionsAssigner;

export default connect(state => ({}), {
  assignToSection,
  updateHiddenScript,
  unassignSection,
})(MultipleSectionsAssigner);
