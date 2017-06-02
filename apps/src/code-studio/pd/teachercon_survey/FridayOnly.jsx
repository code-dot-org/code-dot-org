import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';
import VariableFormGroup from '../workshop_survey/VariableFormGroup';
import QuestionsTable from '../form_components/QuestionsTable';

const LABELS = {
  "personalLearningNeedsMet": "I feel that my personal learning needs were met today.",
  "haveIdeasAboutFormative": "I have ideas about how to use the formative assessments that are built into the curriculum.",
  "haveIdeasAboutSummative": "I have ideas about how to use the summative assessments that are built into the curriculum.",
  "haveConcreteIdeas": "I have concrete ideas and plans for how to use the resources in the curriculum to meet my own assessment and grading needs.",
  "toolsWillHelp": "I think the tools in this curriculum will help my students better understand the CS concepts covered in this course.",
  "learnedEnoughToMoveForward": "I feel like I’ve learned enough to move forward teaching {course}.",
  "feelConfidentUsingMaterials": "I feel confident using the {course} curriculum materials.",
  "feelConfidentCanHelpStudents": "I feel confident that I will be able to help my students use the tools in the {course} curriculum.",
  "havePlan": "I have a plan to get from TeacherCon to the start of the school year.",
  "feelComfortableLeading": "I feel comfortable taking on the role of lead learner in my classroom.",
  "haveLessAnxiety": "I have less anxiety about teaching {course} than I did yesterday.",
  "howCouldImprove": "How could this PD be changed to better fit your learning needs?",
  "whatHelpedMost": "What helped you learn the most today and why?",
  "whatDetracted": "What detracted from your learning today and why?",
  "otherFeedbackFridayOnly": "Is there anything else you’d like to tell us about your experience today?",
  "whoFacilitated": "Who facilitated your workshop today? (check at least one)",
  "thingsFacilitatorDidWell": "What were two things {value} did well?",
  "thingsFacilitatorCouldImprove": "What were two things {value} could do better?",
};

export default class FridayOnly extends FormComponent {
  labelFor(name) {
    return LABELS[name].replace("{course}", this.props.course);
  }

  render() {
    return (
      <FormGroup>
        <h3>Day 5 Questions (Thinking About Friday Only)</h3>
        {this.buildButtonsFromOptions({
          label: this.labelFor('personalLearningNeedsMet'),
          name: 'personalLearningNeedsMet',
          required: true,
          type: 'radio',
        })}
        {this.props.data.personalLearningNeedsMet &&
          [
            'Strongly Disagree',
            'Disagree',
            'Slightly Disagree',
          ].includes(this.props.data.personalLearningNeedsMet) &&
          this.buildFieldGroup({
            componentClass: "textarea",
            label: this.labelFor("howCouldImprove"),
            name: "howCouldImprove",
            required: true
          })
        }

        <h4>Please rate your level of agreement with each statement below.</h4>
        <QuestionsTable
          data={this.props.data}
          errors={this.props.errors}
          labelSpan={5}
          onChange={this.props.onChange}
          options={this.props.options.knowWhereToGoForHelp}
          questions={[
            "haveIdeasAboutFormative",
            "haveIdeasAboutSummative",
            "haveConcreteIdeas",
            "toolsWillHelp",
            "learnedEnoughToMoveForward",
            "feelConfidentUsingMaterials",
            "feelConfidentCanHelpStudents",
            "havePlan",
            "feelComfortableLeading",
            "haveLessAnxiety",
          ].map(key => ({
            label: this.labelFor(key),
            name: key,
            required: true,
          }))}
        />

        <VariableFormGroup
          sourceName="whoFacilitated"
          sourceLabel={this.labelFor("whoFacilitated")}
          sourceValues={this.props.facilitatorNames}

          onChange={this.handleChange}
          data={this.props.data}
          errors={this.props.errors}

          rowVariableQuestions={[{
            label: this.labelFor("thingsFacilitatorDidWell"),
            name: 'thingsFacilitatorDidWell',
            type: 'free_response',
            required: true
          }, {
            label: this.labelFor("thingsFacilitatorCouldImprove"),
            name: 'thingsFacilitatorCouldImprove',
            type: 'free_response',
            required: true
          }]}
        />

        {this.buildFieldGroup({
          componentClass: "textarea",
          label: this.labelFor('whatHelpedMost'),
          name: "whatHelpedMost",
          required: true
        })}
        {this.buildFieldGroup({
          componentClass: "textarea",
          label: this.labelFor('whatDetracted'),
          name: "whatDetracted",
          required: true
        })}
        {this.buildFieldGroup({
          componentClass: "textarea",
          label: this.labelFor('otherFeedbackFridayOnly'),
          name: "otherFeedbackFridayOnly"
        })}
      </FormGroup>
    );
  }
}

FridayOnly.associatedFields = Object.keys(LABELS);
