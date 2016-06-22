import React from 'react';
import {connect} from 'react-redux';

import Dialog from '../templates/DialogComponent';
import {toggleImportScreen, fetchProject} from './redux/screens';
import ImportProjectForm from './ImportProjectForm';
import ImportScreensForm from './ImportScreensForm';

export const ImportDialog = React.createClass({
  propTypes: Object.assign({}, Dialog.propTypes, {
    onImportProject: React.PropTypes.func,

    isFetchingProject: React.PropTypes.bool,
    errorFetchingProject: React.PropTypes.bool,

    project: React.PropTypes.object,
  }),

  getInitialState() {
    return {
      project: null
    };
  },

  handleProjectFetched(project) {
    this.setState({
      project,
    });
  },

  handleClose() {
    this.setState(this.getInitialState());
    this.props.handleClose();
  },

  render() {
    return (
      <Dialog {...this.props} handleClose={this.handleClose}>
        {
          this.props.project ?
          <ImportScreensForm project={this.props.project}
                             onImport={this.handleClose}/>
          :
          <ImportProjectForm
              isFetching={this.props.isFetchingProject}
              error={this.props.errorFetchingProject}
              onImport={this.props.onImportProject} />
        }
      </Dialog>
    );
  },
});

export default connect(
  state => ({
    isOpen: state.screens.isImportingScreen,
    isFetchingProject: state.screens.importProject.isFetchingProject,
    errorFetchingProject: state.screens.errorFetchingProject,
  }),
  dispatch => ({
    handleClose() {
      dispatch(toggleImportScreen(false));
    },
    onImportProject(url) {
      dispatch(fetchProject(url));
    },
    dispatch,
  })
)(ImportDialog);

if (BUILD_STYLEGUIDE) {
  ImportDialog.styleGuideExamples = storybook => {
    storybook
      .storiesOf('ImportDialog', module)
      .addWithInfo(
        'On Open',
        '',
        () => <ImportDialog
                  hideBackdrop={true}
                  isOpen={true}
                  onImportProject={storybook.linkTo('ImportDialog', 'Bad Project URL')}
                  handleClose={storybook.action("handleClose")}/>
      )
      .addWithInfo(
        'Bad Project URL',
        '',
        () => <ImportDialog
                  hideBackdrop={true}
                  isOpen={true}
                  errorFetchingProject={true}
                  onImportProject={storybook.linkTo('ImportDialog', 'While fetching project')}
                  handleClose={storybook.action('handleClose')}/>
      )
      .addWithInfo(
        'While fetching project',
        '',
        () => <ImportDialog
                  hideBackdrop={true}
                  isOpen={true}
                  isFetchingProject={true}
                  onImportProject={storybook.action('foo')}
                  handleClose={storybook.action('handleClose')}/>
      )
      .addWithInfo(
        'After fetching project',
        '',
        () => <ImportDialog
                  hideBackdrop={true}
                  isOpen={true}
                  project={{
                      channel:{
                        id: 'some-project',
                        name: 'Some Project',
                      },
                      sources:{
                        html: `
                        <div>
                          <div class="screen" id="screen1">
                            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                                 data-canonical-image-url="asset1.png"
                                 id="img2">
                          </div>
                          <div class="screen" id="screen2"></div>
                        </div>
`,
                      }
                    }}
                  handleClose={storybook.action('handleClose')}/>
      );
  };
}
