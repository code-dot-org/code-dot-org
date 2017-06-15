import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import color from "@cdo/apps/util/color";
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import { sectionShape, assignmentShape } from './shapes';
import AssignmentSelector from './AssignmentSelector';
import { assignments, currentAssignmentIndex, updateSection } from './teacherSectionsRedux';

const styles = {
  sectionName: {
    fontSize: 18,
    paddingTop: 12
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  td: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderColor: color.light_gray,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 15
  },
  rightButton: {
    marginLeft: 5
  }
};

// TODO: i18n
/**
 * Our base buttons (Edit and delete).
 */
export const EditOrDelete = ({canDelete, onEdit, onDelete}) => (
  <div style={styles.nowrap}>
    <ProgressButton
      text={"Edit"}
      onClick={onEdit}
      color={ProgressButton.ButtonColor.gray}
    />
    {canDelete && (
      <ProgressButton
        style={{marginLeft: 5}}
        text={"Delete"}
        onClick={onDelete}
        color={ProgressButton.ButtonColor.red}
      />
    )}
  </div>
);
EditOrDelete.propTypes = {
  canDelete: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/**
 * Buttons for confirming whether or not we want to delete a section
 */
export const ConfirmDelete = ({onClickYes, onClickNo}) => (
  <div style={styles.nowrap}>
    <div>Delete?</div>
    <ProgressButton
      text={i18n.yes()}
      onClick={onClickYes}
      color={ProgressButton.ButtonColor.red}
    />
    <ProgressButton
      text={i18n.no()}
      style={styles.rightButton}
      onClick={onClickNo}
      color={ProgressButton.ButtonColor.gray}
    />
  </div>
);
ConfirmDelete.propTypes = {
  onClickYes: PropTypes.func.isRequired,
  onClickNo: PropTypes.func.isRequired,
};

/**
 * Buttons for committing or canceling a save.
 */
export const ConfirmSave = ({onClickSave, onCancel}) => (
  <div style={styles.nowrap}>
    <ProgressButton
      text={i18n.save()}
      onClick={onClickSave}
      color={ProgressButton.ButtonColor.blue}
    />
    <ProgressButton
      text={i18n.dialogCancel()}
      style={styles.rightButton}
      onClick={onCancel}
      color={ProgressButton.ButtonColor.gray}
    />
  </div>
);
ConfirmSave.propTypes = {
  onClickSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

/**
 * A component for displaying and editing information about a particular section
 * in the teacher dashboard.
 */
class SectionRow extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,

    // redux provided
    validLoginTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    validGrades: PropTypes.arrayOf(PropTypes.string).isRequired,
    validAssignments: PropTypes.arrayOf(assignmentShape).isRequired,
    currentAssignmentIndex: PropTypes.number,
    section: sectionShape.isRequired,
    updateSection: PropTypes.func.isRequired,
  };

  state = {
    editing: false,
    deleting: false
  };

  onClickDelete = () => this.setState({deleting: true});

  onClickDeleteNo = () => this.setState({deleting: false});

  onClickDeleteYes = () => console.log('this is where our delete will happen');

  onClickEdit = () => this.setState({editing: true});

  onClickEditSave = () => {
    const { sectionId, updateSection } = this.props;
    const assignment = this.assignment.getSelectedAssignment();
    const data = {
      id: sectionId,
      name: this.name.value,
      login_type: this.loginType.value,
      grade: this.grade.value,
      stage_extras: this.stageExtras.checked,
      pairing_allowed: this.pairingAllowed.checked,
      course_id: assignment.courseId,
    };

    // Due in part to it's angular history, this API expects {script: { id }}
    // instead of script_id
    if (assignment.scriptId) {
      data.script = {
        id: assignment.scriptId
      };
    }

    $.ajax({
      url: `/v2/sections/${sectionId}/update`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data),
    }).done(result => {
      updateSection(sectionId, result);
      this.setState({
        editing: false
      });
    }).fail((jqXhr, status) => {
      // TODO(bjvanminnen): figure out how what we want to do in this case
      console.error(status);
    });
  }

  onClickEditCancel = () => this.setState({editing: false});

  onClickPrintCerts = () => console.log('print certificates here');

  render() {
    const {
      section,
      validLoginTypes,
      validGrades,
      validAssignments,
      currentAssignmentIndex
    } = this.props;
    const { editing, deleting } = this.state;

    return (
      <tr>
        <td style={styles.td}>
          {!editing && (
            <span style={styles.sectionName}>
              <a href={`#/sections/${section.id}/`}>
                {section.name}
              </a>
            </span>
          )}
          {editing && (
            <input
              ref={element => this.name = element}
              placeholder="Section Name"
              defaultValue={section.name}
            />
          )}
        </td>
        <td style={styles.td}>
          {!editing && section.loginType}
          {editing && (
            <select
              defaultValue={section.loginType}
              ref={element => this.loginType = element}
            >
              {validLoginTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          )}
        </td>
        <td style={styles.td}>
          {!editing && section.grade}
          {editing && (
            <select
              defaultValue={section.grade}
              ref={element => this.grade = element}
            >
              {[""].concat(validGrades).map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          )}
        </td>
        <td style={styles.td}>
          {!editing && section.assignmentName &&
            <a href={section.assignmentPath}>
              {section.assignmentName}
            </a>
          }
          {editing && (
            <AssignmentSelector
              ref={element => this.assignment = element}
              currentAssignmentIndex={currentAssignmentIndex}
              assignments={validAssignments}
            />
          )}
        </td>
        <td style={styles.td}>
          {!editing && (section.stageExtras ? i18n.yes() : i18n.no())}
          {editing && (
            <input
              ref={element => this.stageExtras = element}
              type="checkbox"
              defaultChecked={section.stageExtras}
            />
          )}
        </td>
        <td style={styles.td}>
          {!editing && (section.pairingAllowed ? i18n.yes() : i18n.no())}
          {editing && (
            <input
              ref={element => this.pairingAllowed = element}
              type="checkbox"
              defaultChecked={section.pairingAllowed}
            />
          )}
        </td>
        <td style={styles.td}>
          <a href={`#/sections/${section.id}/manage`}>
            {section.numStudents}
          </a>
        </td>
        <td style={styles.td}>
          {section.code}
        </td>
        <td style={styles.td}>
          {!editing && !deleting && (
            <EditOrDelete
              canDelete={section.numStudents > 0}
              onEdit={this.onClickEdit}
              onDelete={this.onClickDelete}
            />
          )}
          {editing && (
            <ConfirmSave
              onClickSave={this.onClickEditSave}
              onCancel={this.onClickEditCancel}
            />
          )}
          {deleting && (
            <ConfirmDelete
              onClickYes={this.onClickDeleteYes}
              onClickNo={this.onClickDeleteNo}
            />
          )}
          <ProgressButton
            text={"Print Certificates"}
            onClick={this.onClickPrintCerts}
            color={ProgressButton.ButtonColor.gray}
          />
        </td>
      </tr>
    );
  }
}

export const UnconnectedSectionRow = SectionRow;

export default connect((state, ownProps) => ({
  validLoginTypes: state.teacherSections.validLoginTypes,
  validGrades: state.teacherSections.validGrades,
  validAssignments: assignments(state.teacherSections),
  currentAssignmentIndex: currentAssignmentIndex(state.teacherSections, ownProps.sectionId),
  section: state.teacherSections.sections[ownProps.sectionId],
}), { updateSection })(SectionRow);
