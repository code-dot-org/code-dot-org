import React from 'react';
import {connect} from 'react-redux';

import Dialog from '../templates/DialogComponent';
import {toggleImportScreen} from './redux/screens';
import ImportProjectForm from './ImportProjectForm';

export const ImportDialog = React.createClass({
  propTypes: Dialog.propTypes,

  render() {
    return (
      <Dialog {...this.props}>
        <ImportProjectForm onProjectFetched={project => {}} />
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
