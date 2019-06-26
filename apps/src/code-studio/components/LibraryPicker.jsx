import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '../../templates/BaseDialog';
import color from '../../util/color';
import clientApi from '@cdo/apps/code-studio/initApp/clientApi';
import {addApplabLibrary} from './applabLibraryRedux';
import {connect} from 'react-redux';
import project from '../initApp/project';

const styles = {
  root: {
    margin: '10px',
    textAlign: 'left'
  },
  addButton: {
    color: color.white,
    backgroundColor: color.orange,
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 10
  },
  text: {
    fontSize: 'inherit',
    color: color.dark_charcoal
  },
  linkBox: {
    cursor: 'auto',
    width: '600px',
    height: '32px',
    marginBottom: 0
  }
};

class LibraryPicker extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    addLibrary: PropTypes.func
  };

  state = {
    libraryId: ''
  };

  changeLibraryId = event => {
    this.setState({libraryId: event.target.value});
  };

  select = event => event.target.select();

  shareLink() {
    return (
      <div>
        <p style={styles.text}>
          Paste in the library link for a project to add its functions in your
          toolbox.
        </p>
        <input
          type="text"
          onClick={this.select}
          style={styles.linkBox}
          value={this.state.libraryId}
          onChange={this.changeLibraryId}
        />
      </div>
    );
  }

  addLibrary = () => {
    var libraryPilot = clientApi.create('/v3/librarypilot');
    libraryPilot.fetch(this.state.libraryId + '/library.json', (foo, data) => {
      this.props.addLibrary(data);
      project.addLibrary(data);
    });
    console.log('Added your library!');
    this.props.onClose();
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.onClose}
        useUpdatedStyles
      >
        <div className="modal-content" style={styles.root}>
          <p className="dialog-title">Manage Libraries</p>
          {this.shareLink()}
          <button
            onClick={this.addLibrary}
            style={styles.addButton}
            type="button"
          >
            Add
          </button>
        </div>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    addLibrary(data) {
      dispatch(addApplabLibrary(data));
    }
  })
)(LibraryPicker);
