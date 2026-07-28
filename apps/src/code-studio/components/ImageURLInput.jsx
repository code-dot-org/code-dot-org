import {Typography as MuiTypography} from '@mui/material';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import InputPrompt from '@cdo/apps/templates/InputPrompt';
import i18n from '@cdo/locale';

export default class ImageURLInput extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    allowedExtensions: PropTypes.string,
    currentValue: PropTypes.string,
  };
  state = {showError: false};

  handleSubmitWrapper = url => {
    if (ABSOLUTE_REGEXP.test(url)) {
      this.props.assetChosen(url, moment());
      analyticsReporter.sendEvent(EVENTS.SUBMIT_IMAGE_URL, {LabType: 'applab'});
    } else {
      this.setState({showError: true});
    }
  };

  render() {
    return (
      <div>
        <MuiTypography
          variant="body2"
          component="div"
          gutterBottom
          sx={{marginTop: '1em'}}
        >
          {i18n.imageURLInputDescription()}
        </MuiTypography>
        <InputPrompt
          question={i18n.imageURLInputPrompt()}
          onInputReceived={this.handleSubmitWrapper}
          currentValue={this.props.currentValue}
        />
        {this.state.showError && (
          <MuiTypography
            variant="body2"
            component="div"
            sx={{color: 'var(--text-error-primary)'}}
          >
            {i18n.imageURLInputInvalid()}
          </MuiTypography>
        )}
        <MuiTypography variant="body2" component="div" gutterBottom>
          {i18n.imageURLInputExample()}
        </MuiTypography>
      </div>
    );
  }
}
