import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {fetchProject} from './redux/screens';

const ImportProjectForm = React.createClass({

  propTypes: {
    onImport: React.PropTypes.func.isRequired,
    isFetching: React.PropTypes.bool,
    error: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      isFetching: false,
      error: false,
    };
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
        <button onClick={() => this.props.onImport(this.state.url)}
                disabled={this.props.isFetching}>
          {this.props.isFetching && <span className="fa fa-spin fa-spinner" />}
          Next
        </button>
        {this.props.error &&
         <p>
           We can't seem to find this project. Please make sure you've
           entered a valid App Lab project URL.
         </p>
        }
      </div>
    );
  }
});

export default ImportProjectForm;


if (BUILD_STYLEGUIDE) {
  window.React = React;
  var Dialog = require('../templates/DialogComponent');
  ImportProjectForm.styleGuideExamples = storybook => {
    storybook
      .storiesOf('ImportProjectForm', module)
      .addDecorator(story => (
        <Dialog hideBackdrop={true} isOpen={true} handleClose={() => null}>
          {story()}
        </Dialog>
      ))
      .addWithInfo(
        'On open',
        '',
        () => (
            <ImportProjectForm
                onImport={storybook.action("onImport")}
                isFetching={false} />
        )
      )
      .addWithInfo(
        'While fetching',
        '',
        () => (
          <ImportProjectForm
              onImport={storybook.action("onImport")}
              isFetching={true} />
        )
      )
      .addWithInfo(
        'Error Fetching',
        '',
        () => (
          <ImportProjectForm
              onImport={storybook.action("onImport")}
              error={true} />
        )
      );
  };
}
