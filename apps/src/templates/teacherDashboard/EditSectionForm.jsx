import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {Heading1, h3Style} from "../../lib/ui/Headings";
import * as styleConstants from '@cdo/apps/styleConstants';
import Button from '../Button';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { sectionShape, assignmentShape, assignmentGroupShape } from './shapes';
import DialogFooter from './DialogFooter';
import i18n from '@cdo/locale';
import {
  editSectionProperties,
  finishEditingSection,
  cancelEditingSection,
  isCsfScript,
} from './teacherSectionsRedux';

const style = {
  root: {
    width: styleConstants['content-width'],
  },
  dropdown: {
    padding: '0.3em',
  },
  sectionNameInput: {
    // Full-width, large happy text, lots of space.
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 'large',
    padding: '0.5em',
  },
  scroll: {
    maxHeight: '58vh',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
};

/**
 * UI for editing section details: Name, grade, assigned course, etc.
 */
class EditSectionForm extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,

    //Comes from redux
    validGrades: PropTypes.arrayOf(PropTypes.string).isRequired,
    validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    assignmentGroups: PropTypes.arrayOf(assignmentGroupShape).isRequired,
    sections: PropTypes.objectOf(sectionShape).isRequired,
    section: sectionShape.isRequired,
    editSectionProperties: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    isSaveInProgress: PropTypes.bool.isRequired,
    isCsfScript: PropTypes.func.isRequired,
  };

  onSaveClick = () => {
    this.props.handleSave().catch(status => {
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  render() {
    const {
      section,
      title,
      validGrades,
      validAssignments,
      primaryAssignmentIds,
      assignmentGroups,
      isSaveInProgress,
      editSectionProperties,
      handleClose,
      isCsfScript,
    } = this.props;
    if (!section) {
      return null;
    }
    return (
      <div style={style.root}>
        <Heading1>
          {title}
        </Heading1>
        <div style={style.scroll}>
          <SectionNameField
            value={section.name}
            onChange={name => editSectionProperties({name})}
            disabled={isSaveInProgress}
          />
          <GradeField
            value={section.grade || ''}
            onChange={grade => editSectionProperties({grade})}
            validGrades={validGrades}
            disabled={isSaveInProgress}
          />
          <AssignmentField
            section={section}
            onChange={ids => editSectionProperties(ids)}
            validAssignments={validAssignments}
            primaryAssignmentIds={primaryAssignmentIds}
            assignmentGroups={assignmentGroups}
            disabled={isSaveInProgress}
          />
          {isCsfScript(section.scriptId) &&
            <LessonExtrasField
              value={section.stageExtras}
              onChange={stageExtras => editSectionProperties({stageExtras})}
              disabled={isSaveInProgress}
            />
          }
          <PairProgrammingField
            value={section.pairingAllowed}
            onChange={pairingAllowed => editSectionProperties({pairingAllowed})}
            disabled={isSaveInProgress}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleClose}
            text={i18n.dialogCancel()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
            disabled={isSaveInProgress}
          />
          <Button
            className="uitest-saveButton"
            onClick={this.onSaveClick}
            text={i18n.save()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.orange}
            disabled={isSaveInProgress}
          />
        </DialogFooter>
      </div>
    );
  }
}

export const UnconnectedEditSectionForm = EditSectionForm;

export default connect(state => ({
  validGrades: state.teacherSections.validGrades,
  validAssignments: state.teacherSections.validAssignments,
  primaryAssignmentIds: state.teacherSections.primaryAssignmentIds,
  assignmentGroups: state.teacherSections.assignmentGroups,
  sections: state.teacherSections.sections,
  section: state.teacherSections.sectionBeingEdited,
  isSaveInProgress: state.teacherSections.saveInProgress,
  isCsfScript: id => isCsfScript(state, id),
}), {
  editSectionProperties,
  handleSave: finishEditingSection,
  handleClose: cancelEditingSection,
})(EditSectionForm);

const FieldProps = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const SectionNameField = ({value, onChange, disabled}) => (
  <div>
    <FieldName>
      {i18n.sectionName()}
    </FieldName>
    <FieldDescription>
      {i18n.addSectionName()}
    </FieldDescription>
    <input
      value={value}
      placeholder={i18n.addSectionNameHint()}
      onChange={event => onChange(event.target.value)}
      style={style.sectionNameInput}
      disabled={disabled}
    />
  </div>
);
SectionNameField.propTypes = FieldProps;

const GradeField = ({value, onChange, validGrades, disabled}) => {
  const gradeOptions = [""]
    .concat(validGrades)
    .map(grade => ({
      value: grade,
      text: grade === 'Other' ? 'Other/Mixed' : grade,
    }));
  return (
    <div>
      <FieldName>
        {i18n.grade()}
      </FieldName>
      <Dropdown
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={disabled}
      >
        {gradeOptions.map((grade, index) => (
          <option key={index} value={grade.value}>{grade.text}</option>
        ))}
      </Dropdown>
    </div>
  );
};
GradeField.propTypes = {
  ...FieldProps,
  validGrades: PropTypes.arrayOf(PropTypes.string).isRequired
};

const AssignmentField = ({
  section,
  onChange,
  validAssignments,
  primaryAssignmentIds,
  assignmentGroups,
  disabled,
}) => (
  <div>
    <FieldName>
      {i18n.course()}
    </FieldName>
    <FieldDescription>
      {i18n.whichCourse()}
    </FieldDescription>
    <AssignmentSelector
      section={section}
      onChange={ids => onChange(ids)}
      primaryAssignmentIds={primaryAssignmentIds}
      assignments={validAssignments}
      assignmentGroups={assignmentGroups}
      chooseLaterOption={true}
      dropdownStyle={style.dropdown}
      disabled={disabled}
    />
  </div>
);
AssignmentField.propTypes = {
  section: sectionShape,
  onChange: PropTypes.func.isRequired,
  validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
  primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  assignmentGroups: PropTypes.arrayOf(assignmentGroupShape).isRequired,
  disabled: PropTypes.bool,
};

const LessonExtrasField = ({value, onChange, disabled}) => (
  <div>
    <FieldName>
      {i18n.enableLessonExtras()}
    </FieldName>
    <FieldDescription>
      {i18n.explainLessonExtras()}
      {' '}
      <a
        href="https://support.code.org/hc/en-us/articles/228116568-In-the-teacher-dashboard-what-are-stage-extras-"
        target="_blank"
      >
        {i18n.explainLessonExtrasLearnMore()}
      </a>
    </FieldDescription>
    <YesNoDropdown
      value={value}
      onChange={stageExtras => onChange(stageExtras)}
      disabled={disabled}
    />
  </div>
);
LessonExtrasField.propTypes = FieldProps;

const PairProgrammingField = ({value, onChange, disabled}) => (
  <div>
    <FieldName>
      {i18n.enablePairProgramming()}
    </FieldName>
    <FieldDescription>
      {i18n.explainPairProgramming()}
      {' '}
      <a
        href="https://support.code.org/hc/en-us/articles/115002122788-How-does-pair-programming-within-Code-Studio-work-"
        target="_blank"
      >
        {i18n.explainPairProgrammingLearnMore()}
      </a>
    </FieldDescription>
    <YesNoDropdown
      value={value}
      onChange={pairingAllowed => onChange(pairingAllowed)}
      disabled={disabled}
    />
  </div>
);
PairProgrammingField.propTypes = FieldProps;

const FieldName = props => (
  <div
    style={{
      ...h3Style,
      marginTop: 20,
      marginBottom: 0,
    }}
    {...props}
  />
);

const FieldDescription = props => (
  <div
    style={{
      marginBottom: 5,
    }}
    {...props}
  />
);

const Dropdown = props => (
  <select style={style.dropdown} {...props}/>
);

const YesNoDropdown = ({value, onChange, disabled}) => (
  <Dropdown
    value={value ? 'yes' : 'no'}
    onChange={event => onChange('yes' === event.target.value)}
    disabled={disabled}
  >
    <option value="yes">{i18n.yes()}</option>
    <option value="no">{i18n.no()}</option>
  </Dropdown>
);
YesNoDropdown.propTypes = FieldProps;
