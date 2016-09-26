/**
 * Loader for table displaying workshop summaries based on a supplied query.
 * It runs the query specified in queryUrl and displays the resulting workshop data in a
 * WorkshopTable or "None" if no workshops are returned.
 * It optionally handles deleting workshops.
 */

import $ from 'jquery';
import _, {orderBy} from 'lodash';
import React from 'react';
import SurveyResults from './survey_results';
import WorkshopTable from './workshop_table';
import FontAwesome from '../../../../templates/FontAwesome';

const WorkshopTableLoader = React.createClass({
  propTypes: {
    queryUrl: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    canDelete: React.PropTypes.bool,
    showSignupUrl: React.PropTypes.bool,
    showOrganizer: React.PropTypes.bool,
    componentToLoad: React.PropTypes.string,
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

    if (this.props.componentToLoad == 'surveyResults') {
      return (
        <SurveyResults
          workshops={this.state.workshops}
          />
      );
    }

    return (
      <WorkshopTable
        workshops={this.state.workshops}
        canEdit={this.props.canEdit}
        onDelete={this.props.canDelete ? this.handleDelete : null}
        showSignupUrl={this.props.showSignupUrl}
        showOrganizer={this.props.showOrganizer}
        />
    );
  }
});
export default WorkshopTableLoader;

