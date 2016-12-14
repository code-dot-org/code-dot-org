import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';

import {ButtonList} from '../form_components/button_list.jsx';
import SummerWorkshopSchedule from './SummerWorkshopSchedule';

export default React.createClass({

  displayName: 'SummerProgramContent',
  propTypes: {
    onChange: PropTypes.func.isRequired,
    formData: PropTypes.shape({
      committedToSummer: PropTypes.string,
      ableToAttendAssignedSummerWorkshop: PropTypes.string
    }).isRequired,
    errorData: PropTypes.shape({
      committedToSummer: PropTypes.string,
      ableToAttendAssignedSummerWorkshop: PropTypes.string
    }).isRequired,
    regionalPartnerGroup: PropTypes.string,
    selectedCourse: PropTypes.string,
    selectedState: PropTypes.string
  },

  getInitialState() {
    return {
      dialogWasDismissed: false,
    };
  },

  radioButtonListChange(event) {
    this.props.onChange({[event.target.name]: event.target.value});
  },

  dismissDialog() {
    this.setState({dialogWasDismissed: true});
  },

  cancelApplication() {
    window.location.href = '/pd/teacher_application/thanks';
  },

  render() {
    const showDialog = this.props.formData.committedToSummer && this.props.formData.committedToSummer !== 'Yes' && !this.state.dialogWasDismissed;

    return (
      <div id="summerProgramContent">
        <div style={{fontWeight: 'bold'}}>
          As a reminder, teachers in this program are required to participate in:
          <li>
            One five-day summer workshop in 2017
          </li>
          <li>
            Four one-day local workshops during the 2017 - 18 school year (typically held on Saturdays)
          </li>
          <li>
            20 hours of online professional development during the 2017 - 18 school year
          </li>
          <ButtonList
            type="radio"
            label="Are you committed to participating in the entire program?"
            groupName="committedToSummer"
            answers={['Yes', 'No']}
            includeOther
            onChange={this.radioButtonListChange}
            selectedItems={this.props.formData.committedToSummer}
            required
            errorText={this.props.errorData.committedToSummer}
          />
          <Modal show={showDialog} onHide={this.dismissDialog} style={{width: 560}}>
            <Modal.Body>
              We are currently only able to offer spaces to applicants who are able to participate in the entire professional learning program. Please note that if you would like to continue this application in case your availability changes, we will add you to our waitlist and consider your application at the end of our review period.
              <br />
              <br />
              Would you like to continue your application?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.dismissDialog} bsStyle="primary">
                Yes, Continue Application
              </Button>
              <Button onClick={this.cancelApplication}>
                No
              </Button>
            </Modal.Footer>
          </Modal>
          <SummerWorkshopSchedule
            regionalPartnerGroup={this.props.regionalPartnerGroup}
            selectedCourse={this.props.selectedCourse}
            selectedState={this.props.selectedState}
          />
          <ButtonList
            type="radio"
            label="Are you able to attend your assigned summer workshop?"
            groupName="ableToAttendAssignedSummerWorkshop"
            answers={['Yes', 'No']}
            includeOther
            onChange={this.radioButtonListChange}
            selectedItems={this.props.formData.ableToAttendAssignedSummerWorkshop}
            required
            errorText={this.props.errorData.ableToAttendAssignedSummerWorkshop}
          />
        </div>
      </div>
    );
  }
});
