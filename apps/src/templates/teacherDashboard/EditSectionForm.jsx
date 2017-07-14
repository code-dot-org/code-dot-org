import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {Heading1, Heading3} from "../../lib/ui/Headings";
import ProgressButton from '../progress/ProgressButton';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { sectionShape, assignmentShape } from './shapes';

export class EditSectionForm extends Component{

  static propTypes = {
    handleSave: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,

    //Comes from redux
    validGrades: PropTypes.arrayOf(PropTypes.string).isRequired,
    validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    sections: PropTypes.objectOf(sectionShape).isRequired,
  };

  state = {
    name: '',
    grade: "Choose a grade",
    course: "Choose a course",
    extras: true,
    pairing: true,
  };

  render(){
    return (
      <div>
        <Heading1>
          Edit Section Details
        </Heading1>
        <div>
          <Heading3>
            Section Name
          </Heading3>
          <div>
            <p>Enter a name for your section that will help you remember which classroom it is for. Both you and your
              students will be able to see this section name.</p>
            <input
              value={this.state.name}
              onChange={val => this.setState({name: val.target.value})}
            />
          </div>
          <Heading3>
            Grade
          </Heading3>
          <div>
            <select
              value = {this.state.grade}
              onChange={val => this.setState({grade: val.target.value})}
            >
              {[""].concat(this.props.validGrades).map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          <Heading3>
            Course
          </Heading3>
          <div>
            <p>Don't know which course to teach? Find a course from the courses page to assign a course to your section
              later. </p>
            <AssignmentSelector
              value = {this.state.course}
              onChange={val => this.setState({course: val.target.value})}
              primaryAssignmentIds={this.props.primaryAssignmentIds}
              assignments={this.props.validAssignments}
            />
          </div>
          <Heading3>
            Enable Lesson Extras
          </Heading3>
          <div>
            <p>When Lesson Extras is on, students will end each lesson with some bonus challenges and creative projects rather
              than being automatically advanced to the next lesson. This feature gives students the opportunity to expand
              their knowledge and further practice, without getting ahead of their classmates. Learn more about Lesson Extras.</p>
            <select
              value = {this.state.extras}
              onChange={val => this.setState({extras: val.target.value})}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <Heading3>
            Enable Pair Programming
          </Heading3>
          <div>
            <p>When pair programming is turned on, students can choose to work with a classmate at the same computer. Turn
              this setting on if you want students to be able to work together while sharing progress. Learn more about
              pair programming.</p>
            <select
              value = {this.state.pairing}
              onChange={val => this.setState({pairing: val.target.value})}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div>
          <ProgressButton onClick={this.props.handleBack} text="Go Back"/>
          <ProgressButton onClick={() => this.props.handleSave(this.state.name, this.state.grade, this.state.course, this.state.extras, this.state.pairing)} text="Save"/>
        </div>
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

