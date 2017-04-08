import React from 'react';
import $ from 'jquery';
import {
  Button,
  Alert,
  FormGroup,
} from 'react-bootstrap';

import DateConfirm from './DateConfirm';
import TravelInformation from './TravelInformation';
import PhotoRelease from './PhotoRelease';
import LiabilityWaiver from './LiabilityWaiver';
import Demographics from './Demographics';


export default class FacilitatorProgramRegistration extends React.Component {
  constructor(props) {
    super(props);

    this.pageComponents = [
      DateConfirm,
      TravelInformation,
      PhotoRelease,
      LiabilityWaiver,
      Demographics,
    ];

    this.state = {
      data: {},
      errors: [],
      currentPage: 0,
      submitting: false
    };
  }

  handleChange(newState) {
    const data = Object.assign({}, this.state.data, newState);
    console.log(data);
    this.setState({ data });
  }

  componentWillUpdate(nextProps, nextState) {
    // If we got new errors, navigate to the first page containing errors
    if (this.state.errors.length === 0 && nextState.errors.length > 0) {
      for (let i = 0; i < this.pageComponents.length; i++) {
        const pageFields = this.pageComponents[i].associatedFields;
        if (pageFields.some(field => nextState.errors.includes(field))) {
          nextState.currentPage = i;
          break;
        }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // If we got new errors, scroll to error message header
    if (prevState.errors.length === 0 && this.state.errors.length > 0) {
      $('html, body').animate({
        scrollTop: $("#errorFeedback").offset().top
      }, 200);
    }

    // If we just changed pages, scroll to top of form
    if (prevState.currentPage !== this.state.currentPage) {
      $('html, body').animate({
        scrollTop: $("#facilitatorProgramRegistrationForm").offset().top
      }, 200);
    }
  }

  handleSubmit(event) {
    this.setState({
      errors: [],
      submitting: true
    });

    $.ajax({
      method: "POST",
      url: this.props.apiEndpoint,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        form_data: this.state.data
      })
    }).done(() => {
      window.location.reload(true);
    }).fail(data => {
      this.setState({
        errors: data.responseJSON.errors.form_data
      });
    }).always(() => {
      this.setState({
        submitting: false
      });
    });

    event.preventDefault();
  }

  renderErrorFeedback() {
    if (this.state.errors.length) {
      return (
        <Alert id="errorFeedback" bsStyle="danger">
          <h3>Please correct the errors below.</h3>
        </Alert>
      );
    }
  }

  renderCurrentPage() {
    let PageComponent = this.pageComponents[this.state.currentPage];
    return (
      <PageComponent
        key={this.state.currentPage}
        options={this.props.options}
        onChange={this.handleChange.bind(this)}
        errors={this.state.errors}
        data={this.state.data}
      />
    );
  }

  nextPage() {
    let page = this.state.currentPage + 1;
    if (page > this.pageComponents.length - 1) {
      page = this.pageComponents.length - 1;
    }
    this.setState({
      currentPage: page
    });
  }

  prevPage() {
    let page = this.state.currentPage - 1;
    if (page < 0) {
      page = 0;
    }
    this.setState({
      currentPage: page
    });
  }

  renderControlButtons() {
    let backButton;
    if (this.state.currentPage > 0) {
      backButton = (
        <Button onClick={this.prevPage.bind(this)} style={{marginRight: 5}}>Back</Button>
      );
    }

    let nextButton = (
      <Button key="next" onClick={this.nextPage.bind(this)} bsStyle="primary">Next</Button>
    );
    if (this.state.data.confirmTrainingDate === "No" ||
        this.state.data.confirmTeacherconDate === 'No - I\'m no longer interested' ||
        this.state.currentPage === this.pageComponents.length - 1) {
      nextButton = (
        <Button
          key="submit"
          bsStyle="primary"
          type="submit"
          disabled={this.state.submitting}
        >
          Submit
        </Button>
      );
    }

    return (
      <FormGroup>
        {backButton}
        {nextButton}
      </FormGroup>
    );
  }

  render() {
    return (
      <form id="facilitatorProgramRegistrationForm" onSubmit={this.handleSubmit.bind(this)}>
        {this.renderErrorFeedback()}
        {this.renderCurrentPage()}
        {this.renderControlButtons()}
      </form>
    );
  }
}

FacilitatorProgramRegistration.propTypes = {
  apiEndpoint: React.PropTypes.string.isRequired,
  options: React.PropTypes.object.isRequired,
};
