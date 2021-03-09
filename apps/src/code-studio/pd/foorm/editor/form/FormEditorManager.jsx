// Main page for Foorm Editor interface. Will initially show a choice
// between loading an existing configuration or an empty configuration.
// After that choice is made, will render FoormEditor with the chosen configuration.

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import FoormEditor from '../components/FoormEditor';
import {
  resetAvailableEntities,
  setLastSaved,
  setSaveError,
  setFormData,
  setHasJSONError,
  setLastSavedQuestions
} from '../foormEditorRedux';
import _ from 'lodash';

const styles = {
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  },
  surveyTitle: {
    marginBottom: 0
  },
  surveyState: {
    marginTop: 0
  }
};

class FormEditorManager extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func,
    resetCodeMirror: PropTypes.func,
    categories: PropTypes.array,

    // populated by redux
    hasJSONError: PropTypes.bool,
    availableForms: PropTypes.array,
    questions: PropTypes.object,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    isFormPublished: PropTypes.bool,
    resetAvailableForms: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setFormData: PropTypes.func,
    setHasJSONError: PropTypes.func,
    setLastSavedFormQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      showCodeMirror: false,
      hasLoadError: false,
      forceRerenderKey: 0,
      previewQuestions: null
    };
  }

  getFormattedConfigurationDropdownOptions() {
    return this.props.availableForms.map((formNameAndVersion, i) => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];
      const formId = formNameAndVersion['id'];
      return (
        <MenuItem
          key={i}
          eventKey={i}
          onClick={() => this.loadConfiguration(formId)}
        >
          {`${formName}, version ${formVersion}`}
        </MenuItem>
      );
    });
  }

  loadConfiguration(formId) {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    $.ajax({
      url: `/api/v1/pd/foorm/forms/${formId}`,
      type: 'get'
    })
      .done(result => {
        this.updateFormData(result);
        this.setState({
          showCodeMirror: true,
          hasLoadError: false
        });
      })
      .fail(() => {
        this.updateFormData({
          questions: {},
          published: null,
          formName: null,
          formVersion: null,
          formId: null
        });
        this.setState({
          showCodeMirror: true,
          hasLoadError: true
        });
      });
  }

  initializeEmptyCodeMirror = () => {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    this.updateFormData({
      questions: {},
      published: null,
      formName: null,
      formVersion: null,
      formId: null
    });
    this.setState({
      showCodeMirror: true,
      hasLoadError: false
    });
  };

  updateFormData(formData) {
    this.props.setFormData(formData);
    this.props.setHasJSONError(false);
    this.props.setLastSavedFormQuestions(formData['questions']);
    this.props.resetCodeMirror(formData['questions']);
  }

  // use debounce to only call once per second
  fillFormWithLibraryItems = _.debounce(
    function() {
      $.ajax({
        url: '/api/v1/pd/foorm/forms/form_with_library_items',
        type: 'post',
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({
          form_questions: this.props.questions
        })
      })
        .done(result => {
          this.setState({
            forceRerenderKey: this.state.forceRerenderKey + 1,
            previewQuestions: result,
            libraryError: false,
            libraryErrorMessage: null
          });
        })
        .fail(result => {
          this.setState({
            libraryError: true,
            libraryErrorMessage:
              (result.responseJSON && result.responseJSON.error) || 'unknown'
          });
        });
    },
    1000,
    {leading: true}
  );

  listPreviewErrors() {
    let errors = [];

    if (this.props.hasJSONError) {
      errors.push(
        'There is a parsing error in the JSON configuration. Errors are noted on the left side of the editor.'
      );
    }
    if (this.state.libraryError) {
      errors.push(
        `There is an error in the use of at least one library question. The error is: ${
          this.state.libraryErrorMessage
        }`
      );
    }

    return errors;
  }

  // bind this instead of using arrow function?
  renderHeaderTitle() {
    return (
      this.props.formName && (
        <div>
          <h2 style={styles.surveyTitle}>
            {`Form Name: ${this.props.formName}, version ${
              this.props.formVersion
            }`}
          </h2>
          <h3 style={styles.surveyState}>
            {`Form State: ${
              this.props.isFormPublished ? 'Published' : 'Draft'
            }`}
          </h3>
        </div>
      )
    );
  }

  render() {
    return (
      <div>
        <h1>Foorm Editor</h1>
        <p>
          Interface for creating and making updates to Foorm forms. Check out
          our{' '}
          <a
            href="https://github.com/code-dot-org/code-dot-org/wiki/%5BLevelbuilder%5D-The-Foorm-Editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            How To
          </a>{' '}
          to get started.
        </p>
        <div>
          <DropdownButton id="load_config" title="Load Form..." className="btn">
            {this.getFormattedConfigurationDropdownOptions()}
          </DropdownButton>
          <Button onClick={this.initializeEmptyCodeMirror} className="btn">
            New Form
          </Button>
        </div>
        {this.state.hasLoadError && (
          <div style={styles.loadError}>Could not load the selected form.</div>
        )}
        {this.state.showCodeMirror && (
          <FoormEditor
            populateCodeMirror={this.props.populateCodeMirror}
            categories={this.props.categories}
            resetCodeMirror={this.props.resetCodeMirror}
            preparePreview={() => this.fillFormWithLibraryItems()}
            previewQuestions={this.state.previewQuestions}
            previewErrors={this.listPreviewErrors()}
            forceRerenderKey={this.state.forceRerenderKey}
            headerTitle={this.renderHeaderTitle()}
            validateURL={'/api/v1/pd/foorm/forms/validate_form'}
            validateDataKey={'form_questions'}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    questions: state.foorm.questions || {},
    availableForms: state.foorm.availableEntities || [],
    hasJSONError: state.foorm.hasJSONError,
    formName: state.foorm.formName,
    formVersion: state.foorm.formVersion,
    isFormPublished: state.foorm.isFormPublished
  }),
  dispatch => ({
    resetAvailableForms: formsMetadata =>
      dispatch(resetAvailableEntities(formsMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setFormData: formData => dispatch(setFormData(formData)),
    setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
    setLastSavedFormQuestions: formQuestions =>
      dispatch(setLastSavedQuestions(formQuestions))
  })
)(FormEditorManager);
