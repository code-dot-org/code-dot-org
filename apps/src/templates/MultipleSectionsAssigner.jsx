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

  chooseMenuItem = section => {
    console.log(section + 'was clicked');
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
        <div>
          {sections &&
            sections.map(section => (
              <TeacherSectionOption
                section={section}
                onClick={() => this.chooseMenuItem(section)}
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
  }
};

// Export unconnected dialog for unit testing - KT note, don't know why I need this...
export const UnconnectedMultipleSectionsAssigner = MultipleSectionsAssigner;

export default connect(state => ({
  // add code here
}))(MultipleSectionsAssigner);
