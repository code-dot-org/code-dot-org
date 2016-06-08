import React from 'react';

import {
  sources as sourcesApi,
  channels as channelsApi,
} from '../clientApi';

export default React.createClass({

  propTypes: {
    onProjectFetched: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      url: '',
      error: null,
      fetching: false,
    };
  },

  validateLink() {
    var sources;
    var channel;
    var errorText = "We can't seem to find this project. " +
                    "Please make sure you've entered a valid App Lab project URL.";
    var match = this.state.url.match(/projects\/applab\/([^\/]+)/);
    var onError = () => this.setState({error: errorText, fetching: false});
    var onSuccess = () => {
      if (sources && channel) {
        this.setState({fetching: false});
        this.props.onProjectFetched({channel, sources});
      }
    };

    if (match) {
      var projectId = match[1];
      this.setState({fetching: true});
      // TODO: this is not safe at all because sourcesApi is a global
      // and other callers might rely on project id not being set.
      channelsApi.setProjectId(projectId).ajax(
        'GET',
        '',
        xhr => {
          channel = JSON.parse(xhr.response);
          onSuccess();
        },
        onError
      );
      sourcesApi.setProjectId(projectId).ajax(
        'GET',
        'main.json',
        xhr => {
          sources = JSON.parse(xhr.response);
          onSuccess();
        },
        onError
      );
    } else {
      onError();
    }
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
               onChange={event => this.setState({error: null, url: event.target.value})}/>
        <button onClick={this.validateLink} disabled={this.state.fetching}>
          {this.state.fetching && <span className="fa fa-spin fa-spinner" />}
          Next
        </button>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
});
