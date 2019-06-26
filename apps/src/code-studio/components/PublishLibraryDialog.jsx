import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../../templates/BaseDialog';
import {connect} from 'react-redux';
import {hideLibraryShareDialog} from './libraryShareDialogRedux';
import color from '../../util/color';
import clientApi from '@cdo/apps/code-studio/initApp/clientApi';

const styles = {
  root: {
    margin: '10px'
  },
  checkbox: {
    margin: '4px',
    width: 28,
    height: 28
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
    fontFamily: 'monospace',
    marginTop: 10,
    color: color.charcoal
  },
  comment: {
    margin: 4,
    flex: 1
  }
};

class PublishLibraryDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    libraryFunctions: PropTypes.array.isRequired,
    libraryName: PropTypes.string.isRequired,
    librarySource: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired
  };

  state = {
    showShareLink: false,
    selectedFunctions: {},
    functionComments: {},
    shareLink: ''
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      var selectedFunctions = {};
      this.props.libraryFunctions.forEach(libraryFunction => {
        selectedFunctions[libraryFunction.name] = true;
      });

      this.setState({
        selectedFunctions: selectedFunctions
      });
    }
  }

  boxChecked = name => () => {
    this.setState(state => {
      state.selectedFunctions[name] = !state.selectedFunctions[name];
      return state;
    });
  };

  commentAdded(name, event) {
    var value = event.target.value;
    this.setState(state => {
      state.functionComments[name] = value;
      return state;
    });
  }

  displayFunctions() {
    if (this.props.libraryFunctions.length === 0) {
      return (
        <div>
          A library can only export functions. Your program does not have any
          functions to export.
        </div>
      );
    }

    var functions = this.props.libraryFunctions.map(libraryFunction => {
      var name = libraryFunction.name;
      var params = '(' + libraryFunction.params.join(', ') + ')';
      return (
        <div key={name} style={{display: 'flex'}}>
          <input
            type="checkbox"
            name={name}
            style={styles.checkbox}
            checked={this.state.selectedFunctions[name] || false}
            onChange={this.boxChecked(name)}
          />
          <span style={styles.functionName}>
            {name}
            {params}
          </span>
          {this.state.selectedFunctions[name] && (
            <textarea
              name={name}
              value={this.state.functionComments[name] || ''}
              onChange={this.commentAdded.bind(this, name)}
              style={styles.comment}
            />
          )}
        </div>
      );
    });

    return (
      <div>
        <div style={{margin: 4}}>
          Use the text boxes to add comments to your functions before sharing.
        </div>
        {functions}
      </div>
    );
  }

  displayShareLink = () => {
    var selectedFunctions = this.props.libraryFunctions.filter(
      libraryFunction => {
        return this.state.selectedFunctions[libraryFunction.name];
      }
    );
    var functionNames = selectedFunctions.map(
      selectedFunction => selectedFunction.name
    );
    var dropletConfig = selectedFunctions.map(selectedFunction => {
      var config = {
        func: this.props.libraryName + '.' + selectedFunction.name,
        description: this.state.functionComments[selectedFunction.name],
        category: 'Functions'
      };

      if (selectedFunction.params.length > 0) {
        config.params = selectedFunction.params;
        config.paletteParams = selectedFunction.params;
      }

      return config;
    });

    var library = {
      name: this.props.libraryName,
      functionNames: functionNames,
      dropletConfig: dropletConfig,
      source: this.props.librarySource
    };

    var libraryPilot = clientApi.create('/v3/librarypilot');
    libraryPilot.put(
      this.props.channelId,
      JSON.stringify(library),
      'library.json'
    );
    this.setState({showShareLink: true, shareLink: this.props.channelId});
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
            value={this.state.shareLink}
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
    libraryFunctions: state.libraryShareDialog.libraryFunctions,
    libraryName: state.libraryShareDialog.libraryName,
    librarySource: state.libraryShareDialog.librarySource
  }),
  dispatch => ({
    onClose() {
      dispatch(hideLibraryShareDialog());
    }
  })
)(PublishLibraryDialog);
