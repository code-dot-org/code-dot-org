import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import FocusTrap from 'focus-trap-react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import TeacherSectionOption from './TeacherSectionOption';
import {
  assignToSection,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';

const MultipleSectionsAssigner = ({
  courseId,
  assignmentName,
  onClose,
  courseOfferingId,
  courseVersionId,
  scriptId,
  reassignConfirm,
  isOnCoursePage,
  isStandAloneUnit,
  participantAudience,
  // Redux
  sections,
  unassignSection,
  assignToSection,
  updateHiddenScript,
}) => {
  let initialSectionsAssigned = [];

  // check to see if this is coming from the UNIT landing page - if so add courses featuring this unit
  if (!isOnCoursePage) {
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
  } else if (isOnCoursePage) {
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
        if (isOnCoursePage) {
          const sectionId = currentSectionsAssigned[i].id;
          assignToSection(
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
        isOnCoursePage || isStandAloneUnit
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
    assignToSection(
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
    assignToSection(
      sectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      null
    );
  };

  const isAssignableToSection = sectionParticipantType => {
    return sectionParticipantType === participantAudience;
  };

  return (
    <>
      <div style={styles.modalBackdrop} />
      <FocusTrap>
        <div style={styles.modal}>
          <div
            style={styles.header}
            className="uitest-confirm-assignment-dialog"
          >
            {i18n.chooseSectionsPrompt({assignmentName})}
          </div>
          <div style={styles.content}>{i18n.chooseSectionsDirections()}</div>
          <div
            style={styles.header}
            className="uitest-confirm-assignment-dialog"
          >
            {i18n.yourSectionsList()}
          </div>
          <hr />
          <div style={styles.grid}>
            {sections &&
              sections.map(
                section =>
                  isAssignableToSection(section.participantType) && (
                    <TeacherSectionOption
                      key={section.id}
                      section={section}
                      isChecked={
                        !!currentSectionsAssigned.some(
                          s => s.code === section.code
                        )
                      }
                      assignedSections={currentSectionsAssigned}
                      onChange={() => handleChangedCheckbox(section)} // this function should update the state of multiple section assigner
                      editedValue={section.isAssigned}
                    />
                  )
              )}
          </div>
          <a
            style={styles.selectAllSectionsLabel}
            onClick={selectAllHandler}
            className="select-all-sections"
          >
            Select All
          </a>
          <div style={{textAlign: 'right'}}>
            <Button
              text={i18n.dialogCancel()}
              onClick={onClose}
              color={Button.ButtonColor.gray}
            />
            <Button
              id="confirm-assign"
              text={i18n.confirmAssignment()}
              style={{marginLeft: 5}}
              onClick={reassignSections}
              color={Button.ButtonColor.orange}
            />
          </div>
        </div>
      </FocusTrap>
    </>
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
  isOnCoursePage: PropTypes.bool,
  isStandAloneUnit: PropTypes.bool,
  participantAudience: PropTypes.string,
  // Redux
  sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
  unassignSection: PropTypes.func.isRequired,
  assignToSection: PropTypes.func.isRequired,
  updateHiddenScript: PropTypes.func.isRequired,
};

const styles = {
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000',
    opacity: 0.6,
    zIndex: 1000,
  },
  modal: {
    position: 'fixed',
    top: '10%',
    left: '50%',
    zIndex: 1050,
    width: 560,
    marginLeft: -280,
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.3)',
    overflow: 'visible',
    padding: 15,
  },
  header: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '33% 33% 34%',
  },
  functionSelector: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 10px 10px 0',
  },
  largerCheckbox: {
    width: 20,
    height: 20,
  },
  selectAllFunctionsLabel: {
    margin: 0,
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  selectAllSectionsLabel: {
    fontFamily: "'Gotham 5r', sans-serif",
    fontSize: 16,
    cursor: 'pointer',
    color: color.link_color,
    ':hover': {
      color: color.link_color,
    },
  },
};

export const UnconnectedMultipleSectionsAssigner = MultipleSectionsAssigner;

export default connect(state => ({}), {
  assignToSection,
  updateHiddenScript,
  unassignSection,
})(MultipleSectionsAssigner);
