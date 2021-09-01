/**
 * Loads an application from the API by a supplied applicationId
 * Upon load it will call the supplied onApplicationLoaded callback if present, (e.g. for redirects), then
 * renderApplication to render the loaded application data.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Spinner from '../components/spinner';
import $ from 'jquery';

export default class ApplicationLoader extends React.Component {
  static propTypes = {
    applicationId: PropTypes.string.isRequired,
    onApplicationLoaded: PropTypes.func,
    renderApplication: PropTypes.func,
    loadRawFormData: PropTypes.bool
  };

  state = {
    loading: true
  };

  UNSAFE_componentWillMount() {
    this.load();
  }

  componentWillUnmount() {
    this.abortLoad();
  }

  abortLoad() {
    if (this.loadRequest) {
      this.loadRequest.abort();
      this.loadRequest = null;
    }
  }

  load = () => {
    this.abortLoad();

    let url = `/api/v1/pd/applications/${this.props.applicationId}`;
    if (this.props.loadRawFormData) {
      url += '?raw_form_data=1';
    }

    this.loadRequest = $.ajax({
      method: 'GET',
      url
    })
      .done(applicationData => {
        this.setState({
          applicationData,
          loading: false
        });

        if (this.props.onApplicationLoaded) {
          this.props.onApplicationLoaded(applicationData);
        }
      })
      .fail(() => {
        this.setState({
          applicationData: null,
          loading: false
        });
      });
  };

  handleUpdate = applicationData => {
    this.setState({applicationData});
  };

  render() {
    if (this.state.loading) {
      return <Spinner />;
    } else if (!this.state.applicationData) {
      return <div>No application found.</div>;
    } else if (this.props.renderApplication) {
      return this.props.renderApplication({
        applicationData: this.state.applicationData,
        handleUpdate: this.handleUpdate
      });
    } else {
      return null;
    }
  }
}
