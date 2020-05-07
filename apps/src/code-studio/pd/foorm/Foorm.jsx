import * as Survey from 'survey-react';
import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';

const styles = {
  statusMessage: {
    textAlign: 'center'
  },
  tryAgainButton: {
    textAlign: 'right'
  }
};

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

    this.state = {
      hasError: false,
      statusMessage: '',
      survey: null
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
    this.setState({
      statusMessage: 'Your responses are being submitted...',
      hasError: false
    });
    $.ajax({
      url: this.props.submitApi,
      type: 'post',
      dataType: 'json',
      data: requestData
    })
      .done(() => {
        this.setState({
          statusMessage:
            'Thank you for completing the survey! Your responses saved successfully.'
        });
      })
      .fail(jqXHR => {
        if (jqXHR.status === 409) {
          this.setState({
            statusMessage: 'You already submitted a response. Thank you!'
          });
        } else {
          this.setState({
            statusMessage:
              'An error occurred and we could not save your response.',
            hasError: true,
            survey: survey
          });
        }
      });
  };

  render() {
    return (
      <div>
        <Survey.Survey
          model={this.surveyModel}
          onComplete={this.onComplete}
          data={this.props.surveyData}
          css={this.customCss}
          requiredText={'(Required)'}
          showCompletedPage={false}
        />
        {this.state.statusMessage && (
          <div style={styles.statusMessage}>
            <h4>{this.state.statusMessage}</h4>
            {this.state.hasError && this.state.survey && (
              <Button
                style={styles.tryAgainButton}
                onClick={() => this.onComplete(this.state.survey)}
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
}
