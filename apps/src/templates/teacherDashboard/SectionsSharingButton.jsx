import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Button from '../Button';
import ChangeShareSettingDialog from './ChangeShareSettingDialog';
import {sectionShape} from './shapes';

class SectionsSharingButton extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    onSharingChanged: PropTypes.func,
    // Provided by Redux
    section: sectionShape,
  };

  state = {
    isDialogOpen: false,
  };

  openDialog = () => this.setState({isDialogOpen: true});
  closeDialog = () => this.setState({isDialogOpen: false});
  onSharingChanged = () => {
    this.closeDialog();
    const callback = this.props.onSharingChanged;
    if (typeof callback === 'function') {
      callback();
    }
  };

  render() {
    const {section} = this.props;
    if (!section) {
      // Render nothing for not-yet-loaded section information
      return null;
    }

    return (
      <div style={{paddingTop: 20}}>
        <Paragraph sharingDisabled={section.sharingDisabled}/>
        <Button
          onClick={this.openDialog}
          text={getButtonText(section.sharingDisabled)}
          color={Button.ButtonColor.white}
        />
        <ChangeShareSettingDialog
          isOpen={this.state.isDialogOpen}
          handleClose={this.closeDialog}
          onSharingChanged={this.onSharingChanged}
          sectionId={this.props.sectionId}
          disableSharing={!section.sharingDisabled}
        />
      </div>
    );
  }
}

export const UnconnectedSectionsSharingButton = SectionsSharingButton;
export default connect((state, props) => ({
  section: state.teacherSections.sections[props.sectionId],
}))(SectionsSharingButton);

function Paragraph({sharingDisabled}) {
  return (
    <div>
      {sharingDisabled &&
        <p>Sharing projects created through Code.org’s advanced programming tools (App Lab, Game Lab, and Web Lab) is currently disabled for all of your students. If you would like to re-enable sharing, please click on the “Enable sharing advanced projects for all students button below.</p>
      }
      {!sharingDisabled &&
        <p>If you need to block your students from sharing projects created through Code.org’s advanced tools (such as App Lab, Game Lab, and Web Lab) that allow students to write free-form text, upload their own images and sounds, etc., you can do so by clicking on the “Disable sharing advanced projects for all students” button below.</p>
      }
    </div>
  );
}
Paragraph.propTypes = {
  sharingDisabled: PropTypes.bool,
};

function getButtonText(sharingDisabled) {
  return sharingDisabled ? 'Enable sharing projects for all students' : 'Disable sharing projects for all students';
}
