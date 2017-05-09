import React from 'react';

import FormController from '../form_components/FormController';
import DayOneQuestions from './DayOneQuestions';

const PageComponentsByDay = [
  [
    DayOneQuestions
  ],
  [
  ],
  [
  ],
  [
  ],
  [
  ],
];

export default class LocalSummerWorkshopSurvey extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    return PageComponentsByDay[this.props.day - 1];
  }

  /**
   * @override
   */
  serializeFormData() {
    return {
      ...super.serializeFormData(),
      day: this.props.day
    };
  }

  /**
   * @override
   */
  onSuccessfulSubmit() {
    // Let the server display a confirmation page as appropriate
    window.location.reload(true);
  }
}

LocalSummerWorkshopSurvey.propTypes = {
  ...FormController.propTypes,
  day: React.PropTypes.number.isRequired,
};
