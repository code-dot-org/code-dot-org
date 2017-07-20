import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {Heading1, Heading3} from "../../lib/ui/Headings";
import ProgressButton from '../progress/ProgressButton';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { sectionShape, assignmentShape } from './shapes';
import DialogFooter from './DialogFooter';
import i18n from '@cdo/locale';

export class EditSectionForm extends Component{

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
            <input
              value={this.props.name}
              onChange={val => this.props.handleName(val.target.value)}
            />
          </div>
          <Heading3>
            {i18n.grade()}
          </Heading3>
          <div>
            <select
              value = {this.props.grade}
              onChange={val => this.props.handleGrade(val.target.value)}
            >
              {[""].concat(this.props.validGrades).map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          <Heading3>
            {i18n.course()}
          </Heading3>
          <div>
            <div>{i18n.whichCourse()}</div>
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
            <div>{i18n.explainLessonExtras()}</div>
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
            <div>{i18n.explainPairProgramming()}</div>
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

export default connect(state => ({
  validGrades: state.teacherSections.validGrades,
  validAssignments: state.teacherSections.validAssignments,
  primaryAssignmentIds: state.teacherSections.primaryAssignmentIds,
  sections: state.teacherSections.sections,
}), {})(EditSectionForm);

