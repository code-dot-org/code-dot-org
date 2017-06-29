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
      errorHeader: null,
      globalError: false,
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
        if (this.pageHasError(i, nextState.errors)) {
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
    // If we got new errors or just changed pages, scroll to top of the page
    const newErrors = prevState.errors.length < this.state.errors.length;
    const newPage = prevState.currentPage !== this.state.currentPage;

    if (newErrors || newPage) {
      $('html, body').animate({
        scrollTop: 0
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
    // clear any errors for newly changed fields
    const newFields = Object.keys(newState);
    const errors = this.state.errors.filter(error => !newFields.includes(error));

    // update state with new data
    const data = Object.assign({}, this.state.data, newState);
    this.setState({
      data,
      errors
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
      errorHeader: null,
      globalError: false,
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
      if (data.responseJSON &&
          data.responseJSON.errors &&
          data.responseJSON.errors.form_data) {
        // if the failure was a result of an invalid form, highlight the errors
        // and display the generic error header
        this.setState({
          errors: data.responseJSON.errors.form_data,
          errorHeader: "Please correct the errors below."
        });
      } else {
        // Otherwise, something unknown went wrong on the server
        this.setState({
          globalError: true,
          errorHeader: "Something went wrong on our end; please try again later."
        });
      }
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
    const shouldShowError = this.state.errorHeader &&
      (this.state.globalError || this.pageHasError());

    if (shouldShowError) {
      return (
        <Alert bsStyle="danger">
          <h3>{this.state.errorHeader}</h3>
        </Alert>
      );
    }
  }

  /**
   * Determines if a given page (defaults to current page) is responsible for any
   * of the given errors (defaults to current state errors).
   *
   * Note that for purposes of page errors, error strings like
   * "fieldName[some_extra_data]" will be normalized to "fieldName"
   *
   * @param {number} [page=this.state.currentPage] which page to examine
   * @param {String[]} [errors=this.state.errors] which errors to consider
   *
   * @returns {boolean}
   */
  pageHasError(page=this.state.currentPage, errors=this.state.errors) {
    const pageFields = this.getPageComponents()[page].associatedFields;
    if (!pageFields) {
      throw new TypeError(`
        Every PageComponent of a FormController must define an array
        PageComponent.associatedFields for error handling
      `);
    }

    // When using VariableFormGroups that allow for nesting questions, the
    // errors returned from the server can include state-specific data like
    // "howInteresting[facilitator_name]". This is great for being able to flag
    // the specific question on the page, but for purposes of determining which
    // page a given error is on we really only care about the "howInteresting"
    // key, not the "facilitator_name" data.
    const flattenedErrors = errors.map(e => e.replace(/\[[^\]]*\]/, ''));
    return pageFields.some(field => flattenedErrors.includes(field));
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
   * Getter method for required field validation, so that inheriting classes can
   * support conditionally-required fields
   * @returns {String[]}
   */
  getRequiredFields() {
    return this.props.requiredFields;
  }

  /**
   * checks the data collected so far against the required fields and the fields
   * for this page, to make sure that all required fields on this page have been
   * filled out. Flags any such fields with an error, and returns a boolean
   * indicating whether any were found.
   *
   * @return {boolean} true if this page is valid, false if any required fields
   *         are missing
   */
  validateCurrentPageRequiredFields() {
    const requiredFields = this.getRequiredFields();
    const pageFields = this.getCurrentPageComponent().associatedFields;
    const pageRequiredFields = pageFields.filter(f => requiredFields.includes(f));
    const missingRequiredFields = pageRequiredFields.filter(f => !this.state.data[f]);

    if (missingRequiredFields.length) {
      this.setState({
        errors: missingRequiredFields,
        errorHeader: "Please fill out all required fields"
      });

      return false;
    }

    return true;
  }

  /**
   * switch to the next page in sequence, if it exists
   */
  nextPage() {
    this.setPage(this.state.currentPage + 1);
  }

  /**
   * switch to the previous page in sequence, if it exists
   */
  prevPage() {
    this.setPage(this.state.currentPage - 1);
  }

  /**
   * switch to the specified page in sequence, if it exists
   */
  setPage(i) {
    const newPage = Math.min(
      Math.max(i, 0),
      this.getPageComponents().length - 1
    );

    const currentPageValid = this.validateCurrentPageRequiredFields();
    if (currentPageValid) {
      this.setState({
        currentPage: newPage
      });
    }
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
  requiredFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

FormController.defaultProps = {
  requiredFields: []
};
