/**
 * Loader for table displaying workshop summaries based on a supplied query.
 * It requires exactly one child component that expects workshops in its props.
 * It runs the query specified in queryUrl and passes resulting workshop data to the child
 * component or displays "None" if no workshops are returned.
 * It optionally handles deleting workshops.
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import FontAwesome from '../../../../templates/FontAwesome';

const WorkshopTableLoader = React.createClass({
  propTypes: {
    queryUrl: React.PropTypes.string.isRequired,
    canDelete: React.PropTypes.bool, // When true, sets child prop onDelete to this.handleDelete
    children: React.PropTypes.element.isRequired // Require exactly 1 child component.
  },

  getInitialState() {
    return {
      loading: true,
      workshops: null
    };
  },

  componentDidMount() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: this.props.queryUrl,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        workshops: data
      });
    });
  },

  componentWillUnmount() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
    if (this.deleteRequest) {
      this.deleteRequest.abort();
    }
  },

  handleDelete(workshopId) {
    this.deleteRequest = $.ajax({
      method: 'DELETE',
      url: '/api/v1/pd/workshops/' + workshopId
    })
    .done(() => {
      const workshops = _.reject(_.cloneDeep(this.state.workshops), w => w.id === workshopId);
      this.setState({workshops: workshops});
    });
  },

  render() {
    if (this.state.loading) {
      return <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>;
    }

    if (this.state.workshops.length === 0) {
      return <p>None.</p>;
    }

    return (
      React.cloneElement(this.props.children, {
        workshops: this.state.workshops,
        onDelete: this.props.canDelete ? this.handleDelete : null
      })
    );
  }
});
export default WorkshopTableLoader;
