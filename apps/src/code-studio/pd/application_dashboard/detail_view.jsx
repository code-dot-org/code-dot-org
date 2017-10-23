/**
 * Application Dashboard detail view
 * Route: /csd_facilitators/(:applicationId)
 *        /csd_teachers/(:applicationId)
 *        /csp_facilitators/(:applicationId)
 *        /csp_teachers/(:applicationId)
 */

import React, {PropTypes} from 'react';
import {Button, FormControl} from 'react-bootstrap';
import {Facilitator1819Program} from './detail_view_facilitator_specific_components';
import Spinner from '../workshop_dashboard/components/spinner';
import $ from 'jquery';


const renderLineItem = (key, value) => {
  return value && (
    <div>
      <span style={{fontFamily: '"Gotham 7r"', marginRight: '10px'}}>
        {key}:
      </span>
      {value}
    </div>
  );
};

class DetailView extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired
  }

  state = {
    loading: true
  }

  componentWillMount() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications/${this.props.params.applicationId}`
    }).done(data => {
      const formData = JSON.parse(data.form_data);
      this.setState({
        data: Object.assign({}, data, {formData: formData}),
        loading: false
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (<Spinner/>);
    } else {
      return (
        (
          <DetailViewContents
            applicationData={this.state.data}
          />
        )
      );
    }
  }
}

class DetailViewContents extends React.Component {
  static propTypes = {
    applicationData: PropTypes.shape({
      regional_partner_name: PropTypes.string,
      notes: PropTypes.string,
      status: PropTypes.string.isRequired,
      school_name: PropTypes.string,
      district_name: PropTypes.string,
      email: PropTypes.string,
      formData: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        title: PropTypes.string,
        phone: PropTypes.string,
        preferredFirstName: PropTypes.string,
        accountEmail: PropTypes.string,
        alternateEmail: PropTypes.string,
        program: PropTypes.string.isRequired,
        planOnTeaching: PropTypes.arrayOf(PropTypes.string.isRequired),
        abilityToMeetRequirements: PropTypes.string.isRequired,
      })
    }),
  }

  state = {
    status: this.props.applicationData.status
  }

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      status: this.props.applicationData.status
    });
  }

  handleEditClick = () => {
    this.setState({
      editing: true
    });
  }

  handleStatusChange = (event) => {
    this.setState({
      status: event.target.value
    });
  }

  renderEditButtons = () => {
    if (this.state.editing) {
      return [(
          <Button bsStyle="primary">
            Save
          </Button>
        ), (
          <Button onClick={this.handleCancelEditClick}>
            Cancel
          </Button>
        )
      ];
    } else {
      return (
        <Button onClick={this.handleEditClick}>
          Edit
        </Button>
      );
    }
  }

  renderHeader = () => {
    return (
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <h1>
          {`${this.props.applicationData.formData.firstName} ${this.props.applicationData.formData.lastName}`}
        </h1>

        <div id="DetailViewHeader" style={{display: 'flex', marginLeft: 'auto'}}>
          <FormControl
            componentClass="select"
            disabled={!this.state.editing}
            value={this.state.status}
            onChange={this.handleStatusChange}
          >
            <option value="accepted">
              Accepted
            </option>
            <option value="rejected">
              Rejected
            </option>
          </FormControl>
          {
            this.state.editing ? [(
                <Button bsStyle="primary" key="save">
                  Save
                </Button>
              ), (
                <Button onClick={this.handleCancelEditClick} key="cancel">
                  Cancel
                </Button>
              )
            ] : (
              <Button onClick={this.handleEditClick}>
                Edit
              </Button>
            )
          }
        </div>
      </div>
    );
  }

  renderAboutSection = () => {
    return (
      <div>
        <h3>
          About You
        </h3>
        {renderLineItem('Title', this.props.applicationData.formData.title)}
        {renderLineItem('Preferred First Name', this.props.applicationData.formData.preferredFirstName)}
        {renderLineItem('Account Email', this.props.applicationData.email)}
        {renderLineItem('Alternate Email', this.props.applicationData.formData.alternateEmail)}
        {renderLineItem('Phone', this.props.applicationData.formData.phone)}
        <br/>
        {renderLineItem('District', this.props.applicationData.district_name)}
        {renderLineItem('School', this.props.applicationData.school_name)}
        {renderLineItem('Course', this.props.applicationData.formData.program)}
        {renderLineItem('Regional Partner', this.props.applicationData.regional_partner_name)}
      </div>
    );
  }

  renderChooseYourProgram = () => {
    return (
      <div>
        <h3>
          Choose Your Program
        </h3>
        {renderLineItem('Program', this.props.applicationData.formData.program)}
        <Facilitator1819Program
          planToTeachThisYear1819={this.props.applicationData.formData.planOnTeaching}
          abilityToMeetRequirements={this.props.applicationData.formData.abilityToMeetRequirements}
        />
      </div>
    );
  }

  renderNotes() {
    return (
      <div>
        <h4>
          Notes
        </h4>
        <FormControl disabled={true} componentClass="textarea" value={this.props.applicationData.notes || ''}/>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderAboutSection()}
        {this.renderChooseYourProgram()}
        {this.renderNotes()}
      </div>
    );
  }
}

export {DetailView, DetailViewContents, renderLineItem};
