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
  testingFunction,
  unassignSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';
// import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

/**
 * Confirmation dialog for when assigning a script or course from the course or script overview page
 */
class MultipleSectionsAssigner extends Component {
  static propTypes = {
    courseId: PropTypes.number,
    assignmentName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    forceReload: PropTypes.bool,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    scriptId: PropTypes.number,
    // Redux
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    unassignSection: PropTypes.func.isRequired,
    assignToSection: PropTypes.func.isRequired,
    updateHiddenScript: PropTypes.func.isRequired,
    testingFunction: PropTypes.func.isRequired,

    // Redux and from Section Assigner
    // selectSection: PropTypes.func.isRequired,
    selectedSectionId: PropTypes.number
  };

  constructor(props) {
    super(props);

    let initialSectionsAssignedToCourseList = [];

    for (let i = 0; i < this.props.sections.length; i++) {
      if (this.props.sections[i].isAssigned) {
        initialSectionsAssignedToCourseList.push(this.props.sections[i]);
      }
    }

    console.log(
      'initialSectionsAssignedToCourseList is ' +
        initialSectionsAssignedToCourseList
    );

    this.state = {
      currentSectionsAssigned: initialSectionsAssignedToCourseList,
      initialSectionsAssigned: initialSectionsAssignedToCourseList // I am wondering if this should be passed in through props bc it never changes.
    };
  }

  // create a state of the list of all the sections currently assigned the course.
  // pass this as a prop to the Teacher Section Option

  chooseMenuItem = section => {
    console.log(section + 'was clicked');
  };

  //currentSection, currentCheckedStatus - old params
  handleChangedCheckbox = currentSection => {
    console.log('The checkbox was toggled');
    // // if it is checked, then add it to the list.
    if (this.state.currentSectionsAssigned.includes(currentSection)) {
      // Remove it from the list
      this.setState(state => {
        let newList = state.currentSectionsAssigned.filter(
          s => s !== currentSection
        );
        return {currentSectionsAssigned: newList};
      });
    } else {
      this.setState(state => {
        let newList = [...state.currentSectionsAssigned];
        newList.push(currentSection);
        return {currentSectionsAssigned: newList};
      });
    }
  };

  reassignSections = () => {
    // This will assign any courses that need to be assigned
    for (let i = 0; i < this.state.currentSectionsAssigned.length; i++) {
      if (
        !this.state.initialSectionsAssigned.includes(
          this.state.currentSectionsAssigned[i]
        )
      ) {
        console.log(
          this.state.currentSectionsAssigned[i].name + ' should be assigned'
        );
        this.unhideAndAssign(this.state.currentSectionsAssigned[i]);
      }
    }

    // Checks to see if any sections need to be removed from being assigned.
    for (let i = 0; i < this.state.initialSectionsAssigned.length; i++) {
      console.log(this.state.initialSectionsAssigned[i]);
      console.log(this.state.currentSectionsAssigned);
      if (
        !this.state.currentSectionsAssigned.includes(
          this.state.initialSectionsAssigned[i]
        )
      ) {
        this.props.unassignSection(
          this.state.initialSectionsAssigned[i].id,
          ''
        );
        console.log(
          'This section needs to be removed from this course ' +
            this.state.initialSectionsAssigned[i].name
        );
      }
    }
    // close dialogue
    this.props.onClose();
  };

  unhideAndAssign = section => {
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId,
      assignToSection,
      updateHiddenScript,
      testingFunction
    } = this.props;
    const sectionId = section.id;
    console.log('Trying to assign the section with id ' + sectionId);
    updateHiddenScript(sectionId, scriptId, false);
    assignToSection(
      sectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId
    );
    testingFunction(
      sectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId
    );
  };

  selectAllHandler = () => {
    for (let i = 0; i < this.props.sections.length; i++) {
      // if the section is NOT in currentSections assigned, assign it
      if (
        !this.state.currentSectionsAssigned.includes(
          s => s.code === this.props.sections[i].code
        )
      ) {
        this.setState(state => {
          let newList = [...state.currentSectionsAssigned];
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
            sections.map(section => (
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
            ))}
        </div>
        <a
          style={styles.selectAllSectionsLabel}
          onClick={this.selectAllHandler}
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

// Export unconnected dialog for unit testing - KT note, don't know why I need this...
export const UnconnectedMultipleSectionsAssigner = MultipleSectionsAssigner;

export default connect(
  state => ({
    // add code here
  }),
  {
    assignToSection,
    updateHiddenScript,
    testingFunction,
    unassignSection
  }
)(MultipleSectionsAssigner);
