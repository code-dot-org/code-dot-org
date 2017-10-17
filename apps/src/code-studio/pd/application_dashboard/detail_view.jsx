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

class DetailViewContents extends React.Component {
  static propTypes = {
    applicationData: PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalScore: PropTypes.number,
      acceptance: PropTypes.oneOf(['accepted', 'rejected']).isRequired,
      locked: PropTypes.oneOf(['locked', 'unlocked']).isRequired,
      title: PropTypes.string,
      preferredFirstName: PropTypes.string,
      accountEmail: PropTypes.string.isRequired,
      alternateEmail: PropTypes.string,
      phone: PropTypes.string.isRequired,
      district: PropTypes.string,
      school: PropTypes.string,
      course: PropTypes.string.isRequired,
      regionalPartner: PropTypes.string,
      program: PropTypes.string.isRequired,
      planToTeachThisYear: PropTypes.string.isRequired,
      rateAbility: PropTypes.string.isRequired,
      canAttendFIT: PropTypes.string.isRequired
    })
  }

  state = {}

  handleCancelEditClick = () => {
    this.setState({
      editing: false
    });
  }

  handleEditClick = () => {
    this.setState({
      editing: true
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
          {this.props.applicationData.name}
        </h1>

        <div id="DetailViewHeader" style={{display: 'flex', marginLeft: 'auto'}}>
          <FormControl componentClass="select" disabled={!this.state.editing} placeholder={this.props.applicationData.acceptance}>
            <option value="accepted">
              Accepted
            </option>
            <option value="rejected">
              Rejected
            </option>
          </FormControl>
          <FormControl componentClass="select" disabled={!this.state.editing} placeholder={this.props.applicationData.acceptance}>
            <option value="locked">
              Locked
            </option>
            <option value="unlocked">
              Unlocked
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
        {renderLineItem('Title', this.props.applicationData.title)}
        {renderLineItem('Preferred First Name', this.props.applicationData.preferredFirstName)}
        {renderLineItem('Account Email', this.props.applicationData.accountEmail)}
        {renderLineItem('Alternate Email', this.props.applicationData.alternateEmail)}
        {renderLineItem('Phone', this.props.applicationData.phone)}
        <br/>
        {renderLineItem('District', this.props.applicationData.district)}
        {renderLineItem('School', this.props.applicationData.school)}
        {renderLineItem('Course', this.props.applicationData.course)}
        {renderLineItem('Regional Partner', this.props.applicationData.regionalPartner)}
      </div>
    );
  }

  renderChooseYourProgram = () => {
    return (
      <div>
        <h3>
          Choose Your Program
        </h3>
        {renderLineItem('Program', this.props.applicationData.program)}
        <Facilitator1819Program
          planToTeachThisYear1819={this.props.applicationData.planToTeachThisYear}
          rateAbility={this.props.applicationData.rateAbility}
          canAttendFIT={this.props.applicationData.canAttendFIT}
        />
      </div>
    );
  }

  render() {
    return (
      <div style={{backgroundColor: 'white'}}>
        {this.renderHeader()}
        {
          this.props.applicationData.totalScore && (
            <h2>
              {`Total Score: ${this.props.applicationData.totalScore}`}
            </h2>
          )
        }
        {this.renderAboutSection()}
        {this.renderChooseYourProgram()}
      </div>
    );
  }
}

export {DetailViewContents, renderLineItem};
