import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import {Button, Alert, FormGroup} from 'react-bootstrap';
import {Pagination} from '@react-bootstrap/pagination';
import i18n from '@cdo/locale';

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
      errorMessages: {},
      errorHeader: null,
      globalError: false,
      currentPage: 0,
      submitting: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);

    this.onInitialize();
  }

  componentWillMount() {
    let newPage;
    if (
      this.constructor.sessionStorageKey &&
      sessionStorage[this.constructor.sessionStorageKey]
    ) {
      const reloadedState = JSON.parse(
        sessionStorage[this.constructor.sessionStorageKey]
      );
      this.setState(reloadedState);
      newPage = reloadedState.currentPage;
    } else {
      newPage = this.state.currentPage;
    }

    this.onSetPage(newPage);
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
      $('html, body').animate(
        {
          scrollTop: 0
        },
        200
      );
    }

    if (newPage) {
      this.onSetPage(this.state.currentPage);
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
    const errors = this.state.errors.filter(
      error => !newFields.includes(error)
    );

    // update state with new data
    const data = Object.assign({}, this.state.data, newState);
    this.setState({
      data,
      errors
    });

    this.saveToSessionStorage({data});
  }

  /**
   * Override in derived classes with a key name (e.g. the class name)
   * to save session storage in that key. Otherwise, no session storage will be saved.
   */
  static sessionStorageKey = null;

  /**
   * Save currentPage and form data to the session storage, if a sessionStorageKey is specified on this class
   * @param {Object} newState - data and/or currentPage to override the value in this.state
   */
  saveToSessionStorage = newState => {
    if (this.constructor.sessionStorageKey) {
      const mergedData = {
        ...{
          currentPage: this.state.currentPage,
          data: this.state.data
        },
        ...newState
      };
      sessionStorage.setItem(
        this.constructor.sessionStorageKey,
        JSON.stringify(mergedData)
      );
    }
  };

  /**
   * Assemble all data to be submitted
   *
   * @returns {Object}
   */
  serializeFormData() {
    return {
      form_data: this.state.data
    };
  }

  /**
   * Called when we initialize the form.
   */
  onInitialize() {
    // Intentional noop; overridden by child classes
  }

  /**
   * Called when we get a successful response from the API submission
   */
  onSuccessfulSubmit() {
    // Intentional noop; overridden by child classes
  }

  /**
   * Called when we set a new page.
   */
  onSetPage(newPage) {
    // Intentional noop; overridden by child classes
  }

  /**
   * Submit serialized form data to the specified API Endpoint and handle server
   * response
   *
   * @param {Event} event
   */
  handleSubmit(event) {
    event.preventDefault();
    if (!this.validateCurrentPageRequiredFields()) {
      return;
    }

    // clear errors so we can more clearly detect "new" errors and toggle
    // submitting flag so we can prevent duplicate submission
    this.setState({
      errors: [],
      errorHeader: null,
      globalError: false,
      submitting: true
    });

    $.ajax({
      method: 'POST',
      url: this.props.apiEndpoint,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(this.serializeFormData())
    })
      .done(data => {
        sessionStorage.removeItem(this.constructor.sessionStorageKey);
        this.onSuccessfulSubmit(data);
      })
      .fail(data => {
        if (
          data.responseJSON &&
          data.responseJSON.errors &&
          data.responseJSON.errors.form_data
        ) {
          if (data.responseJSON.general_error) {
            this.setState({
              errors: data.responseJSON.errors.form_data,
              errorHeader: data.responseJSON.general_error,
              globalError: true
            });
          } else {
            // if the failure was a result of an invalid form, highlight the errors
            // and display the generic error header
            this.setState({
              errors: data.responseJSON.errors.form_data,
              errorHeader: i18n.formErrorsBelow()
            });
          }
        } else {
          // Otherwise, something unknown went wrong on the server
          this.setState({
            globalError: true,
            errorHeader: i18n.formServerError()
          });
        }
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
    const shouldShowError =
      this.state.errorHeader && (this.state.globalError || this.pageHasError());

    if (shouldShowError) {
      return (
        <Alert key="error-header" bsStyle="danger">
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
  pageHasError(page = this.state.currentPage, errors = this.state.errors) {
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
      errorMessages: this.state.errorMessages,
      data: this.state.data
    };
  }

  /**
   * @returns {Element}
   */
  renderCurrentPage() {
    const PageComponent = this.getCurrentPageComponent();
    return <PageComponent {...this.getPageProps()} />;
  }

  /**
   * Getter method for required field validation, so that inheriting classes can
   * support conditionally-required fields
   * @returns {String[]}
   */
  getRequiredFields() {
    const requiredFields = [...this.props.requiredFields];
    const pageRequiredFields = this.getPageComponents().map(page =>
      page.getDynamicallyRequiredFields(this.state.data, this.getPageProps())
    );
    return pageRequiredFields.reduce(
      (flattened, subArray) => flattened.concat(subArray),
      requiredFields
    );
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
  validatePageRequiredFields(pageIndex) {
    if (pageIndex < 0 || pageIndex >= this.getPageComponents().length) {
      throw `Invalid page index ${pageIndex}`;
    }

    const page = this.getPageComponents()[pageIndex];
    const requiredFields = this.getRequiredFields();
    const pageFields = page.associatedFields;

    // Trim string values on page, and set empty strings to null
    let pageData = {};
    pageFields.forEach(field => {
      let value = this.state.data[field];
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        pageData[field] = trimmedValue.length > 0 ? trimmedValue : null;
      } else {
        pageData[field] = value;
      }
    });

    pageData = Object.assign(pageData, page.processPageData(pageData));
    this.setState({
      data: {
        ...this.state.data,
        ...pageData
      }
    });

    const pageRequiredFields = pageFields.filter(f =>
      requiredFields.includes(f)
    );
    const missingRequiredFields = pageRequiredFields.filter(f => !pageData[f]);
    const formatErrors = page.getErrorMessages(pageData);

    if (missingRequiredFields.length || Object.keys(formatErrors).length) {
      this.setState({
        errors: [...missingRequiredFields, ...Object.keys(formatErrors)],
        errorMessages: formatErrors,
        errorHeader:
          'Please fill out all required fields. You must completely fill out this section before moving \
          on to the next section or going back to edit a previous section.'
      });

      return false;
    }

    return true;
  }

  /**
   * validate the current page
   */
  validateCurrentPageRequiredFields() {
    return this.validatePageRequiredFields(this.state.currentPage);
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

      this.saveToSessionStorage({currentPage: newPage});
    }
  }

  /**
   * @returns {boolean}
   */
  shouldShowSubmit() {
    return this.state.currentPage === this.getPageComponents().length - 1;
  }
  static submitButtonText = i18n.submit();

  /**
   * @returns {Element}
   */
  renderControlButtons() {
    let backButton;
    if (this.state.currentPage > 0) {
      backButton = (
        <Button key="back" id="back" onClick={this.prevPage}>
          Back
        </Button>
      );
    }

    let nextButton = (
      <Button bsStyle="primary" key="next" id="next" onClick={this.nextPage}>
        Next
      </Button>
    );
    if (this.shouldShowSubmit()) {
      nextButton = (
        <Button
          bsStyle="primary"
          disabled={this.state.submitting}
          key="submit"
          id="submit"
          type="submit"
        >
          {this.constructor.submitButtonText}
        </Button>
      );
    }

    const pageButtons = this.getPageComponents().length > 1 && (
      <Pagination
        style={styles.pageButtons}
        items={this.getPageComponents().length}
        activePage={this.state.currentPage + 1}
        onSelect={i => this.setPage(i - 1)} // eslint-disable-line react/jsx-no-bind
      />
    );

    return (
      <FormGroup key="control-buttons" className="text-center">
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
        ref={form => {
          this.form = form;
        }}
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
  apiEndpoint: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  requiredFields: PropTypes.arrayOf(PropTypes.string).isRequired
};

FormController.defaultProps = {
  requiredFields: []
};
