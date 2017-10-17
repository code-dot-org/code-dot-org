/**
 * Application Dashboard detail view
 * Route: /csd_facilitators/(:applicationId)
 *        /csd_teachers/(:applicationId)
 *        /csp_facilitators/(:applicationId)
 *        /csp_teachers/(:applicationId)
 */

import React, {PropTypes} from 'react';
import {Button, FormControl} from 'react-bootstrap';
import _ from 'lodash';
import {Facilitator1819Program} from './detail_view_facilitator_specific_components';


export default class DetailView extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired
  };

  render() {
    return (
      <div>
        Detail view!
      </div>
    );
  }
}

const lineItemKeys = {
  planToTeachThisYear1819: 'Do you plan on teaching this course in the 2018-19 school year?',
  rateAbility: 'How would you rate your ability to meet the requirements for your focus area?',
  canAttendFIT: 'Can attend FIT Training?'
};

const renderLineItem = (key, value) => {
  return value && (
    <div>
      <span style={{fontFamily: '"Gotham 7r"', marginRight: '10px'}}>
        {lineItemKeys[key] || _.startCase(key)}:
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
      alternateEmail: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      district: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      regionalPartner: PropTypes.string.isRequired,
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
      <div style={{display: 'flex', alignItems: 'center'}}>
        <h1>
          {this.props.applicationData.name}
        </h1>

        <div style={{float: 'right', display: 'flex'}}>
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
        {renderLineItem('title', this.props.applicationData.title)}
        {renderLineItem('preferredFirstName', this.props.applicationData.preferredFirstName)}
        {renderLineItem('accountEmail', this.props.applicationData.accountEmail)}
        {renderLineItem('alternateEmail', this.props.applicationData.alternateEmail)}
        {renderLineItem('phone', this.props.applicationData.phone)}
        <br/>
        {renderLineItem('district', this.props.applicationData.district)}
        {renderLineItem('school', this.props.applicationData.school)}
        {renderLineItem('course', this.props.applicationData.course)}
        {renderLineItem('regionalPartner', this.props.applicationData.regionalPartner)}
      </div>
    );
  }

  renderChooseYourProgram = () => {
    return (
      <div>
        <h3>
          Choose Your Program
        </h3>
        {renderLineItem('program', this.props.applicationData.program)}
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
