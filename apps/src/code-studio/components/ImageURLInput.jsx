import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

export default class ImageURLInput extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    allowedExtensions: PropTypes.string,
    currentValue: PropTypes.string,
  };
  state = {showError: false, value: this.props.currentValue || ''};

  inputRef = React.createRef();

  componentDidMount() {
    this.inputRef.current?.focus();
  }

  handleChange = event => {
    this.setState({value: event.target.value});
  };

  handleSubmit = event => {
    event.preventDefault();
    this.handleSubmitWrapper(this.state.value);
  };

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
        <form
          onSubmit={this.handleSubmit}
          style={{display: 'flex', flexDirection: 'column', gap: 8}}
        >
          <TextField
            ref={this.inputRef}
            name="imageUrl"
            label={i18n.imageURLInputPrompt()}
            value={this.state.value}
            onChange={this.handleChange}
            style={{width: '100%'}}
          />
          <MuiButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            sx={{alignSelf: 'flex-start'}}
          >
            Submit
          </MuiButton>
        </form>
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
