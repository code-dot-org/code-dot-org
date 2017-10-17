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
      regionalPartner: PropTypes.string.isRequired
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

  renderLineItem = (key) => {
    return this.props.applicationData[key] && (
      <div>
        <span style={{fontFamily: '"Gotham 7r"'}}>{_.startCase(key)}:  </span>
        {this.props.applicationData[key]}
      </div>
    );
  }

  renderAboutSection = () => {
    return (
      <div>
        <h3>
          About You
        </h3>
        {this.renderLineItem('title')}
        {this.renderLineItem('preferredFirstName')}
        {this.renderLineItem('accountEmail')}
        {this.renderLineItem('alternateEmail')}
        {this.renderLineItem('phone')}
        <br/>
        {this.renderLineItem('district')}
        {this.renderLineItem('school')}
        {this.renderLineItem('course')}
        {this.renderLineItem('regionalPartner')}
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
      </div>
    );
  }
}

export {DetailViewContents};
