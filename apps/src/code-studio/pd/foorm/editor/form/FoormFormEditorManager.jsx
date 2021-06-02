import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import FoormEntityEditor from '../components/FoormEntityEditor';
import FoormEntityLoadButtons from '../components/FoormEntityLoadButtons';
import {
  setLastSaved,
  setSaveError,
  setFormData,
  setHasJSONError,
  setHasLintError,
  setLastSavedQuestions
} from '../foormEditorRedux';
import FoormFormSaveBar from '@cdo/apps/code-studio/pd/foorm/editor/form/FoormFormSaveBar';
import {getLatestVersionMap} from '../../foormHelpers';

/*
Parent component for editing Foorm forms. Will initially show a choice
between loading an existing form or an empty form.
After that choice is made, will render FoormEntityEditor with the chosen form to allow editing that form.
*/
class FoormFormEditorManager extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func,
    resetCodeMirror: PropTypes.func,
    categories: PropTypes.array,

    // populated by redux
    questions: PropTypes.object,
    hasJSONError: PropTypes.bool,
    fetchableForms: PropTypes.array,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    isFormPublished: PropTypes.bool,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setFormData: PropTypes.func,
    setHasJSONError: PropTypes.func,
    setHasLintError: PropTypes.func,
    setLastSavedFormQuestions: PropTypes.func
  };

  state = {
    showCodeMirror: false,
    hasLoadError: false,
    forceRerenderKey: 0,
    previewQuestions: null
  };

  // Callback for FoormLoadButtons
  getFetchableForms() {
    return this.props.fetchableForms.map(formNameAndVersion => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];

      return {
        metadata: formNameAndVersion,
        text: `${formName}, version ${formVersion}`
      };
    });
  }

  // Callback for FoormLoadButtons
  loadFormData(formMetadata) {
    const formId = formMetadata.id;

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

  // Callback for FoormLoadButtons
  resetSelectedData() {
    this.props.setFormData({
      questions: {},
      published: null,
      formName: null,
      formVersion: null,
      formId: null
    });
  }

  // Callback for FoormLoadButtons
  showCodeMirror() {
    this.setState({showCodeMirror: true});
  }

  updateFormData(formData) {
    this.props.setFormData(formData);
    this.props.setHasJSONError(false);
    this.props.setHasLintError(false);
    this.props.setLastSavedFormQuestions(formData['questions']);
    this.props.resetCodeMirror(formData['questions']);
  }

  // Callback for FoormEntityEditor
  fillFormWithLibraryItems() {
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
  }

  getPreviewErrors() {
    let errors = [];

    if (this.props.hasJSONError) {
      errors.push(
        'There is a parsing error in the JSON being edited. Errors are noted on the left side of the editor.'
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

  renderSaveBar() {
    const latestVersionMap = getLatestVersionMap(this.getFetchableForms());
    return (
      <FoormFormSaveBar
        formCategories={this.props.categories}
        resetCodeMirror={this.props.resetCodeMirror}
        isLatestVersion={
          latestVersionMap[this.props.formName] === this.props.formVersion
        }
      />
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
        <FoormEntityLoadButtons
          resetCodeMirror={this.props.resetCodeMirror}
          resetSelectedData={() => this.resetSelectedData()}
          showCodeMirror={() => this.showCodeMirror()}
          onSelect={formMetadata => this.loadFormData(formMetadata)}
          foormEntities={this.getFetchableForms()}
          foormEntityName="Form"
          showVersionFilterToggle={true}
        />
        {this.state.hasLoadError && (
          <div style={styles.loadError}>Could not load the selected form.</div>
        )}
        {this.state.showCodeMirror && (
          <FoormEntityEditor
            populateCodeMirror={this.props.populateCodeMirror}
            categories={this.props.categories}
            resetCodeMirror={this.props.resetCodeMirror}
            preparePreview={() => this.fillFormWithLibraryItems()}
            previewQuestions={this.state.previewQuestions}
            previewErrors={this.getPreviewErrors()}
            forceRerenderKey={this.state.forceRerenderKey}
            headerTitle={this.renderHeaderTitle()}
            validateURL={'/api/v1/pd/foorm/forms/validate_form'}
            validateDataKey={'form_questions'}
            saveBar={this.renderSaveBar()}
          />
        )}
      </div>
    );
  }
}

const styles = {
  surveyTitle: {
    marginBottom: 0
  },
  surveyState: {
    marginTop: 0
  },
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

export default connect(
  state => ({
    questions: state.foorm.questions || {},
    fetchableForms: state.foorm.fetchableEntities || [],
    hasJSONError: state.foorm.hasJSONError,
    formName: state.foorm.formName,
    formVersion: state.foorm.formVersion,
    isFormPublished: state.foorm.isFormPublished
  }),
  dispatch => ({
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setFormData: formData => dispatch(setFormData(formData)),
    setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
    setHasLintError: hasLintError => dispatch(setHasLintError(hasLintError)),
    setLastSavedFormQuestions: formQuestions =>
      dispatch(setLastSavedQuestions(formQuestions))
  })
)(FoormFormEditorManager);
