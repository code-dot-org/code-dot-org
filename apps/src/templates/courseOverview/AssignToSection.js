import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import $ from 'jquery';
import queryString from 'query-string';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ConfirmAssignment from './ConfirmAssignment';
import { isScriptHiddenForSection, updateHiddenScript } from '@cdo/apps/code-studio/hiddenStageRedux';

const styles = {
  main: {
    display: 'inline-block',
  }
};

/**
 * A dropdown component that shows a list of sections for the current user, and
 * lets them assign the current course to any of those sections (after accepting
 * a confirmation dialog)
 */
class AssignToSection extends Component {
  static propTypes = {
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    assignmentName: PropTypes.string.isRequired,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    hiddenStageState: PropTypes.object,
    updateHiddenScript: PropTypes.func.isRequired,
  };

  state = {
    sectionIndexToAssign: null,
    errorString: null
  };

  onClickCourse = event => {
    const sectionIndex = event.target.getAttribute('data-section-index');
    this.setState({
      sectionIndexToAssign: sectionIndex
    });
  };

  onCloseDialog = event => {
    this.setState({sectionIndexToAssign: null});
  };

  updateCourse = () => {
    const { sectionsInfo, updateHiddenScript, scriptId } = this.props;
    const section = sectionsInfo[this.state.sectionIndexToAssign];
    $.ajax({
      url: `/dashboardapi/sections/${section.id}`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({
        course_id: this.props.courseId,
        script_id: this.props.scriptId,
      }),
    }).done(result => {
      updateHiddenScript(section.id, scriptId, false);
      this.setState({
        sectionIndexToAssign: null
      });
    }).fail((jqXhr, status) => {
      this.collapseDropdown();
      this.setState({
        sectionIndexToAssign: null,
        errorString: i18n.unexpectedError()
      });
    });
  };

  acknowledgeError = () => {
    this.setState({errorString: null});
  };

  render() {
    const { courseId, scriptId, assignmentName, sectionsInfo, hiddenStageState } = this.props;
    const { sectionIndexToAssign, errorString } = this.state;
    const section = sectionsInfo[sectionIndexToAssign];
    const queryParams = queryString.stringify({courseId, scriptId});
    const isHiddenFromSection = section && hiddenStageState &&
      isScriptHiddenForSection(hiddenStageState, section.id, scriptId);

    return (
      <div style={styles.main}>
        <DropdownButton
          text={(courseId && scriptId) ? i18n.assignUnit() : i18n.assignCourse()}
          color={Button.ButtonColor.orange}
        >
          {[].concat(
            <a
              key={-1}
              href={`/home?${queryParams}`}
            >
              {i18n.newSectionEllipsis()}
            </a>
          ).concat(sectionsInfo.map((section, index) => (
            <a
              key={index}
              data-section-index={index}
              onClick={this.onClickCourse}
            >
              {section.name}
            </a>
          )))}
        </DropdownButton>
        {sectionIndexToAssign !== null && (
          <ConfirmAssignment
            sectionName={section.name}
            assignmentName={assignmentName}
            onClose={this.onCloseDialog}
            onConfirm={this.updateCourse}
            isHiddenFromSection={isHiddenFromSection}
          />
        )}
        {errorString && (
          <BaseDialog
            isOpen={true}
            handleClose={this.acknowledgeError}
          >
            {errorString}
          </BaseDialog>
        )}
      </div>
    );
  }
}

export const UnconnectedAssignToSection = Radium(AssignToSection);

export default connect(state => ({
  hiddenStageState: state.hiddenStage,
}), ({
  updateHiddenScript,
}))(UnconnectedAssignToSection);
