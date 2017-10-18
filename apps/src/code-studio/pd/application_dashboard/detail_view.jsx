/**
 * Application Dashboard detail view
 * Route: /csd_facilitators/(:applicationId)
 *        /csd_teachers/(:applicationId)
 *        /csp_facilitators/(:applicationId)
 *        /csp_teachers/(:applicationId)
 */

import React, {PropTypes} from 'react';
import {Button, FormControl, Table} from 'react-bootstrap';
import {Facilitator1819Program} from './detail_view_facilitator_specific_components';
import _ from 'lodash';

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
      canAttendFIT: PropTypes.string.isRequired,
      responsesForSections: PropTypes.arrayOf(PropTypes.shape({
        sectionName: PropTypes.string.isRequired,
        responses: PropTypes.arrayOf(PropTypes.shape({
          question: PropTypes.element.isRequired,
          answer: PropTypes.string.isRequired,
          score: PropTypes.number.isRequired
        }))
      })),
      notes: PropTypes.string.isRequired
    })
  }

  state = {
    acceptance: this.props.applicationData.acceptance
  }

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      acceptance: this.props.applicationData.acceptance
    });
  }

  handleEditClick = () => {
    this.setState({
      editing: true
    });
  }

  handleAcceptanceChange = (event) => {
    this.setState({
      acceptance: event.target.value
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
          <FormControl
            componentClass="select"
            disabled={!this.state.editing}
            value={this.state.acceptance}
            onChange={this.handleAcceptanceChange}
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

  renderQuestionResponses = () => {
    return this.props.applicationData.responsesForSections.map((section, i) => {
      return (
        <div key={i}>
          <h4>
            {section.sectionName}
          </h4>
          <Table bordered hover>
            <thead>
              <tr>
                <th>
                  Question
                </th>
                <th style={{width: '15%'}}>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {
                section.responses.map((response, j) => {
                  return (
                    <tr>
                      <td>
                        {response.question}
                        <br/>
                        {response.answer}
                      </td>
                      <td>
                        <FormControl disabled componentClass="select" value={response.score}>
                          {
                            _.range(1,6).map((score) => {
                              return (
                                <option key={score} value={score}>
                                  {score}
                                </option>
                              );
                            })
                          }
                        </FormControl>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </Table>
        </div>
      );
    });
  }

  renderNotes() {
    return (
      <div>
        <h4>
          Notes
        </h4>
        <FormControl disabled={true} componentClass="textarea">
          {this.props.applicationData.notes}
        </FormControl>
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
        {this.renderQuestionResponses()}
        {this.renderNotes()}
      </div>
    );
  }
}

export {DetailViewContents, renderLineItem};
