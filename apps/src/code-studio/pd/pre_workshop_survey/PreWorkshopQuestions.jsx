import React from 'react';
import FormComponent from '../form_components/FormComponent';

export default class PreWorkshopQuestions extends FormComponent {
  handleChange(newState) {
    // Clear the lesson any time a new unit is selected.
    if ('unit' in newState) {
      newState.lesson = null;
    }
    super.handleChange(newState);
  }

  render() {
    const units = this.props.unitsAndLessons.map(unit => unit[0]);
    const selectedUnit = this.props.unitsAndLessons.find(unit => unit[0] === this.props.data.unit);
    const lessons = selectedUnit && selectedUnit[1];

    return (
      <div>
        {
          this.buildSelectFieldGroup({
            name: "unit",
            label: `What unit and lesson will you have most recently finished by ${this.props.workshopDate}?`,
            placeholder: "Select a unit",
            required: true,
            options: units
          })
        }
        {selectedUnit &&
          this.buildSelectFieldGroup({
            name: "lesson",
            label: "Lesson",
            placeholder: "Select a lesson",
            required: true,
            options: lessons
          })
        }
        {
          this.buildFieldGroup({
            name: "questionsAndTopics",
            componentClass: "textarea",
            label: "What questions are on your mind leading into this workshop? " +
              "What topics do you hope to discuss during the workshop?",
            required: true,
          })
        }
      </div>
    );
  }
}

PreWorkshopQuestions.associatedFields = [
  'unit',
];

PreWorkshopQuestions.propTypes = {
  ...FormComponent.propTypes,
  workshopDate: React.PropTypes.string.isRequired,
  unitsAndLessons: React.PropTypes.array.isRequired
};
