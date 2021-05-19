import * as Survey from 'survey-react';
import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';
import Spinner from '../components/spinner';

const SPINNER_WAIT_MS = 2000;

export default class Foorm extends React.Component {
  static propTypes = {
    formQuestions: PropTypes.object.isRequired,
    formName: PropTypes.string.isRequired,
    formVersion: PropTypes.number.isRequired,
    submitApi: PropTypes.string.isRequired,
    surveyData: PropTypes.object,
    submitParams: PropTypes.object,
    customCssClasses: PropTypes.object,
    onComplete: PropTypes.func,
    inEditorMode: PropTypes.bool
  };

  static defaultProps = {
    customCssClasses: {}
  };

  defaultCss = {
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
    rating: {
      root: 'sv_q_rating foorm-adjust-rating'
    },
    navigation: {
      prev: 'sv_prev_button foorm-button',
      next: 'sv_next_button foorm-button foorm-button-right',
      complete: 'sv_complete_btn foorm-button'
    },
    row: 'sv_row foorm-adjust-row',
    dropdown: {
      control: 'sv_q_dropdown_control foorm-adjust-dropdown-height'
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      statusMessage: null,
      survey: null,
      submitting: false
    };

    Survey.StylesManager.applyTheme('default');

    this.surveyModel = new Survey.Model(this.props.formQuestions);

    // Settings to avoid jumping around the page
    // when SurveyJS produces changes in focus/scrolling
    // while editing a Foorm configuration.
    if (this.props.inEditorMode) {
      // Prevents focus from moving from codemirror in Foorm Editor
      // to the first question of the rendered SurveyJS Survey.
      this.surveyModel.focusFirstQuestionAutomatic = false;

      // Prevents automatic scrolling to top of rendered SurveyJS Survey while editing a long configuration file.
      this.surveyModel.onScrollingElementToTop.add((unused, options) => {
        options.cancel = true;
      });
    }
  }

  onComplete = (survey, options) => {
    this.props.onComplete && this.props.onComplete(survey.data);
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
      hasError: false,
      submitting: true
    });
    const startTime = Date.now();
    $.ajax({
      url: this.props.submitApi,
      type: 'post',
      dataType: 'json',
      data: requestData
    })
      .done(() => {
        this.setCompletedStatusMessage(
          startTime,
          'Thank you for completing the survey! Your responses saved successfully.',
          false,
          null
        );
      })
      .fail(jqXHR => {
        if (jqXHR.status === 409) {
          this.setCompletedStatusMessage(
            startTime,
            'You already submitted a response. Thank you!',
            false,
            null
          );
        } else {
          this.setCompletedStatusMessage(
            startTime,
            'An error occurred and we could not save your response.',
            true,
            survey
          );
        }
      });
  };

  setCompletedStatusMessage(startTime, statusMessage, hasError, survey) {
    const elapsedTime = Date.now() - startTime;
    // if the api request took less than SPINNER_WAIT_MS, wait until SPINNER_WAIT_MS have
    // passed so spinner does not flash on the screen.
    const timeout =
      elapsedTime >= SPINNER_WAIT_MS ? 0 : SPINNER_WAIT_MS - elapsedTime;
    setTimeout(() => {
      this.setState({
        statusMessage: statusMessage,
        hasError: hasError,
        survey: survey,
        submitting: false
      });
    }, timeout);
  }

  render() {
    const css = {...this.defaultCss, ...this.props.customCssClasses};
    return (
      <div>
        <Survey.Survey
          model={this.surveyModel}
          onComplete={this.onComplete}
          data={this.props.surveyData}
          css={css}
          requiredText={'(Required)'}
          showCompletedPage={false}
          maxTextLength={4000}
          maxOthersLength={4000}
        />
        {this.state.statusMessage && (
          <div style={styles.statusMessage}>
            <h4>{this.state.statusMessage}</h4>
            {this.state.submitting && <Spinner />}
            {this.state.hasError && this.state.survey && (
              <Button onClick={() => this.onComplete(this.state.survey)}>
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  statusMessage: {
    textAlign: 'center'
  }
};
