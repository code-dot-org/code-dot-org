/**
 * Table displaying workshop summaries based on a supplied query.
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import {Button} from 'react-bootstrap';
import {Table, resolve} from 'reactabular';
import SessionTimesList from './session_times_list';
import FacilitatorsList from './facilitators_list';
import WorkshopManagement from './workshop_management';

const WorkshopTable = React.createClass({
  propTypes: {
    queryUrl: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    canDelete: React.PropTypes.bool,
    showSignupUrl: React.PropTypes.bool,
    showOrganizer: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      canEdit: false,
      canDelete: false,
      showSignupUrl: false,
      showOrganizer: false
    };
  },

  getInitialState() {
    return {
      loading: true
    };
  },

  formatSessions(sessions) {
    return <SessionTimesList sessions={sessions}/>;
  },

  formatOrganizer(organizer) {
    return `${organizer.name} (${organizer.email})`;
  },

  formatFacilitators(facilitators) {
    return <FacilitatorsList facilitators={facilitators} />;
  },

  formatSignupUrl(workshopId) {
    const signupUrl = `${location.origin}/pd/workshops/${workshopId}/enroll`;
    return (
      <a href={signupUrl} target="_blank">
        {signupUrl}
      </a>
    );
  },

  formatManagement(workshopId) {
    return (
      <WorkshopManagement
        workshopId={workshopId}
        viewUrl={`/workshops/${workshopId}`}
        editUrl={this.props.canEdit ? `/workshops/${workshopId}/edit` : null}
        onDelete={this.props.canDelete ? this.handleDelete : null}
      />
    );
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
      return <i className="fa fa-spinner fa-pulse fa-3x"/>;
    }

    if (this.state.workshops.length === 0) {
      return <p>None.</p>;
    }

    const rows = _.map(_.cloneDeep(this.state.workshops),
      row => _.merge(row, {
        signups: `${row.enrolled_teacher_count} / ${row.capacity}`
      })
    );

    let columns = [];
    columns.push({
      property: 'sessions',
      header: {
        label: 'Date and Time'
      },
      cell: {
        format: this.formatSessions
      }
    }, {
      property: 'location_name',
      header: {
        label: 'Location'
      }
    }, {
      property: 'workshop_type',
      header: {
        label: 'Type'
      }
    }, {
      property: 'course',
      header: {
        label: 'Course'
      }
    }, {
      property: 'signups',
      header: {
        label: 'Signups'
      }
    });

    if (this.props.showOrganizer) {
      columns.push({
        property: 'organizer',
        header: {
          label: 'Organizer'
        },
        cell: {
          format: this.formatOrganizer
        }
      });
    }

    columns.push({
      property: 'facilitators',
      header: {
        label: 'Facilitators'
      },
      cell: {
        format: this.formatFacilitators
      }
    }, {
      property: 'state',
      header: {
        label: 'Current State'
      }
    });

    if (this.props.showSignupUrl) {
      columns.push({
        property: 'id',
        header: {
          label: 'Signup Url'
        },
        cell: {
          format: this.formatSignupUrl
        }
      });
    }

    columns.push({
      property: 'id',
      header: {
        label: 'Manage'
      },
      cell: {
        format: this.formatManagement
      }
    });

    return (
      <Table.Provider
        className="table table-striped table-condensed"
        columns={columns}
      >
        <Table.Header />
        <Table.Body rows={rows} rowKey="id"/>
      </Table.Provider>
    );
  }
});
export default WorkshopTable;
