import React from 'react';
import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';
import Button, {ButtonColor} from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import trackEvent from '@cdo/apps/util/trackEvent';
import $ from 'jquery';

// Additonal styles for this component can be found in NpsSurveyBlock.scss

const customCssClasses = {
  root: 'nps-survey-root',
  question: {
    title: 'nps-survey-q-title'
  },
  rating: {
    item: 'nps-survey-q-rating-item',
    minText: 'nps-survey-rating-min',
    maxText: 'nps-survey-rating-max',
    root: 'nps-survey-rating-root',
    selected: 'nps-survey-rating-selected'
  },
  row: 'nps-survey-row',
  checkbox: {
    item: 'nps-survey-checkbox',
    itemControl: 'nps-survey-checkbox-item-control',
    materialDecorator: 'nps-survey-checkbox-material-decorator',
    other: 'nps-survey-comment'
  },
  error: {
    locationTop: 'nps-survey-top-error'
  },
  navigation: {
    complete: 'nps-survey-submit-button'
  },
  comment: 'nps-survey-comment'
};

export default class NpsSurveyBlock extends React.Component {
  constructor(props) {
    super(props);
    this.onComplete = this.onComplete.bind(this);
    this.silentlyDismissSurvey = this.silentlyDismissSurvey.bind(this);
  }

  state = {
    visible: true,
    submitted: false,
    result: undefined
  };

  componentDidMount() {
    $.ajax({
      url: '/form/nps_survey/configuration',
      type: 'get'
    }).done(result => {
      if (result) {
        this.setState({result: JSON.parse(result.props)});
      }
    });
  }

  onComplete(data) {
    trackEvent('survey', 'nps2020', parseInt(data.nps_value));
    this.setState({submitted: true});
  }

  silentlyDismissSurvey() {
    const {formName, formVersion, submitApi, submitParams} = this.state.result;
    const answers = {nps_value: -1};
    const requestData = {
      ...submitParams,
      answers: answers,
      form_name: formName,
      form_version: formVersion
    };

    this.onComplete(answers);
    this.setState({visible: false});
    $.ajax({
      url: submitApi,
      type: 'post',
      dataType: 'json',
      data: requestData
    });
  }

  render() {
    if (this.state.visible && this.state.result) {
      return (
        <div style={styles.container}>
          <Foorm
            {...this.state.result}
            customCssClasses={customCssClasses}
            onComplete={this.onComplete}
          />
          {!this.state.submitted && (
            <Button
              color={ButtonColor.white}
              onClick={this.silentlyDismissSurvey}
              // We intentionally do not internationalize strings
              // here because this survey is only displayed to
              // users in the en-us locale.
              text={'No thanks'}
              style={styles.dismiss}
            />
          )}
        </div>
      );
    } else {
      return null;
    }
  }
}

const styles = {
  container: {
    backgroundColor: color.table_header,
    padding: '25px',
    fontSize: '14px',
    borderRadius: '4px',
    marginBottom: '60px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.border_gray,
    position: 'relative'
  },
  dismiss: {
    position: 'absolute',
    left: '130px',
    bottom: '40px'
  }
};
