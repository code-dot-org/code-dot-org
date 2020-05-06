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
    root: 'sv_main sv_default_css foorm-reset-font',
    header: 'sv_header foorm-adjust-header',
    body: 'sv_body foorm-adjust-body',
    page: {
      title: 'sv_page_title foorm-adjust-page-title'
    },
    checkbox: {
      itemControl: 'sv_q_checkbox_control_item foorm-adjust-checkbox'
    },
    radiogroup: {
      itemControl: 'sv_q_radiogroup_control_item foorm-adjust-radio'
    },
    matrix: {
      root: 'sv_q_matrix foorm-adjust-matrix'
    },
    navigation: {
      prev: 'sv_prev_button foorm-button',
      next: 'sv_next_button foorm-button foorm-button-right',
      complete: 'sv_complete_btn foorm-button'
    }
  };

  constructor(props) {
    super(props);

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
    // Default text says thank you before we send the post. Set to indicate
    // we are saving and clear any error messages.
    // We need to call showDataSavingClear() after changing completedHtml to force
    // the survey component to refresh with the new completedHtml.
    survey.completedHtml = '<h4>Your responses are being saved...</h4>';
    options.showDataSavingClear();
    $.ajax({
      url: this.props.submitApi,
      type: 'post',
      dataType: 'json',
      data: requestData
    })
      .done(() => {
        survey.completedHtml =
          '<h4>Thank you for completing the survey! Your responses saved successfully.</h4>';
        options.showDataSavingClear();
      })
      .fail(jqXHR => {
        if (jqXHR.status === 409) {
          survey.completedHtml =
            '<h4>You already submitted a response. Thank you!</h4>';
          options.showDataSavingClear();
        } else {
          survey.completedHtml =
            '<h4>An error occurred and we could not save your response.</h4>';
          options.showDataSavingError('Please click here to try again.');
        }
      });
  };

  render() {
    return (
      <Survey.Survey
        model={this.surveyModel}
        onComplete={this.onComplete}
        data={this.props.surveyData}
        css={this.customCss}
        requiredText={'(Required)'}
      />
    );
  }
}
