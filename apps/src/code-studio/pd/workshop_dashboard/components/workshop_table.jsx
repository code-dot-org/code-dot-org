/**
 * Table displaying workshop summaries based on a supplied query.
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import WorkshopTableRow from './workshop_table_row';
import {Table} from 'react-bootstrap';

var WorkshopTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    queryUrl: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    canDelete: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      canEdit: false,
      canDelete: false
    };
  },

  getInitialState() {
    return {
      loading: true
    };
  },

  componentDidMount() {
    this.loadRequest = $.ajax({
        method: 'GET',
        url: this.props.queryUrl,
        dataType: 'json'
      })
      .done((data) => {
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

  handleView(workshop) {
    this.context.router.push('/workshops/' + workshop.id);
  },
  handleEdit(workshop) {
    this.context.router.push('/workshops/' + workshop.id + '/edit');
  },
  handleDelete(workshop_index, workshop) {
    this.deleteRequest = $.ajax({
        method: 'DELETE',
        url: '/api/v1/pd/workshops/' + workshop.id
      })
      .done(() => {
        var workshops = _.cloneDeep(this.state.workshops);
        workshops.splice(workshop_index, 1);
        this.setState({workshops: workshops});
      });
  },

  render() {
    if (this.state.loading) {
      return <i className="fa fa-spinner fa-pulse fa-3x" />;
    }

    if (this.state.workshops.length === 0) {
      return <p>None.</p>;
    }

    var tableRows = this.state.workshops.map((workshop, i) => {
      return (
        <WorkshopTableRow
          workshop={workshop}
          key={workshop.id}
          onView={this.handleView}
          onEdit={this.props.canEdit ? this.handleEdit : null}
          onDelete={this.props.canDelete ? this.handleDelete.bind(this, i) : null}
        />
      );
    });
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
export default WorkshopTable;
