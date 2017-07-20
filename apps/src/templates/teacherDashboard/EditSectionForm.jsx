import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {Heading1, Heading3} from "../../lib/ui/Headings";
import ProgressButton from '../progress/ProgressButton';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { sectionShape, assignmentShape } from './shapes';
import DialogFooter from './DialogFooter';
import i18n from '@cdo/locale';

const style = {
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
      <select
        value = {this.props.grade}
        onChange={event => this.props.handleGrade(event.target.value)}
      >
        {gradeOptions.map((grade, index) => (
          <option key={index} value={grade.value}>{grade.text}</option>
        ))}
      </select>
    );
  }

  render(){
    return (
      <div style={{width: 970}}>
        <Heading1>
          {i18n.editSectionDetails()}
        </Heading1>
        <div>
          <Heading3>
            {i18n.sectionName()}
          </Heading3>
          <div>
            <div>{i18n.addSectionName()}</div>
            {this.renderSectionNameInput()}
          </div>
          <Heading3>
            {i18n.grade()}
          </Heading3>
          <div>
            {this.renderGradeSelector()}
          </div>
          <Heading3>
            {i18n.course()}
          </Heading3>
          {/* TODO: JS error when selecting blank course? */}
          <div>
            <div>{i18n.whichCourse()}</div>
            {/* TODO: Decide later option */}
            <AssignmentSelector
              ref={this.props.assignmentRef}
              primaryAssignmentIds={this.props.primaryAssignmentIds}
              assignments={this.props.validAssignments}
              chooseLaterOption={true}
            />
          </div>
          <Heading3>
            {i18n.enableLessonExtras()}
          </Heading3>
          <div>
            <div>
              {i18n.explainLessonExtras()}
              {' '}
              <a
                href="https://support.code.org/hc/en-us/articles/228116568-In-the-teacher-dashboard-what-are-stage-extras-"
                target="_blank"
              >
                {i18n.explainLessonExtrasLearnMore()}
              </a>
            </div>
            <select
              value = {this.props.extras}
              onChange={val => this.props.handleExtras(val.target.value)}
            >
              <option value="yes">{i18n.yes()}</option>
              <option value="no">{i18n.no()}</option>
            </select>
          </div>
          <Heading3>
            {i18n.enablePairProgramming()}
          </Heading3>
          <div>
            <div>
              {i18n.explainPairProgramming()}
              {' '}
              <a
                href="https://support.code.org/hc/en-us/articles/115002122788-How-does-pair-programming-within-Code-Studio-work-"
                target="_blank"
              >
                {i18n.explainPairProgrammingLearnMore()}
              </a>
            </div>
            <select
              value = {this.props.pairing}
              onChange={val => this.props.handlePairing(val.target.value)}
            >
              <option value="yes">{i18n.yes()}</option>
              <option value="no">{i18n.no()}</option>
            </select>
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

