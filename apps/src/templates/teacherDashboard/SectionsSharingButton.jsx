import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Button from '../Button';
import ChangeShareSettingDialog from './ChangeShareSettingDialog';
import {sectionShape} from './shapes';
import i18n from "@cdo/locale";

class SectionsSharingButton extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    // Provided by Redux
    section: sectionShape,
    students: PropTypes.array
  };

  state = {
    isDialogOpen: false,
  };

  openDialog = () => this.setState({isDialogOpen: true});
  closeDialog = () => this.setState({isDialogOpen: false});

  render() {
    const {section, students} = this.props;
    if (!section || !students) {
      // Render nothing for not-yet-loaded section information
      return null;
    }

    // Show the enable button if all students have sharing disabled
    // Otherwise show the disable button
    const showEnabledButton = !students.some(student => !student.sharingDisabled);

    return (
      <div style={{paddingTop: 20}}>
        <div>
          <p>
            {showEnabledButton &&
              i18n.shareSettingEnableButtonDescription()
            }
            {!showEnabledButton &&
              i18n.shareSettingDisableButtonDescription()
            }
            {" "}
            <a href="https://support.code.org/hc/en-us/articles/115001554911">{i18n.shareSettingSupportArticle()}</a>
          </p>
        </div>
        <Button
          onClick={this.openDialog}
          text={getButtonText(showEnabledButton)}
          color={Button.ButtonColor.white}
        />
        <ChangeShareSettingDialog
          isOpen={this.state.isDialogOpen}
          handleClose={this.closeDialog}
          onSharingChanged={this.closeDialog}
          sectionId={this.props.sectionId}
          disableSharing={!showEnabledButton}
        />
      </div>
    );
  }
}

export default connect((state, props) => ({
  section: state.teacherSections.sections[props.sectionId],
  students: state.teacherSections.selectedStudents
}))(SectionsSharingButton);

function getButtonText(sharingDisabled) {
  return sharingDisabled ? i18n.shareSettingEnableButton() : i18n.shareSettingDisableButton();
}
