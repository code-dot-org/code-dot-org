/**
 * Table displaying workshop summaries based on a supplied query.
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import WorkshopTableRow from './workshop_table_row';
import {Table} from 'react-bootstrap';

const WorkshopTable = React.createClass({
  propTypes: {
    queryUrl: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    canDelete: React.PropTypes.bool,
    showSignupUrl: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      canEdit: false,
      canDelete: false,
      showSignupUrl: false
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

  handleDelete(workshop_index, workshop) {
    this.deleteRequest = $.ajax({
        method: 'DELETE',
        url: '/api/v1/pd/workshops/' + workshop.id
      })
      .done(() => {
        const workshops = _.cloneDeep(this.state.workshops);
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

    const tableRows = this.state.workshops.map((workshop, i) => {
      return (
        <WorkshopTableRow
          workshop={workshop}
          key={workshop.id}
          viewUrl={`/workshops/${workshop.id}`}
          editUrl={this.props.canEdit ? `/workshops/${workshop.id}/edit` : null}
          onDelete={this.props.canDelete ? this.handleDelete.bind(this, i) : null}
          showSignupUrl={this.props.showSignupUrl}
        />
      );
    });

    const signupUrlHeader = this.props.showSignupUrl ? <th>Signup Url</th> : null;
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
          {signupUrlHeader}
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
