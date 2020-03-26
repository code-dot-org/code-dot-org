import * as Survey from 'survey-react';
import PropTypes from 'prop-types';
import React from 'react';

export default class Foorm extends React.Component {
  static propTypes = {
    formQuestions: PropTypes.object.isRequired,
    formName: PropTypes.string.isRequired,
    formVersion: PropTypes.number.isRequired,
    submitApi: PropTypes.string.isRequired,
    surveyData: PropTypes.object,
    submitParams: PropTypes.object
  };

  customCss = {
    // Use default style but use existing font.
    root: 'sv_main sv_default_css foorm-reset-font',

    header: 'sv_header foorm-adjust-header',

    body: 'sv_body foorm-adjust-body',

    checkbox: {
      itemControl: 'sv_q_checkbox_control_item foorm-adjust-checkbox'
    },

    radiogroup: {
      itemControl: 'sv_q_radiogroup_control_item foorm-adjust-radio'
    },

    matrix: {
      root: 'sv_q_matrix foorm-adjust-matrix'
    },

    // Use our own button style.
    navigation: {
      complete: 'foorm-complete-button'
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      submitted: false,
      errors: []
    };

    Survey.StylesManager.applyTheme('default');

    this.surveyModel = new Survey.Model(this.props.formQuestions);
  }

  onComplete = (survey, options) => {
    let requestData = {
      answers: survey.data,
      form_name: this.props.formName,
      form_version: this.props.formVersion
    };
    if (this.props.submitParams) {
      requestData = {...this.props.submitParams, ...requestData};
    }
    $.ajax({
      url: this.props.submitApi,
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
          css={this.customCss}
        />
      );
    }
  }
}
