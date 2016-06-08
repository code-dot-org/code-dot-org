import React from 'react';
import {connect} from 'react-redux';

import Dialog from '../templates/DialogComponent';
import {toggleImportScreen} from './redux/screens';
import ImportProjectForm from './ImportProjectForm';
import ImportScreensForm from './ImportScreensForm';

export const ImportDialog = React.createClass({
  propTypes: Dialog.propTypes,

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
          this.state.project ?
          <ImportScreensForm project={this.state.project}
                             onImport={this.handleClose}/>
          :
          <ImportProjectForm onProjectFetched={this.handleProjectFetched} />
        }
      </Dialog>
    );
  },
});

export default connect(
  state => ({
    isOpen: state.screens.isImportingScreen,
  }),
  dispatch => ({
    handleClose() {
      dispatch(toggleImportScreen(false));
    }
  })
)(ImportDialog);
