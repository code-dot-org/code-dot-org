import * as Survey from 'survey-react';

import PropTypes from 'prop-types';
import React from 'react';

export default class Foorm extends React.Component {
  static propTypes = {
    formData: PropTypes.object.isRequired,
    formName: PropTypes.string.isRequired,
    formVersion: PropTypes.number.isRequired,
    surveyData: PropTypes.object,
    submitApi: PropTypes.string,
    submitParams: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      submitted: false,
      errors: []
    };

    Survey.StylesManager.applyTheme('default');

    this.surveyModel = new Survey.Model(this.props.formData);
  }

  onComplete = (survey, options) => {
    console.log('Survey results: ' + JSON.stringify(survey.data));
    let requestData = {
      answers: survey.data,
      form_name: this.props.formName,
      form_version: this.props.formVersion
    };
    if (this.props.submitParams) {
      requestData = {...this.props.submitParams, ...requestData};
    }
    $.ajax({
      url: this.props.submitApi || '/dashboardapi/v1/foorm/submission',
      type: 'post',
      dataType: 'json',
      data: requestData
    });
  };

  render() {
    if (this.state.submitted) {
      return <div>Thank you for submitting</div>;
    } else {
      return (
        <Survey.Survey
          model={this.surveyModel}
          onComplete={this.onComplete}
          data={this.props.surveyData}
        />
      );
    }
  }
}
