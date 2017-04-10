import React from 'react';
import $ from 'jquery';
import {
  Button,
  ControlLabel,
  Alert,
  FormGroup,
} from 'react-bootstrap';
import TravelInformation from './TravelInformation';
import ProgramRegistrationComponent from './ProgramRegistrationComponent';

class DeclineTrainingDate extends ProgramRegistrationComponent {
  renderNext() {
    let followup;
    if (this.state.data.declineTrainingDate === 'I want to participate in the program, but I\'m no longer able to attend these dates.') {
      let name;
      console.log("TODO: determine if CSD or CSP");
      let type = 'csd';
      if (type === 'csd') {
        name = "csdAlternateTrainingDate";
      } else if (type === 'csp') {
        name = "cspAlternateTrainingDate";
      }
      followup = this.buildButtonsFromOptions(
        name,
        "I am instead available to attend the following Facilitator-in-Training workshop (TeacherCon Part 2):",
        'check'
      );
    }

    return (
      <FormGroup>
        {followup}
        <p>
          Thank you for letting us know. You do not need to complete the rest of
          this form. Please click to submit your form.
        </p>
        <Button bsStyle="primary" type="submit">
          Submit
        </Button>
      </FormGroup>
    );

  }

  render() {
    return (
      <FormGroup>
        {this.buildButtonsFromOptions(
          'declineTrainingDate',
          'Why Not?',
          'radio'
        )}
        {this.renderNext()}
      </FormGroup>
    );
  }
}

class TrainingDateConfirm extends ProgramRegistrationComponent {
  renderNext() {
    if (this.state.data.confirmTrainingDate === "Yes") {
      return (
        <TravelInformation
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.props.errors}
        />
      );
    } else if (this.state.data.confirmTrainingDate === "No") {
      return (
        <DeclineTrainingDate
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.props.errors}
        />
      );
    }
  }

  render() {
    return (
      <FormGroup>
        {this.buildButtonsFromOptions(
          "confirmTrainingDate",
          "Your assigned Facilitator in Training date is: <Facilitator in Training dates & location>. Please confirm you can make your assigned Facilitator in Training.",
          "radio"
        )}
        {this.renderNext()}
      </FormGroup>
    );
  }
}

class ConfirmationQuestions extends ProgramRegistrationComponent {
  renderNext() {
    if (this.state.data.confirmTeacherconDate === "Yes") {
      return (
        <TrainingDateConfirm
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.props.errors}
        />
      );
    } else if (this.state.data.confirmTeacherconDate === 'No - but I need to attend a different date.') {
      const label = `
        I want to participate in the program, but I’m no longer able to attend
        these dates. I am instead available to attend the following:
      `;
      return (
        <div>
          {this.buildButtonsFromOptions('alternateTeacherconDate', label, 'check')}
          <TrainingDateConfirm
            options={this.props.options}
            onChange={this.handleChange.bind(this)}
            errors={this.props.errors}
          />
        </div>
      );
    } else if (this.state.data.confirmTeacherconDate === 'No - I\'m no longer interested') {
      return (
        <FormGroup>
          <ControlLabel>I am no longer interested in the Code.org Facilitator Development Program.</ControlLabel>
          <FormGroup>
            <Button bsStyle="primary" type="submit">
              Submit
            </Button>
          </FormGroup>
        </FormGroup>
      );
    }
  }

  renderErrorFeedback() {
    if (this.props.errors.length) {
      return (
        <Alert id="errorFeedback" bsStyle="danger">
          <h3>Please correct the errors below.</h3>
        </Alert>
      );
    }
  }

  render() {
    return (
      <FormGroup>
        {this.renderErrorFeedback()}
        {this.buildButtonsFromOptions(
          "confirmTeacherconDate",
          "Your assigned summer training is TeacherCon <TeacherCon dates & location>. Please confirm you can make your assigned TeacherCon training",
          "radio"
        )}
        {this.renderNext()}
      </FormGroup>
    );
  }
}

export default class FacilitatorProgramRegistration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      errors: []
    };
  }

  handleChange(newState) {
    const data = Object.assign({}, this.state.data, newState);
    console.log(data);
    this.setState({ data });
  }

  componentDidUpdate(prevProps, prevState) {
    // If we got new errors, scroll to error message header
    if (prevState.errors.length === 0 && this.state.errors.length > 0) {
      $('html, body').animate({
        scrollTop: $("#errorFeedback").offset().top
      }, 200);
    }
  }

  handleSubmit(event) {
    console.log(this.state.data);
    this.setState({
      errors: []
    });
    $.ajax({
      method: "POST",
      url: this.props.apiEndpoint,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({form_data: this.state.data})
    }).done(() => {
      window.location.reload(true);
    }).fail(data => {
      this.setState({
        errors: data.responseJSON.errors.form_data
      });
    });
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <ConfirmationQuestions
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.state.errors}
        />
      </form>
    );
  }
}

FacilitatorProgramRegistration.propTypes = {
  apiEndpoint: React.PropTypes.string.isRequired,
  options: React.PropTypes.object.isRequired,
};
