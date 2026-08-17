import Dialog from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import {Box, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {studio} from '@cdo/apps/lib/util/urlHelpers';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import moduleStyles from './importProjectDialog.module.css';
import {fetchProject, toggleImportScreen} from './redux/screens';

const initialState = {url: ''};

export class ImportProjectDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onImport: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    isFetching: PropTypes.bool,
    error: PropTypes.bool,
  };

  state = {...initialState};

  onImport = () => {
    analyticsReporter.sendEvent(EVENTS.APPLAB_IMPORT_PROJECT, {
      url: this.state.url,
    });
    this.props.onImport(this.state.url);
    this.setState(initialState);
  };

  render() {
    if (!this.props.isOpen) {
      return undefined;
    }

    return (
      <Dialog
        onClose={this.props.handleClose}
        title="Import screens"
        customContent={
          <Box id="dsco-dialog-description">
            <MuiTypography variant="body2">
              Copy the share link of the app you would like to import screens
              from. Paste in the URL of that app below and click "Next."{' '}
              <a
                href={studio(
                  '/docs/concepts/app-lab/design-mode/importing-screens/'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </MuiTypography>
            <Box>
              <TextField
                className={moduleStyles.urlField}
                value={this.state.url}
                onChange={event => this.setState({url: event.target.value})}
                errorMessage={
                  this.props.error &&
                  "We can't seem to find this project. Please make sure you've entered a valid App Lab project URL."
                }
              />
            </Box>
          </Box>
        }
        primaryButtonProps={{
          children: this.props.isFetching ? 'Next' : 'Next',
          onClick: this.onImport,
          disabled: this.props.isFetching,
          loading: this.props.isFetching,
          loadingPosition: 'start',
        }}
      />
    );
  }
}

export default connect(
  state => ({
    isOpen:
      state.screens.isImportingScreen &&
      !state.screens.importProject.fetchedProject,
    isFetching: state.screens.importProject.isFetchingProject,
    error: state.screens.importProject.errorFetchingProject,
  }),
  dispatch => ({
    onImport(url) {
      dispatch(fetchProject(url));
    },
    handleClose() {
      dispatch(toggleImportScreen(false));
    },
  })
)(ImportProjectDialog);
