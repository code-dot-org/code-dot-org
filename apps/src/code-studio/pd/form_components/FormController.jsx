import React from 'react';
import $ from 'jquery';
import {
  Button,
  Alert,
  FormGroup,
  Pagination,
} from 'react-bootstrap';

const styles = {
  pageButtons: {
    verticalAlign: 'middle',
    margin: '0 10px'
  }
};

/**
 * Helper class for dashboard forms. Expects to be extended by a class which
 * will implement the getPageComponents method, which is expected to return an
 * array of components with extend from the FormComponent helper class.
 * Resulting form will then display those components paginated and in order,
 * with a submit button on the last page.
 *
 * @see FacilitatorProgramRegistration component for example usage.
 */
export default class FormController extends React.Component {
  constructor(props) {
    super(props);

    if (this.constructor === FormController) {
      throw new TypeError(`
        FormController is an abstract class; cannot construct instances directly
      `);
    }

    this.state = {
      data: {},
      errors: [],
      currentPage: 0,
      submitting: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
  }

  /**
   * @override
   */
  componentWillUpdate(nextProps, nextState) {
    // If we got new errors, navigate to the first page containing errors
    if (this.state.errors.length === 0 && nextState.errors.length > 0) {
      for (let i = 0; i < this.getPageComponents().length; i++) {
        const pageFields = this.getPageComponents()[i].associatedFields;
        if (pageFields.some(field => nextState.errors.includes(field))) {
          nextState.currentPage = i;
          break;
        }
      }
    }
  }

  /**
   * @override
   */
  componentDidUpdate(prevProps, prevState) {
    // If we got new errors or just changed pages, scroll to top of form
    const newErrors = prevState.errors.length === 0 && this.state.errors.length > 0;
    const newPage = prevState.currentPage !== this.state.currentPage;

    if (newErrors || newPage) {
      $('html, body').animate({
        scrollTop: $(this.form).offset().top
      }, 200);
    }
  }

  /**
   * Method to be overridden by inheriting classes; will define the pages of
   * this form by FormComponent instances.
   *
   * @returns {[FormComponent]}
   */
  getPageComponents() {
    throw new TypeError('must override FormController.getPageComponents');
  }

  /**
   * @returns {FormComponent}
   */
  getCurrentPageComponent() {
    return this.getPageComponents()[this.state.currentPage];
  }

  /**
   * Expects an object whose keys are the names of form inputs and whose values
   * reflect the new expected state of those inputs; intended to match the
   * format of the onChange handlers of ButtonList and FieldGroup
   *
   * @param {Object} newState
   */
  handleChange(newState) {
    const data = Object.assign({}, this.state.data, newState);
    this.setState({
      data
    });
  }

  /**
   * Assemble all data to be submitted
   *
   * @returns {Object}
   */
  serializeFormData() {
    return {
      form_data: this.state.data,
    };
  }

  /**
   * Called when we get a successful response from the API submission
   */
  onSuccessfulSubmit() {
    // Intentional noop; overridden by child classes
  }

  /**
   * Submit serialized form data to the specified API Endpoint and handle server
   * response
   *
   * @param {Event} event
   */
  handleSubmit(event) {
    // clear errors so we can more clearly detect "new" errors and toggle
    // submitting flag so we can prevent duplicate submission
    this.setState({
      errors: [],
      submitting: true
    });

    $.ajax({
      method: "POST",
      url: this.props.apiEndpoint,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(this.serializeFormData())
    }).done(() => {
      this.onSuccessfulSubmit();
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

  /**
   * @returns {Element|undefined}
   */
  renderErrorFeedback() {
    const pageFields = this.getCurrentPageComponent().associatedFields;
    if (!pageFields) {
      throw new TypeError(`
        Every PageComponent of a FormController must define an array
        PageComponent.associatedFields for error handling
      `);
    }

    if (pageFields.some(field => this.state.errors.includes(field))) {
      return (
        <Alert bsStyle="danger">
          <h3>Please correct the errors below.</h3>
        </Alert>
      );
    }
  }

  /**
   * @returns {Object}
   */
  getPageProps() {
    return {
      key: this.state.currentPage,
      options: this.props.options,
      onChange: this.handleChange,
      errors: this.state.errors,
      data: this.state.data
    };
  }

  /**
   * @returns {Element}
   */
  renderCurrentPage() {
    const PageComponent = this.getCurrentPageComponent();
    return (
      <PageComponent
        {...this.getPageProps()}
      />
    );
  }

  /**
   * switch to the next page in sequence, if it exists
   */
  nextPage() {
    const page = Math.min(
      this.state.currentPage + 1,
      this.getPageComponents().length - 1
    );

    this.setState({
      currentPage: page
    });
  }

  /**
   * switch to the previous page in sequence, if it exists
   */
  prevPage() {
    const page = Math.max(this.state.currentPage - 1, 0);

    this.setState({
      currentPage: page
    });
  }

  /**
   * switch to the specified page in sequence, if it exists
   */
  setPage(i) {
    const page = Math.min(
      Math.max(i, 0),
      this.getPageComponents().length - 1
    );

    this.setState({
      currentPage: page
    });
  }

  /**
   * @returns {boolean}
   */
  shouldShowSubmit() {
    return this.state.currentPage === this.getPageComponents().length - 1;
  }

  /**
   * @returns {Element}
   */
  renderControlButtons() {
    let backButton;
    if (this.state.currentPage > 0) {
      backButton = (
        <Button
          key="back"
          onClick={this.prevPage}
        >
          Back
        </Button>
      );
    }

    let nextButton = (
      <Button
        bsStyle="primary"
        key="next"
        onClick={this.nextPage}
      >
        Next
      </Button>
    );
    if (this.shouldShowSubmit()) {
      nextButton = (
        <Button
          bsStyle="primary"
          disabled={this.state.submitting}
          key="submit"
          type="submit"
        >
          Submit
        </Button>
      );
    }

    const pageButtons = (
      this.getPageComponents().length > 1 &&
      <Pagination
        style={styles.pageButtons}
        items={this.getPageComponents().length}
        activePage={this.state.currentPage + 1}
        onSelect={i => this.setPage(i - 1)} // eslint-disable-line react/jsx-no-bind
      />
    );

    return (
      <FormGroup className="text-center">
        {backButton}
        {pageButtons}
        {nextButton}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  render() {
    return (
      <form
        ref={form => {this.form = form;}}
        onSubmit={this.handleSubmit}
      >
        {this.renderErrorFeedback()}
        {this.renderCurrentPage()}
        {this.renderControlButtons()}
      </form>
    );
  }
}

FormController.propTypes = {
  apiEndpoint: React.PropTypes.string.isRequired,
  options: React.PropTypes.object.isRequired,
};
