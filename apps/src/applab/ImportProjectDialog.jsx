import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Dialog, {Body, Buttons, Confirm, Footer} from '../templates/Dialog';
import color from '../color';
import {fetchProject, toggleImportScreen} from './redux/screens';

const styles = {
  urlInputWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
  },
  urlInput: {
    width: 'inherit',
  },
  // TODO: ditch these styles in favor of standardized typography components
  // once they exist
  instructions: {
    color: color.black,
  },
  errorText: {
    color: color.red,
  },
};

export const ImportProjectDialog = React.createClass({

  propTypes: Object.assign({}, Dialog.propTypes, {
    onImport: React.PropTypes.func.isRequired,
    isFetching: React.PropTypes.bool,
    error: React.PropTypes.bool,
  }),

  getInitialState() {
    return {
      url: '',
    };
  },

  onImport() {
    this.props.onImport(this.state.url);
    this.setState(this.getInitialState());
  },

  render() {
    return (
      <Dialog {...this.props} title="Import screens">
        <Body>
          <p style={styles.instructions}>
            Copy the share link of the app you would like to import screens
            from. Paste in the URL of that app below and click "Next."
            {' '}<a href={`${window.dashboard.CODE_ORG_URL}/applab/docs/import`} target="_blank">Learn More</a>
          </p>
          <div style={styles.urlInputWrapper}>
            <input
              type="text"
              value={this.state.url}
              style={styles.urlInput}
              onChange={event => this.setState({url: event.target.value})}
            />
          </div>
          {this.props.error &&
           <p style={styles.errorText}>
             We can't seem to find this project. Please make sure you've
             entered a valid App Lab project URL.
           </p>
          }
        </Body>
        <Buttons>
          <Confirm
            onClick={this.onImport}
            disabled={this.props.isFetching}
          >
            {this.props.isFetching && <span className="fa fa-spin fa-spinner"></span>}
            {' '}Next
          </Confirm>
        </Buttons>
      </Dialog>
    );
  }
});

export default connect(
  state => ({
    isOpen: state.screens.isImportingScreen && !state.screens.importProject.fetchedProject,
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


if (BUILD_STYLEGUIDE) {
  ImportProjectDialog.styleGuideExamples = storybook => {
    storybook
      .storiesOf('ImportProjectDialog', module)
      .addStoryTable([
        {
          name: 'On open',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              onImport={storybook.action("onImport")}
            />
          )
        }, {
          name: 'While fetching',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              isFetching
              onImport={storybook.action("onImport")}
            />
          )
        }, {
          name: 'Error Fetching',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              error
              onImport={storybook.action("onImport")}
            />
          )
        },
      ]);
  };
}
