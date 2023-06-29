import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import $ from 'jquery';
import {Button, Alert, FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {Pagination} from '@react-bootstrap/pagination';
import {isEqual, omit} from 'lodash';
import i18n from '@cdo/locale';
import usePrevious from '@cdo/apps/util/usePrevious';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {useRegionalPartner} from '../components/useRegionalPartner';

const defaultSubmitButtonText = i18n.submit();

const scrollToTop = () => {
  $('html, body').animate(
    {
      scrollTop: 0,
    },
    200
  );
};

// parse the initial data from session storage, or return null if nothing is stored
const getInitialStored = (storageKey, valueKey) => {
  if (!storageKey || !valueKey) {
    return null;
  }
  const reloadedState = sessionStorage.getItem(storageKey);
  if (reloadedState === null) {
    return null;
  }
  const parsedState = JSON.parse(reloadedState);
  return parsedState[valueKey];
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
  setPage: PropTypes.func.isRequired,
};

/**
 * Helper component for dashboard forms.
 * Resulting form will then display the provided pageComponents paginated and in order,
 * with a submit button on the last page.
 *
 * @see TeacherApplication component for example usage.
 */
const FormController = props => {
  const {
    pageComponents,
    requiredFields,
    apiEndpoint,
    applicationId,
    allowPartialSaving,
    autoComputedFields,
    options,
    getInitialData,
    onInitialize,
    onSetPage,
    onSuccessfulSubmit,
    onSuccessfulSave,
    savedStatus,
    serializeAdditionalData,
    sessionStorageKey,
    submitButtonText,
    getPageProps: getAdditionalPageProps = () => ({}),
    validateOnSubmitOnly,
    warnOnExit,
  } = props;

  // We use functions here as the initial value so that these values are only calculated once
  const initialPage = useMemo(
    () => getInitialStored(sessionStorageKey, 'currentPage') || 0,
    [sessionStorageKey]
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [data, setData] = useState(() => ({
    ...getInitialStored(sessionStorageKey, 'data'),
    ...getInitialData(),
  }));
  const [regionalPartner] = useRegionalPartner(data);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedData, setSavedData] = useState(getInitialData());
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showApplicationClosedMessage, setShowApplicationClosedMessage] =
    useState(regionalPartner?.are_apps_closed);
  const [errors, setErrors] = useState([]);
  const previousErrors = usePrevious(errors);
  const [hasUserChangedData, setHasUserChangedData] = useState(
    !isEqual(
      omit(data, autoComputedFields),
      omit(savedData, autoComputedFields)
    )
  );
  const [errorMessages, setErrorMessages] = useState({});
  const [errorHeader, setErrorHeader] = useState(null);
  const [globalError, setGlobalError] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [updatedApplicationId, setUpdatedApplicationId] =
    useState(applicationId);
  const [showDataWasLoadedMessage, setShowDataWasLoadedMessage] =
    useState(applicationId);

  // do this once on mount only
  useEffect(() => {
    onInitialize();
    onSetPageInternal(initialPage);
  }, [onInitialize, onSetPageInternal, initialPage]);

  // on matching to an RP with apps closed
  useEffect(() => {
    if (regionalPartner?.are_apps_closed) {
      setShowApplicationClosedMessage(true);
      scrollToTop();
      return;
    }
  }, [regionalPartner]);

  useEffect(() => {
    if (
      !isEqual(
        omit(data, autoComputedFields),
        omit(savedData, autoComputedFields)
      )
    ) {
      setHasUserChangedData(true);
    } else {
      setHasUserChangedData(false);
    }
  }, [autoComputedFields, data, savedData]);

  // on exiting application with unsaved data
  useEffect(() => {
    const showWarningOnExit =
      warnOnExit && !submitting && !saving && hasUserChangedData;
    const exitHandler = event => {
      if (showWarningOnExit) {
        event.preventDefault();
        event.returnValue = 'Are you sure? Your application may not be saved.';
      }
    };

    window.addEventListener('beforeunload', exitHandler);
    return () => {
      window.removeEventListener('beforeunload', exitHandler);
    };
  }, [hasUserChangedData, submitting, saving, warnOnExit]);

  // on errors changed
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
  }, [
    errors.length,
    previousErrors.length,
    pageComponents.length,
    pageHasError,
  ]);

  // on page changed
  useEffect(() => {
    scrollToTop();
    onSetPageInternal(currentPage);
  }, [currentPage, onSetPageInternal]);

  /**
   * checks the data collected so far against the required fields and the fields
   * for this page, to make sure that all required fields on this page have been
   * filled out. Flags any such fields with an error, and returns a boolean
   * indicating whether any were found.
   *
   * @return {boolean} true if this page is valid, false if any required fields
   *         are missing
   */
  const validatePageRequiredFields = useCallback(
    pageIndex => {
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

      if (page.processPageData) {
        pageData = Object.assign(pageData, page.processPageData(pageData));
      }
      setData({
        ...data,
        ...pageData,
      });

      const pageRequiredFields = pageFields.filter(f =>
        getRequiredFields().includes(f)
      );
      const missingRequiredFields = pageRequiredFields.filter(
        f => !pageData[f]
      );
      const formatErrors =
        (page.getErrorMessages && page.getErrorMessages(pageData)) || {};

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
    },
    [pageComponents, data, getRequiredFields]
  );

  /**
   * validate the current page
   */
  const validateCurrentPageRequiredFields = useCallback(() => {
    return validatePageRequiredFields(currentPage);
  }, [currentPage, validatePageRequiredFields]);

  const validateForm = useCallback(() => {
    let invalidPages = [];

    // Validating page in reversed order because the last page being validated will overwrite
    // values in this form's state, and only errors found in that page will be highlighted.
    for (let i = pageComponents.length - 1; i >= 0; i--) {
      if (!validatePageRequiredFields(i)) {
        invalidPages.unshift(i);
      }
    }

    return invalidPages;
  }, [pageComponents, validatePageRequiredFields]);

  const onSetPageInternal = useCallback(() => {
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
    onSetPage();
  }, [validateOnSubmitOnly, triedToSubmit, setPage, onSetPage, validateForm]);

  const getCurrentPageComponent = () => {
    return pageComponents[currentPage];
  };

  /**
   * Save currentPage and form data to the session storage, if a sessionStorageKey is specified
   * @param {Object} newState - data and/or currentPage to override the value in state
   */
  const saveToSessionStorage = useCallback(
    newState => {
      if (sessionStorageKey) {
        const mergedData = {
          ...{
            currentPage: currentPage,
            data: data,
          },
          ...newState,
        };
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(mergedData));
      }
    },
    [sessionStorageKey, currentPage, data]
  );

  /**
   * Expects an object whose keys are the names of form inputs and whose values
   * reflect the new expected state of those inputs; intended to match the
   * format of the onChange handlers of ButtonList and FieldGroup
   *
   * @param {Object} newState
   */
  const handleChange = useCallback(
    newState => {
      // clear any errors for newly changed fields
      const newFields = Object.keys(newState);
      const updatedErrors = errors.filter(error => !newFields.includes(error));

      // update state with new data
      const updatedData = {...data, ...newState};
      if (!isEqual(data, updatedData)) {
        setData(updatedData);
        saveToSessionStorage({data: updatedData});
      }

      if (!isEqual(errors, updatedErrors)) {
        setErrors(updatedErrors);
      }
    },
    [errors, data, saveToSessionStorage]
  );

  /**
   * Assemble all data to be submitted
   *
   * @returns {Object}
   */
  const serializeFormData = (formData, isSaving) => {
    if (!formData) {
      throw new Error(`formData cannot be undefined`);
    }
    return {
      form_data: formData,
      isSaving: isSaving,
      ...serializeAdditionalData(),
    };
  };

  const handleRequestFailure = data => {
    if (data?.responseJSON?.errors?.form_data) {
      setErrors(data.responseJSON.errors.form_data);
      setErrorHeader(i18n.formErrorsBelow());
    } else if (data?.status === 409) {
      // trying to create an application that has already been created
      setGlobalError(true);
      setErrorHeader(
        'We found an application that you already started. Reload the page to continue.'
      );
    } else {
      // Otherwise, something unknown went wrong on the server
      setGlobalError(true);
      setErrorHeader(i18n.formServerError());
    }
    setSubmitting(false);
    setSaving(false);
  };

  const makeRequest = isSaving => {
    const ajaxRequest = (method, endpoint) =>
      $.ajax({
        method: method,
        url: endpoint,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(serializeFormData(data, isSaving)),
      });

    return updatedApplicationId
      ? ajaxRequest('PUT', `${apiEndpoint}/${updatedApplicationId}`)
      : ajaxRequest('POST', apiEndpoint);
  };

  const handleSave = () => {
    // clear errors so we can more clearly detect "new" errors and toggle
    // submitting flag so we can prevent duplicate submission
    setErrors([]);
    setErrorHeader(null);
    setGlobalError(false);
    setSaving(true);

    const handleSuccessfulSave = response => {
      scrollToTop();
      setShowSavedMessage(true);
      setShowDataWasLoadedMessage(false);
      setUpdatedApplicationId(response.id);
      setSavedData(data);
      setSaving(false);
      onSuccessfulSave(response);
    };

    makeRequest(true)
      .done(data => handleSuccessfulSave(data))
      .fail(data => handleRequestFailure(data));
  };

  /**
   * Submit serialized form data to the specified API Endpoint and handle server
   * response
   *
   * @param {Event} event
   */
  const handleSubmit = event => {
    event.preventDefault();
    if (regionalPartner?.are_apps_closed) {
      setShowApplicationClosedMessage(true);
      scrollToTop();
      return;
    } else if (validateOnSubmitOnly) {
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

    const handleSuccessfulSubmit = data => {
      sessionStorage.removeItem(sessionStorageKey);
      onSuccessfulSubmit(data);

      // Log application status change upon submission for Teacher Applications
      if (window.location.href.includes('teacher')) {
        const rp_requires_admin_approval =
          regionalPartner.applications_principal_approval ===
          'all_teachers_required';
        analyticsReporter.sendEvent(EVENTS.APP_STATUS_CHANGE_EVENT, {
          'application id': data.id,
          'application status': rp_requires_admin_approval
            ? 'awaiting_admin_approval'
            : 'unreviewed',
        });
      }
    };

    makeRequest(false)
      .done(data => handleSuccessfulSubmit(data))
      .fail(data => handleRequestFailure(data));
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
  const pageHasError = useCallback(
    (page = currentPage) => {
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
    },
    [pageComponents, errors, currentPage]
  );

  /**
   * @returns {Element|undefined}
   */
  const renderErrorFeedback = () => {
    const shouldShowError = errorHeader && (globalError || pageHasError());

    if (shouldShowError) {
      return (
        <Alert bsStyle="danger">
          <h3>{errorHeader}</h3>
        </Alert>
      );
    }
  };

  /**
   * @returns {Object}
   */
  const getPageProps = useCallback(() => {
    return {
      ...getAdditionalPageProps(),
      key: currentPage,
      options: options,
      onChange: handleChange,
      errors: errors,
      errorMessages: errorMessages,
      data: data,
    };
  }, [
    currentPage,
    options,
    errors,
    errorMessages,
    data,
    getAdditionalPageProps,
    handleChange,
  ]);

  /**
   * Getter method for required field validation, so that inheriting classes can
   * support conditionally-required fields
   * @returns {String[]}
   */
  const getRequiredFields = useCallback(() => {
    const propsRequiredFields = [...requiredFields];
    const pageRequiredFields = pageComponents.map(
      page =>
        (page.getDynamicallyRequiredFields &&
          page.getDynamicallyRequiredFields(data, getPageProps())) ||
        []
    );
    return pageRequiredFields.reduce(
      (flattened, subArray) => flattened.concat(subArray),
      propsRequiredFields
    );
  }, [requiredFields, pageComponents, data, getPageProps]);

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
  const setPage = useCallback(
    i => {
      const newPage = Math.min(Math.max(i, 0), pageComponents.length - 1);
      setShowDataWasLoadedMessage(false);
      setShowSavedMessage(false);

      const currentPageValid =
        validateOnSubmitOnly || validateCurrentPageRequiredFields();
      if (currentPageValid) {
        if (currentPage !== newPage) {
          analyticsReporter.sendEvent(EVENTS.PAGE_CHANGED_EVENT, {
            'current application page': currentPage + 1,
            'new application page': newPage + 1,
          });
        }

        setCurrentPage(newPage);

        saveToSessionStorage({currentPage: newPage});
      }
    },
    [
      pageComponents,
      validateOnSubmitOnly,
      saveToSessionStorage,
      currentPage,
      validateCurrentPageRequiredFields,
    ]
  );

  /**
   * @returns {boolean}
   */
  const shouldShowSubmit = () => {
    return currentPage === pageComponents.length - 1;
  };

  /**
   * @returns {Element|false}
   */
  const renderApplicationClosedMessage = () =>
    showApplicationClosedMessage && (
      <Alert
        key={3}
        onDismiss={() => setShowApplicationClosedMessage(false)}
        bsStyle="danger"
      >
        <p>
          Applications are closed for this region. Join{' '}
          <a href="https://code.org/about/hear-from-us">our email list</a> to
          find out when applications open next year.
        </p>
      </Alert>
    );

  /**
   * @returns {Element|false}
   */
  const renderDataWasLoadedMessage = () =>
    showDataWasLoadedMessage && (
      <Alert
        onDismiss={() => setShowDataWasLoadedMessage(false)}
        bsStyle="info"
      >
        <p>
          {savedStatus === 'reopened'
            ? 'Your Regional Partner has requested more information. Please update and resubmit.'
            : 'We found an application you started! Your saved responses have been loaded.'}
        </p>
      </Alert>
    );

  /**
   * @returns {Element|false}
   */
  const renderMessageOnSave = () =>
    showSavedMessage && (
      <Alert
        onDismiss={() => {
          setShowSavedMessage(false);
        }}
        bsStyle="info"
      >
        <p>
          Your progress has been saved. Return to this page at any time to
          continue working on your application.
        </p>
      </Alert>
    );

  /**
   * @returns {Element}
   */
  const renderControlButtons = () => {
    const backButton = (
      <Button key="back" id="back" onClick={() => setPage(currentPage - 1)}>
        Back
      </Button>
    );

    const nextButton = (
      <Button
        bsStyle="primary"
        key="next"
        id="next"
        onClick={() => setPage(currentPage + 1)}
      >
        Next
      </Button>
    );

    const submitButton = (
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

    const saveButton = (
      <Button
        className="btn-gray"
        style={styles.saveButton}
        disabled={saving}
        key="save"
        id="save"
        onClick={handleSave}
      >
        Save and Return Later
      </Button>
    );

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
        {currentPage > 0 && backButton}
        {pageButtons}
        {shouldShowSubmit() ? submitButton : nextButton}
        {allowPartialSaving && savedStatus !== 'reopened' && saveButton}
        {(saving || submitting) && (
          <Spinner style={styles.spinner} size="medium" />
        )}
      </FormGroup>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderErrorFeedback()}
      {renderDataWasLoadedMessage()}
      {renderApplicationClosedMessage()}
      {renderMessageOnSave()}
      {renderCurrentPage()}
      {renderControlButtons()}
      {renderErrorFeedback()}
    </form>
  );
};

const styles = {
  pageButtons: {
    verticalAlign: 'middle',
    margin: '0px 10px 5px',
  },
  saveButton: {
    marginLeft: '10px',
    marginRight: '10px',
  },
  spinner: {
    verticalAlign: 'top',
    marginTop: '5px',
  },
};

FormController.propTypes = {
  apiEndpoint: PropTypes.string.isRequired,
  applicationId: PropTypes.number,
  autoComputedFields: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.object.isRequired,
  requiredFields: PropTypes.arrayOf(PropTypes.string),
  pageComponents: PropTypes.arrayOf(PropTypes.func),
  allowPartialSaving: PropTypes.bool,
  getPageProps: PropTypes.func,
  getInitialData: PropTypes.func,
  onInitialize: PropTypes.func,
  onSetPage: PropTypes.func,
  onSuccessfulSubmit: PropTypes.func,
  onSuccessfulSave: PropTypes.func,
  savedStatus: PropTypes.string,
  serializeAdditionalData: PropTypes.func,
  sessionStorageKey: PropTypes.string,
  submitButtonText: PropTypes.string,
  validateOnSubmitOnly: PropTypes.bool,
  warnOnExit: PropTypes.bool,
};

FormController.defaultProps = {
  requiredFields: [],
  applicationId: undefined,
  allowPartialSaving: false,
  autoComputedFields: [],
  getInitialData: () => {},
  onInitialize: () => {},
  onSetPage: () => {},
  onSuccessfulSubmit: () => {},
  onSuccessfulSave: () => {},
  serializeAdditionalData: () => {},
  sessionStorageKey: null,
  submitButtonText: defaultSubmitButtonText,
  validateOnSubmitOnly: false,
  warnOnExit: false,
};

export default FormController;
