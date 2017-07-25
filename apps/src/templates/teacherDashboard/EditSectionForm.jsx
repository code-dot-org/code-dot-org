import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {Heading1, h3Style} from "../../lib/ui/Headings";
import ProgressButton from '../ProgressButton';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { sectionShape, assignmentShape } from './shapes';
import DialogFooter from './DialogFooter';
import i18n from '@cdo/locale';

const style = {
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
  }
};

class EditSectionForm extends Component{

  static propTypes = {
    title: PropTypes.string.isRequired,
    handleSave: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    name: PropTypes.string,
    handleName: PropTypes.func.isRequired,
    grade: PropTypes.string,
    handleGrade: PropTypes.func.isRequired,
    extras: PropTypes.string,
    handleExtras: PropTypes.func.isRequired,
    pairing: PropTypes.string,
    handlePairing: PropTypes.func.isRequired,
    assignmentRef: PropTypes.func.isRequired,

    //Comes from redux
    validGrades: PropTypes.arrayOf(PropTypes.string).isRequired,
    validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    sections: PropTypes.objectOf(sectionShape).isRequired,
  };

  renderSectionNameInput() {
    return (
      <input
        value={this.props.name}
        onChange={val => this.props.handleName(val.target.value)}
        style={style.sectionNameInput}
      />
    );
  }

  renderGradeSelector() {
    const gradeOptions = [""]
      .concat(this.props.validGrades)
      .map(grade => ({
        value: grade,
        text: grade === 'Other' ? 'Other/Mixed' : grade,
      }));
    return (
      <Dropdown
        value = {this.props.grade}
        onChange={event => this.props.handleGrade(event.target.value)}
      >
        {gradeOptions.map((grade, index) => (
          <option key={index} value={grade.value}>{grade.text}</option>
        ))}
      </Dropdown>
    );
  }

  render(){
    return (
      <div style={{width: 970}}>
        <Heading1>
          {this.props.title}
        </Heading1>
        <div>
          <FieldName>
            {i18n.sectionName()}
          </FieldName>
          <div>
            <FieldDescription>{i18n.addSectionName()}</FieldDescription>
            {this.renderSectionNameInput()}
          </div>
          <FieldName>
            {i18n.grade()}
          </FieldName>
          <div>
            {this.renderGradeSelector()}
          </div>
          <FieldName>
            {i18n.course()}
          </FieldName>
          <div>
            <FieldDescription>{i18n.whichCourse()}</FieldDescription>
            <AssignmentSelector
              ref={this.props.assignmentRef}
              primaryAssignmentIds={this.props.primaryAssignmentIds}
              assignments={this.props.validAssignments}
              chooseLaterOption={true}
              dropdownStyle={style.dropdown}
            />
          </div>
          <FieldName>
            {i18n.enableLessonExtras()}
          </FieldName>
          <div>
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
            <Dropdown
              value = {this.props.extras}
              onChange={val => this.props.handleExtras(val.target.value)}
            >
              <option value="yes">{i18n.yes()}</option>
              <option value="no">{i18n.no()}</option>
            </Dropdown>
          </div>
          <FieldName>
            {i18n.enablePairProgramming()}
          </FieldName>
          <div>
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
            <Dropdown
              value = {this.props.pairing}
              onChange={val => this.props.handlePairing(val.target.value)}
            >
              <option value="yes">{i18n.yes()}</option>
              <option value="no">{i18n.no()}</option>
            </Dropdown>
          </div>
        </div>
        <DialogFooter>
          <ProgressButton
            onClick={this.props.handleClose}
            text={i18n.dialogCancel()}
            size={ProgressButton.ButtonSize.large}
            color={ProgressButton.ButtonColor.gray}
          />
          <ProgressButton
            onClick={this.props.handleSave}
            text={i18n.save()}
            size={ProgressButton.ButtonSize.large}
            color={ProgressButton.ButtonColor.orange}
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
  sections: state.teacherSections.sections,
}))(EditSectionForm);

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
