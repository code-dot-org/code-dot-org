import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '../../templates/BaseDialog';
import color from '../../util/color';

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

export default class LibraryPicker extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool
  };

  select = event => event.target.select();

  shareLink() {
    return (
      <div>
        <p style={styles.text}>
          Paste in the library link for a project to add its functions in your
          toolbox.
        </p>
        <input type="text" onClick={this.select} style={styles.linkBox} />
      </div>
    );
  }

  addLibrary = () => {
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
