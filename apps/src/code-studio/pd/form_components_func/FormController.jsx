import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import $ from 'jquery';
import {Button, Alert, FormGroup} from 'react-bootstrap';
import {Pagination} from '@react-bootstrap/pagination';
import i18n from '@cdo/locale';
import usePrevious from '@cdo/apps/util/usePrevious';

const defaultSubmitButtonText = i18n.submit();

const scrollToTop = () => {
  $('html, body').animate(
    {
      scrollTop: 0
    },
    200
  );
};

const InvalidPagesSummary = ({pages, setPage}) => (
  <span>
    Please fill out all required fields on {pages.length > 1 ? 'pages' : 'page'}{' '}
    {pages
      .map(p => (
        <a key={p} onClick={() => setPage(p)} style={{cursor: 'pointer'}}>
          {p + 1}
        </a>
      ))
      .reduce((prev, curr) => [prev, ', ', curr])}
    . Once you are done, head to the last page to confirm and submit your
    application.
  </span>
);

InvalidPagesSummary.propTypes = {
  pages: PropTypes.arrayOf(PropTypes.number).isRequired,
  setPage: PropTypes.func.isRequired
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
const FormController = props => {
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const previousErrors = usePrevious(errors);
  const [errorMessages, setErrorMessages] = useState([]);
  const [errorHeader, setErrorHeader] = useState(null);
  const [globalError, setGlobalError] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);

  const {
    pageComponents,
    requiredFields = [],
    apiEndpoint,
    options,
    onInitialize = () => {},
    onSetPage: onPropsSetPage = () => {},
    onSuccessfulSubmit = () => {},
    sessionStorageKey = null,
    submitButtonText = defaultSubmitButtonText,
    getPageProps: getAdditionalPageProps = () => ({}),
    validateOnSubmitOnly = false,
    warnOnExit = false
  } = props;

  useEffect(() => {
    let newPage;
    if (sessionStorageKey && sessionStorage[sessionStorageKey]) {
      const reloadedState = JSON.parse(sessionStorage[sessionStorageKey]);

      setCurrentPage(reloadedState.currentPage);
      setData(reloadedState.data);

      newPage = reloadedState.currentPage;
      onInitialize(reloadedState.data, setData);
    } else {
      newPage = currentPage;
      onInitialize(data, setData);
    }

    onSetPage(newPage);

    if (warnOnExit) {
      window.addEventListener('beforeunload', event => {
        if (!submitting) {
          event.preventDefault();
          event.returnValue =
            'Are you sure? Your application may not be saved.';
        }
      });
    }
  }, []); // do this once on mount only

  useEffect(() => {
    // If we got new errors, navigate to the first page containing errors
    if (previousErrors.length === 0 && errors.length > 0) {
      for (let i = 0; i < pageComponents.length; i++) {
        if (pageHasError(i)) {
          setCurrentPage(i);
          break;
        }
      }
    }
    // if we got more errors than before, scroll to top (don't do this if we've removed errors)
    const newErrors = errors.length > previousErrors.length;
    if (newErrors) {
      scrollToTop();
    }
  }, [errors]);

  useEffect(() => {
    // if we changed pages, scroll to top
    scrollToTop();
    onSetPage(currentPage);
  }, [currentPage]);

  /**
   * checks the data collected so far against the required fields and the fields
   * for this page, to make sure that all required fields on this page have been
   * filled out. Flags any such fields with an error, and returns a boolean
   * indicating whether any were found.
   *
   * @return {boolean} true if this page is valid, false if any required fields
   *         are missing
   */
  const validatePageRequiredFields = pageIndex => {
    if (pageIndex < 0 || pageIndex >= pageComponents.length) {
      throw `Invalid page index ${pageIndex}`;
    }

    const page = pageComponents[pageIndex];
    const pageFields = page.associatedFields;

    // Trim string values on page, and set empty strings to null
    let pageData = {};
    pageFields.forEach(field => {
      let value = data[field];
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        pageData[field] = trimmedValue.length > 0 ? trimmedValue : null;
      } else {
        pageData[field] = value;
      }
    });

    pageData = Object.assign(pageData, page.processPageData(pageData));
    setData({
      ...data,
      ...pageData
    });

    const pageRequiredFields = pageFields.filter(f =>
      getRequiredFields().includes(f)
    );
    const missingRequiredFields = pageRequiredFields.filter(f => !pageData[f]);
    const formatErrors = page.getErrorMessages(pageData);

    if (missingRequiredFields.length || Object.keys(formatErrors).length) {
      setErrors([...missingRequiredFields, ...Object.keys(formatErrors)]);
      setErrorMessages(formatErrors);
      setErrorHeader(
        'Please fill out all required fields. You must completely fill out this section before moving \
      on to the next section or going back to edit a previous section.'
      );

      return false;
    }

    return true;
  };

  /**
   * validate the current page
   */
  const validateCurrentPageRequiredFields = () => {
    return validatePageRequiredFields(currentPage);
  };

  const validateForm = () => {
    let invalidPages = [];

    // Validating page in reversed order because the last page being validated will overwrite
    // values in this form's state, and only errors found in that page will be highlighted.
    for (let i = pageComponents.length - 1; i >= 0; i--) {
      if (!validatePageRequiredFields(i)) {
        invalidPages.unshift(i);
      }
    }

    return invalidPages;
  };

  const onSetPage = (newPage, setGlobalError) => {
    if (validateOnSubmitOnly && triedToSubmit) {
      // If errors exist, create a summary header containing
      // clickable links to pages that have errors.
      let invalidPages = validateForm();

      if (invalidPages.length) {
        setErrorHeader(
          <InvalidPagesSummary pages={invalidPages} setPage={setPage} />
        );
        setGlobalError(true);
      } else {
        setErrorHeader(null);
        setGlobalError(false);
      }
    }
    onPropsSetPage();
  };

  /**
   * @returns {FormComponent}
   */
  const getCurrentPageComponent = () => {
    return pageComponents[currentPage];
  };

  /**
   * Save currentPage and form data to the session storage, if a sessionStorageKey is specified
   * @param {Object} newState - data and/or currentPage to override the value in state
   */
  const saveToSessionStorage = newState => {
    if (sessionStorageKey) {
      const mergedData = {
        ...{
          currentPage: currentPage,
          data: data
        },
        ...newState
      };
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(mergedData));
    }
  };

  /**
   * Expects an object whose keys are the names of form inputs and whose values
   * reflect the new expected state of those inputs; intended to match the
   * format of the onChange handlers of ButtonList and FieldGroup
   *
   * @param {Object} newState
   */
  const handleChange = newState => {
    // clear any errors for newly changed fields
    const newFields = Object.keys(newState);
    const errors = errors.filter(error => !newFields.includes(error));

    // update state with new data
    const data = Object.assign({}, data, newState);
    setData(data);
    setErrors(errors);

    saveToSessionStorage({data});
  };

  /**
   * Assemble all data to be submitted
   *
   * @returns {Object}
   */
  const serializeFormData = () => {
    return {
      form_data: data
    };
  };

  /**
   * Submit serialized form data to the specified API Endpoint and handle server
   * response
   *
   * @param {Event} event
   */
  const handleSubmit = event => {
    event.preventDefault();
    if (validateOnSubmitOnly) {
      setTriedToSubmit(true);
      let invalidPages = validateForm();

      if (invalidPages.length > 0) {
        // go to page with the smallest index
        setPage(invalidPages[0]);
        return;
      }
    } else if (!validateCurrentPageRequiredFields()) {
      return;
    }

    // clear errors so we can more clearly detect "new" errors and toggle
    // submitting flag so we can prevent duplicate submission
    setErrors([]);
    setErrorHeader(null);
    setGlobalError(false);
    setSubmitting(true);

    $.ajax({
      method: 'POST',
      url: apiEndpoint,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(serializeFormData())
    })
      .done(data => {
        sessionStorage.removeItem(sessionStorageKey);
        onSuccessfulSubmit(data);
      })
      .fail(data => {
        if (
          data.responseJSON &&
          data.responseJSON.errors &&
          data.responseJSON.errors.form_data
        ) {
          if (data.responseJSON.general_error) {
            setErrors(data.responseJSON.errors.form_data);
            setErrorHeader(data.responseJSON.general_error);
            setGlobalError(true);
          } else {
            // if the failure was a result of an invalid form, highlight the errors
            // and display the generic error header
            setErrors(data.responseJSON.errors.form_data);
            setErrorHeader(i18n.formErrorsBelow());
          }
        } else {
          // Otherwise, something unknown went wrong on the server
          setGlobalError(true);
          setErrorHeader(i18n.formServerError());
        }
        setSubmitting(false);
      });

    event.preventDefault();
  };

  /**
   * Determines if a given page (defaults to current page) is responsible for any
   * of the given errors (defaults to current state errors).
   *
   * Note that for purposes of page errors, error strings like
   * "fieldName[some_extra_data]" will be normalized to "fieldName"
   *
   * @param {number} [page=currentPage] which page to examine
   * @param {String[]} [errors=errors] which errors to consider
   *
   * @returns {boolean}
   */
  const pageHasError = (page = currentPage) => {
    const pageFields = pageComponents[page].associatedFields;
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
  };

  /**
   * @returns {Element|undefined}
   */
  const renderErrorFeedback = () => {
    const shouldShowError = errorHeader && (globalError || pageHasError());

    if (shouldShowError) {
      return (
        <Alert key="error-header" bsStyle="danger">
          <h3>{errorHeader}</h3>
        </Alert>
      );
    }
  };

  /**
   * @returns {Object}
   */
  const getPageProps = () => {
    return {
      ...getAdditionalPageProps(),
      key: currentPage,
      options: options,
      onChange: handleChange,
      errors: errors,
      errorMessages: errorMessages,
      data: data
    };
  };

  /**
   * Getter method for required field validation, so that inheriting classes can
   * support conditionally-required fields
   * @returns {String[]}
   */
  const getRequiredFields = () => {
    const propsRequiredFields = [...requiredFields];
    const pageRequiredFields = pageComponents.map(page =>
      page.getDynamicallyRequiredFields(data, getPageProps())
    );
    return pageRequiredFields.reduce(
      (flattened, subArray) => flattened.concat(subArray),
      propsRequiredFields
    );
  };

  /**
   * @returns {Element}
   */
  const renderCurrentPage = () => {
    const PageComponent = getCurrentPageComponent();
    return <PageComponent {...getPageProps()} />;
  };

  /**
   * switch to the specified page in sequence, if it exists
   */
  const setPage = i => {
    const newPage = Math.min(Math.max(i, 0), pageComponents.length - 1);

    const currentPageValid =
      validateOnSubmitOnly || validateCurrentPageRequiredFields();
    if (currentPageValid) {
      setCurrentPage(newPage);

      saveToSessionStorage({currentPage: newPage});
    }
  };

  /**
   * @returns {boolean}
   */
  const shouldShowSubmit = () => {
    return currentPage === pageComponents.length - 1;
  };

  /**
   * @returns {Element}
   */
  const renderControlButtons = () => {
    let backButton;
    if (currentPage > 0) {
      backButton = (
        <Button key="back" id="back" onClick={() => setPage(currentPage - 1)}>
          Back
        </Button>
      );
    }

    let nextButton = (
      <Button
        bsStyle="primary"
        key="next"
        id="next"
        onClick={() => setPage(currentPage + 1)}
      >
        Next
      </Button>
    );
    if (shouldShowSubmit(pageComponents, currentPage)) {
      nextButton = (
        <Button
          bsStyle="primary"
          disabled={submitting}
          key="submit"
          id="submit"
          type="submit"
        >
          {submitButtonText}
        </Button>
      );
    }

    const pageButtons = pageComponents.length > 1 && (
      <Pagination
        style={styles.pageButtons}
        items={pageComponents.length}
        activePage={currentPage + 1}
        onSelect={i => setPage(i - 1)} // eslint-disable-line react/jsx-no-bind
      />
    );

    return (
      <FormGroup key="control-buttons" className="text-center">
        {backButton}
        {pageButtons}
        {nextButton}
      </FormGroup>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderErrorFeedback()}
      {renderCurrentPage()}
      {renderControlButtons()}
      {renderErrorFeedback()}
    </form>
  );
};

const styles = {
  pageButtons: {
    verticalAlign: 'middle',
    margin: '0 10px'
  }
};

FormController.propTypes = {
  apiEndpoint: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  requiredFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  pageComponents: PropTypes.arrayOf(PropTypes.func),
  getPageProps: PropTypes.func,
  onInitialize: PropTypes.func,
  onSetPage: PropTypes.func,
  onSuccessfulSubmit: PropTypes.func,
  sessionStorageKey: PropTypes.string,
  submitButtonText: PropTypes.string,
  validateOnSubmitOnly: PropTypes.bool,
  warnOnExit: PropTypes.bool
};

export default FormController;
