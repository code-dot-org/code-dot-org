import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import TeacherSectionOption from './TeacherSectionOption';
// import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

/**
 * Confirmation dialog for when assigning a script or course from the course or script overview page
 */
class MultipleSectionsAssigner extends Component {
  static propTypes = {
    assignmentName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    forceReload: PropTypes.bool,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    scriptId: PropTypes.number,
    // Redux
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,

    // Redux and from Section Assigner
    // selectSection: PropTypes.func.isRequired,
    selectedSectionId: PropTypes.number
  };

  constructor(props) {
    super(props);

    let currentSectionsAssignedToCourseList = [];

    for (let i = 0; i < this.props.sections.length; i++) {
      if (this.props.sections[i].isAssigned()) {
        currentSectionsAssignedToCourseList.push(this.props.sections[i]);
      }
    }

    this.state = {
      currentSectionsAssigned: currentSectionsAssignedToCourseList
    };
  }

  // create a state of the list of all the sections currently assigned the course.
  // pass this as a prop to the Teacher Section Option

  chooseMenuItem = section => {
    console.log(section + 'was clicked');
  };

  boxChecked = () => {
    console.log('box clicked...');
  };

  // Modeled after displayFunctions in LibraryPublisher
  displaySections = () => {
    // const {selectedFunctions} = this.state;
    const {sections} = this.props;
    return sections.map(section => {
      // const {functionName, comment} = sourceFunction;
      const checked = section.isAssigned || false;
      // const functionId = _.uniqueId(`${functionName}-`);

      return (
        <div>
          <div style={styles.functionSelector}>
            <input
              style={styles.largerCheckbox}
              type="checkbox"
              name={section.name}
              checked={checked}
              onChange={this.boxChecked}
            />
            <label style={styles.functionLabel}>{section.name}</label>
          </div>
        </div>
      );
    });
  };

  render() {
    const {
      sections,
      assignmentName,
      onClose,
      onConfirm
      //   forceReload,
      //   courseOfferingId,
      //   courseVersionId,
      //   scriptId,
      //   selectedSectionId
    } = this.props;
    //const selectedSection = sections.find(
    //  section => section.id === selectedSectionId
    //);

    return (
      <BaseDialog isOpen={true} handleClose={onClose}>
        <div style={styles.header} className="uitest-confirm-assignment-dialog">
          {i18n.chooseSectionsPrompt({assignmentName})}
        </div>
        <div style={styles.content}>{i18n.chooseSectionsDirections()}</div>
        <div style={styles.header} className="uitest-confirm-assignment-dialog">
          {i18n.yourSectionsList()}
        </div>
        <div style={styles.grid}>{this.displaySections()}</div>
        <hr />
        <div style={styles.grid}>
          {sections &&
            sections.map(section => (
              <TeacherSectionOption
                section={section}
                assignedSections={this.state.currentSectionsAssigned}
                onClick={() => this.chooseMenuItem(section)} // this fucntion should update the state of multiple secion assigner
                editedValue={section.isAssigned}
              />
            ))}
        </div>
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
            onClick={onConfirm}
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
  }
};

// Export unconnected dialog for unit testing - KT note, don't know why I need this...
export const UnconnectedMultipleSectionsAssigner = MultipleSectionsAssigner;

export default connect(state => ({
  // add code here
}))(MultipleSectionsAssigner);
