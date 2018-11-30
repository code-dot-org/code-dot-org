import React, {PropTypes} from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

export default class PreWorkshopQuestions extends FormComponent {
  handleChange(newState) {
    // Clear the lesson any time a new unit is selected.
    if ('unit' in newState) {
      super.handleChange({...newState, lesson: null});
    } else {
      super.handleChange(newState);
    }
  }

  render() {
    const units = this.props.unitsAndLessons.map(unit => unit[0]);
    const selectedUnit = this.props.unitsAndLessons.find(unit => unit[0] === this.props.data.unit);
    const lessons = selectedUnit && selectedUnit[1];

    return (
      <FormGroup>
        {
          this.buildSelectFieldGroup({
            name: "unit",
            label: `What unit and lesson will you have most recently finished by ${this.props.workshopDate}?`,
            placeholder: "Select a unit",
            required: true,
            options: units,
            controlWidth: {md: 6}
          })
        }
        {selectedUnit && lessons &&
        this.buildSelectFieldGroup({
          name: "lesson",
          label: "Lesson",
          placeholder: "Select a lesson",
          required: true,
          options: lessons,
          controlWidth: {md: 6}
        })
        }
        {
          this.buildFieldGroup({
            name: "questionsAndTopics",
            componentClass: "textarea",
            label: "What questions are on your mind leading into this workshop? " +
            "What topics do you hope to discuss during the workshop?",
            required: false,
          })
        }
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data, pageProps) {
    const requiredFields = [];

    // If the selected unit has associated lessons, require lesson too.
    if (data.unit) {
      const selectedUnit = pageProps.unitsAndLessons.find(unit => unit[0] === data.unit);
      const lessons = selectedUnit && selectedUnit[1];

      if (lessons) {
        requiredFields.push('lesson');
      }
    }

    return requiredFields;
  }
}

PreWorkshopQuestions.associatedFields = [
  "unit",
  "lesson",
  "questionsAndTopics"
];

PreWorkshopQuestions.propTypes = {
  ...FormComponent.propTypes,
  workshopDate: PropTypes.string.isRequired,
  unitsAndLessons: PropTypes.array.isRequired
};
