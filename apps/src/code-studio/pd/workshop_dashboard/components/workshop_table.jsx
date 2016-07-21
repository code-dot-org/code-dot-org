/*
  Table displaying workshop summaries based on a supplied query.
 */

import $ from 'jquery';
var _ = require('lodash');
import React from 'react';
var WorkshopTableRow = require('./workshop_table_row');
var Table = require('react-bootstrap').Table;

var WorkshopTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    queryUrl: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    canDelete: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      canEdit: false,
      canDelete: false
    };
  },

  getInitialState: function () {
    return {
      loading: true
    };
  },

  componentDidMount: function () {
    this.loadRequest = $.ajax({
        method: 'GET',
        url: this.props.queryUrl,
        dataType: 'json'
      })
      .done(function (data) {
        this.setState({
          loading: false,
          workshops: data
        });
      }.bind(this));
  },

  componentWillUnmount: function () {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
    if (this.deleteRequest) {
      this.deleteRequest.abort();
    }
  },

  handleView: function (workshop) {
    this.context.router.push('/workshops/' + workshop.id);
  },
  handleEdit: function (workshop) {
    this.context.router.push('/workshops/' + workshop.id + '/edit');
  },
  handleDelete: function (workshop_index, workshop) {
    this.deleteRequest = $.ajax({
        method: 'DELETE',
        url: '/api/v1/pd/workshops/' + workshop.id
      })
      .done(function () {
        var workshops = _.cloneDeep(this.state.workshops);
        workshops.splice(workshop_index, 1);
        this.setState({workshops: workshops});
      }.bind(this));
  },

  render: function () {
    if (this.state.loading) {
      return <i className="fa fa-spinner fa-pulse fa-3x" />;
    }

    if (this.state.workshops.length === 0) {
      return <p>None.</p>;
    }

    var tableRows = this.state.workshops.map(function (workshop, i) {
      return (
        <WorkshopTableRow
          workshop={workshop}
          key={workshop.id}
          onView={this.handleView}
          onEdit={this.props.canEdit ? this.handleEdit : null}
          onDelete={this.props.canDelete ? this.handleDelete.bind(this, i) : null}
        />
      );
    }.bind(this));
    return (
      <Table striped bordered condensed hover>
        <thead>
        <tr>
          <th>Date and Time</th>
          <th>Location</th>
          <th>Type</th>
          <th>Course</th>
          <th>Signups</th>
          <th>Facilitators</th>
          <th>Current State</th>
          <th>Manage</th>
        </tr>
        </thead>
        <tbody>
        {tableRows}
        </tbody>
      </Table>
    );
  }
});
module.exports = WorkshopTable;
