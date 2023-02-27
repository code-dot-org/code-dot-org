import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import TeacherSectionOption from './TeacherSectionOption';
import {
  assignToSection,
  unassignSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';

class MultipleSectionsAssigner extends Component {
  static propTypes = {
    courseId: PropTypes.number,
    assignmentName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    forceReload: PropTypes.bool,
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
    selectedSectionId: PropTypes.number
  };

  constructor(props) {
    super(props);

    let initialSectionsAssignedToCourseList = [];

    // check to see if this is coming from the UNIT landing page - if so add courses featuring this unit
    if (!this.props.isOnCoursePage) {
      if (this.props.isStandAloneUnit) {
        for (let i = 0; i < this.props.sections.length; i++) {
          if (
            this.props.courseVersionId ===
            this.props.sections[i].courseVersionId
          ) {
            initialSectionsAssignedToCourseList.push(this.props.sections[i]);
          }
        }
      } else {
        for (let i = 0; i < this.props.sections.length; i++) {
          if (this.props.scriptId === this.props.sections[i].unitId) {
            initialSectionsAssignedToCourseList.push(this.props.sections[i]);
          }
        }
      }
    } else if (this.props.isOnCoursePage) {
      // checks to see if this is coming from the COURSE landing page
      for (let i = 0; i < this.props.sections.length; i++) {
        if (this.props.courseId === this.props.sections[i].courseId) {
          initialSectionsAssignedToCourseList.push(this.props.sections[i]);
        }
      }
    }

    this.state = {
      currentSectionsAssigned: initialSectionsAssignedToCourseList,
      initialSectionsAssigned: initialSectionsAssignedToCourseList
    };
  }

  handleChangedCheckbox = currentSection => {
    const isUnchecked = this.state.currentSectionsAssigned.some(
      s => s.code === currentSection.code
    );
    if (isUnchecked) {
      this.setState(state => {
        const newList = state.currentSectionsAssigned.filter(
          s => s.code !== currentSection.code
        );
        return {currentSectionsAssigned: newList};
      });
    } else {
      this.setState(state => {
        const newList = [...state.currentSectionsAssigned];
        newList.push(currentSection);
        return {currentSectionsAssigned: newList};
      });
    }
  };

  reassignSections = () => {
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId,
      assignToSection,
      isOnCoursePage
    } = this.props;
    // Assign any courses that need to be assigned
    for (let i = 0; i < this.state.currentSectionsAssigned.length; i++) {
      const needsToBeAssigned = !this.state.initialSectionsAssigned.some(
        s => s.code === this.state.currentSectionsAssigned[i].code
      );
      if (needsToBeAssigned) {
        if (isOnCoursePage) {
          const sectionId = this.state.currentSectionsAssigned[i].id;
          assignToSection(
            sectionId,
            courseId,
            courseOfferingId,
            courseVersionId,
            scriptId
          );
        } else {
          this.unhideAndAssignUnit(this.state.currentSectionsAssigned[i]);
        }
      }
    }

    // If any sections need to be removed from being assigned, remove them
    for (let i = 0; i < this.state.initialSectionsAssigned.length; i++) {
      const isSectionToBeRemoved = !this.state.currentSectionsAssigned.some(
        s => s.code === this.state.initialSectionsAssigned[i].code
      );

      if (isSectionToBeRemoved) {
        // if on COURSE landing page or a STANDALONE UNIT, unassign entirely
        isOnCoursePage || this.props.isStandAloneUnit
          ? this.props.unassignSection(
              this.state.initialSectionsAssigned[i].id,
              ''
            )
          : this.assignCourseWithoutUnit(this.state.initialSectionsAssigned[i]);
      }
    }
    // close dialogue
    this.props.reassignConfirm();
    this.props.onClose();
  };

  unhideAndAssignUnit = section => {
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId,
      assignToSection,
      updateHiddenScript
    } = this.props;
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
  assignCourseWithoutUnit = section => {
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      assignToSection
    } = this.props;
    const sectionId = section.id;
    assignToSection(
      sectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      null
    );
  };

  isAssignableToSection = sectionParticipantType => {
    return sectionParticipantType === this.props.participantAudience;
  };

  selectAllHandler = () => {
    for (let i = 0; i < this.props.sections.length; i++) {
      // if the section is NOT in currentSections assigned, assign it
      const isSectionToBeAssigned = !this.state.currentSectionsAssigned.some(
        s => s.code === this.props.sections[i].code
      );
      if (isSectionToBeAssigned) {
        this.setState(state => {
          const newList = [...state.currentSectionsAssigned];
          newList.push(this.props.sections[i]);
          return {currentSectionsAssigned: newList};
        });
      }
    }
  };

  render() {
    const {sections, assignmentName, onClose} = this.props;

    return (
      <BaseDialog isOpen={true} handleClose={onClose}>
        <div style={styles.header} className="uitest-confirm-assignment-dialog">
          {i18n.chooseSectionsPrompt({assignmentName})}
        </div>
        <div style={styles.content}>{i18n.chooseSectionsDirections()}</div>
        <div style={styles.header} className="uitest-confirm-assignment-dialog">
          {i18n.yourSectionsList()}
        </div>
        <hr />
        <div style={styles.grid}>
          {sections &&
            sections.map(
              section =>
                this.isAssignableToSection(section.participantType) && (
                  <TeacherSectionOption
                    key={section.id}
                    section={section}
                    isChecked={
                      !!this.state.currentSectionsAssigned.some(
                        s => s.code === section.code
                      )
                    }
                    assignedSections={this.state.currentSectionsAssigned}
                    onChange={() => this.handleChangedCheckbox(section)} // this fucntion should update the state of multiple secion assigner
                    editedValue={section.isAssigned}
                  />
                )
            )}
        </div>
        <a
          style={styles.selectAllSectionsLabel}
          onClick={this.selectAllHandler}
          className="select-all-sections"
        >
          Select All
        </a>
        <div style={{textAlign: 'right'}}>
          <Button
            __useDeprecatedTag
            text={i18n.dialogCancel()}
            onClick={onClose}
            color={Button.ButtonColor.gray}
          />
          <Button
            __useDeprecatedTag
            id="confirm-assign"
            text={i18n.confirmAssignment()}
            style={{marginLeft: 5}}
            onClick={this.reassignSections}
            color={Button.ButtonColor.orange}
          />
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  header: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold'
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
    borderColor: color.lighter_gray
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '33% 33% 34%'
  },
  functionSelector: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 10px 10px 0'
  },
  largerCheckbox: {
    width: 20,
    height: 20
  },
  selectAllFunctionsLabel: {
    margin: 0,
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  selectAllSectionsLabel: {
    fontFamily: "'Gotham 5r', sans-serif",
    fontSize: 16,
    cursor: 'pointer',
    color: color.link_color,
    ':hover': {
      color: color.link_color
    }
  }
};

export const UnconnectedMultipleSectionsAssigner = MultipleSectionsAssigner;

export default connect(
  state => ({}),
  {
    assignToSection,
    updateHiddenScript,
    unassignSection
  }
)(MultipleSectionsAssigner);
