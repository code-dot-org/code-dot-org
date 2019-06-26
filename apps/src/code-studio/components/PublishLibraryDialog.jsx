import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../../templates/BaseDialog';
import {connect} from 'react-redux';
import {hideLibraryShareDialog} from './libraryShareDialogRedux';
import color from '../../util/color';

const styles = {
  root: {
    margin: '10px'
  },
  checkbox: {
    margin: '4px',
    width: 24,
    height: 24
  },
  publishButton: {
    marginLeft: 0,
    backgroundColor: color.cyan,
    color: color.white,
    float: 'right',
    margin: 10,
    marginRight: 0
  },
  functionName: {
    fontSize: '16px',
    fontFamily: 'monospace'
  }
};

class PublishLibraryDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    libraryFunctions: PropTypes.object.isRequired
  };

  state = {
    showShareLink: false
  };

  displayFunctions() {
    if (Object.keys(this.props.libraryFunctions).length === 0) {
      return (
        <div>
          A library can only export functions. Your program does not have any
          functions to export.
        </div>
      );
    }

    return Object.keys(this.props.libraryFunctions).map(key => {
      var params = '(' + this.props.libraryFunctions[key].join(', ') + ')';
      return (
        <div key={key}>
          <input type="checkbox" style={styles.checkbox} />
          <span style={styles.functionName}>
            {key}
            {params}
          </span>
        </div>
      );
    });
  }

  displayShareLink = () => {
    this.setState({showShareLink: true});
  };

  select = event => event.target.select();

  shareLink() {
    return (
      this.state.showShareLink && (
        <div>
          <p style={{fontSize: 20}}>
            To share your library, send this link to a friend:
          </p>
          <input
            type="text"
            onClick={this.select}
            readOnly="true"
            value={'https://studio.code.org'}
            style={{cursor: 'copy', width: 500}}
          />
        </div>
      )
    );
  }

  close = () => {
    this.setState(state => ({showShareLink: false}));
    this.props.onClose();
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.close}
        useUpdatedStyles
      >
        <div className="modal-content" style={styles.root}>
          <p className="dialog-title">
            Which functions would you like to share?
          </p>
          {this.displayFunctions()}
          <button
            type="button"
            onClick={this.displayShareLink}
            style={styles.publishButton}
          >
            Publish
          </button>
          {this.shareLink()}
        </div>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    isOpen: state.libraryShareDialog.isOpen,
    libraryFunctions: state.libraryShareDialog.libraryFunctions
  }),
  dispatch => ({
    onClose() {
      dispatch(hideLibraryShareDialog());
    }
  })
)(PublishLibraryDialog);
