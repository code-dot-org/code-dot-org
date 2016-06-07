import React from 'react';
import {connect} from 'react-redux';

import Dialog from '../templates/DialogComponent';
import {toggleImportScreen} from './redux/screens';


var ImportLinkForm = React.createClass({

  propTypes: {
    onLinkSubmitted: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      url: '',
    };
  },

  render() {
    return (
      <div>
        <h1>Import screens</h1>
        <p>
          Copy the share link of the app you would like to import screens
          from. Paste in the URL of that app below and click "Next."
          <a>Learn More</a>
        </p>
        <input type="text"
               value={this.state.url}
               onChange={event => this.setState({url: event.target.value})}/>
        <button onClick={() => this.props.onLinkSumbitted(this.state.url)}>Next</button>
      </div>
    );
  }
});

const ImportDialog = React.createClass({
  propTypes: Dialog.propTypes,

  render() {
    return (
      <Dialog {...this.props}>
        <ImportLinkForm onLinkSubmitted={function () {}} />
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
