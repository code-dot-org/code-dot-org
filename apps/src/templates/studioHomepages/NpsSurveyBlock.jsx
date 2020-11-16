import React from 'react';
import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';
import Button, {ButtonColor} from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

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
    right: '25px',
    bottom: '40px'
  }
};

export default class NpsSurveyBlock extends React.Component {
  state = {
    visible: true,
    submitted: false,
    result: undefined
  };

  customCssClasses = {
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

  componentDidMount() {
    $.ajax({
      url: '/form_data/nps_survey',
      type: 'get'
    }).done(result => {
      if (result) {
        this.setState({result: JSON.parse(result.props)});
      }
    });
  }

  render() {
    if (this.state.visible && this.state.result) {
      return (
        <div style={styles.container}>
          <Foorm
            {...this.state.result}
            customCssClasses={this.customCssClasses}
            onComplete={() => this.setState({submitted: true})}
          />
          {!this.state.submitted && (
            <Button
              color={ButtonColor.white}
              onClick={() => this.setState({visible: false})}
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
