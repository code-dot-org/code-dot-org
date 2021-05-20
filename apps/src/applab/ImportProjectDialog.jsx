import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Dialog, {Body, Buttons, Confirm} from '../templates/Dialog';
import color from '../util/color';
import {fetchProject, toggleImportScreen} from './redux/screens';

const styles = {
  urlInputWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%'
  },
  urlInput: {
    width: 'inherit'
  },
  // TODO: ditch these styles in favor of standardized typography components
  // once they exist
  instructions: {
    color: color.black
  },
  errorText: {
    color: color.red
  }
};

const initialState = {url: ''};

export class ImportProjectDialog extends React.Component {
  static propTypes = {
    ...Dialog.propTypes,
    onImport: PropTypes.func.isRequired,
    isFetching: PropTypes.bool,
    error: PropTypes.bool
  };

  state = {...initialState};

  onImport = () => {
    this.props.onImport(this.state.url);
    this.setState(initialState);
  };

  render() {
    return (
      <Dialog {...this.props} title="Import screens">
        <Body>
          <p style={styles.instructions}>
            Copy the share link of the app you would like to import screens
            from. Paste in the URL of that app below and click "Next."{' '}
            <a
              href={`${window.dashboard.CODE_ORG_URL}/applab/docs/import`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </p>
          <div style={styles.urlInputWrapper}>
            <input
              type="text"
              value={this.state.url}
              style={styles.urlInput}
              onChange={event => this.setState({url: event.target.value})}
            />
          </div>
          {this.props.error && (
            <p style={styles.errorText}>
              We can't seem to find this project. Please make sure you've
              entered a valid App Lab project URL.
            </p>
          )}
        </Body>
        <Buttons>
          <Confirm onClick={this.onImport} disabled={this.props.isFetching}>
            {this.props.isFetching && (
              <span className="fa fa-spin fa-spinner" />
            )}{' '}
            Next
          </Confirm>
        </Buttons>
      </Dialog>
    );
  }
}

export default connect(
  state => ({
    isOpen:
      state.screens.isImportingScreen &&
      !state.screens.importProject.fetchedProject,
    isFetching: state.screens.importProject.isFetchingProject,
    error: state.screens.importProject.errorFetchingProject
  }),
  dispatch => ({
    onImport(url) {
      dispatch(fetchProject(url));
    },
    handleClose() {
      dispatch(toggleImportScreen(false));
    }
  })
)(ImportProjectDialog);
