import * as Survey from 'survey-react';

import PropTypes from 'prop-types';
import React from 'react';

export default class Foorm extends React.Component {
  static propTypes = {
    formData: PropTypes.object.isRequired
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

  render() {
    if (this.state.submitted) {
      return <div>Thank you for submitting</div>;
    } else {
      return <Survey.Survey model={this.surveyModel} />;
    }
  }
}
