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
    width: '450px',
    height: '32px',
    marginBottom: 0
  },
  error: {
    color: color.red
  }
};

class LibraryPicker extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    addLibrary: PropTypes.func
  };

  state = {
    libraryId: '',
    displayError: false,
    loading: false
  };

  changeLibraryId = event => {
    this.setState({
      libraryId: event.target.value,
      displayError: false
    });
  };

  select = event => event.target.select();

  shareLink() {
    return (
      <div>
        <p style={styles.text}>
          Paste in the library link for a project to add its functions in your
          toolbox.
        </p>
        {this.state.displayError && (
          <p style={{...styles.text, ...styles.error}}>
            We couldn't find that library ID. Try a different ID.
          </p>
        )}
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
    if (this.state.loading) {
      return;
    }

    this.setState({loading: true});
    var libraryPilot = clientApi.create('/v3/librarypilot', () => {});
    libraryPilot.fetch(
      this.state.libraryId + '/library.json',
      (error, data) => {
        if (error) {
          this.setState({
            displayError: true,
            loading: false
          });
          console.log('failed to add library with message:\n' + error);
          return;
        }

        this.props.addLibrary(data);
        project.addLibrary(data);
      }
    );

    console.log('Finished add operation!');
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.setState({
        displayError: false,
        loading: false
      });
    }
  }

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
            {this.state.loading && <i className="fa fa-spinner fa-spin" />}
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
