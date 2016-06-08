import React from 'react';

import {sources as sourcesApi} from '../clientApi';

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
    var match = this.state.url.match(/projects\/applab\/([^\/]+)/);
    if (match) {
      var projectId = match[1];
      this.setState({fetching: true});
      // TODO: this is not safe at all because sourcesApi is a global
      // and other callers might rely on project id not being set.
      sourcesApi.setProjectId(projectId).ajax(
        'GET',
        'main.json',
        xhr => {
          this.setState({fetching: false});
          this.props.onProjectFetched(JSON.parse(xhr.response));
        },
        () => {
          this.setState({
            error: "We can't seem to find this project. " +
                   "Please make sure you've entered a valid App Lab project URL.",
            fetching: false
          });
        }
      );
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
               onChange={event => this.setState({url: event.target.value})}/>
        <button onClick={this.validateLink} disabled={this.state.fetching}>
          {this.state.fetching && <span className="fa fa-spin fa-spinner" />}
          Next
        </button>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
});
