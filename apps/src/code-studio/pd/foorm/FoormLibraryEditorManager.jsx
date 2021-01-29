// Main page for Foorm Editor interface. Will initially show a choice
// between loading an existing configuration or an empty configuration.
// After that choice is made, will render FoormEditor with the chosen configuration.

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import FoormLibraryEditor from './FoormLibraryEditor';
import {
  resetAvailableLibraries,
  setLastSaved,
  setSaveError,
  setFormData,
  setHasError,
  setLastSavedQuestions
} from './library_editor/foormLibraryEditorRedux';

const styles = {
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

class FoormLibraryEditorManager extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func,
    resetCodeMirror: PropTypes.func,
    libraryNamesAndVersions: PropTypes.array,
    formCategories: PropTypes.array,

    // populated by redux
    formQuestions: PropTypes.object,
    availableLibraries: PropTypes.array,
    resetAvailableLibraries: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setFormData: PropTypes.func,
    setHasError: PropTypes.func,
    setLastSavedQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      formKey: 0,
      formPreviewQuestions: null,
      showCodeMirror: false,
      hasLoadError: false,
      selectedLibraryId: null,
      libraryQuestionsFromSelectedLibrary: null
    };

    this.props.resetAvailableLibraries(this.props.libraryNamesAndVersions);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.libraryNamesAndVersions !== this.props.libraryNamesAndVersions
    ) {
      this.props.resetAvailableLibraries(this.props.libraryNamesAndVersions);
    }
  }

  getFormattedConfigurationDropdownOptions() {
    return this.props.availableLibraries.map((libraryNameAndVersion, i) => {
      const libraryName = libraryNameAndVersion['name'];
      const libraryVersion = libraryNameAndVersion['version'];
      const libraryId = libraryNameAndVersion['id'];
      return (
        <MenuItem
          key={i}
          eventKey={i}
          onClick={() => this.loadConfiguration(libraryId)}
        >
          {`${libraryName}, version ${libraryVersion}`}
        </MenuItem>
      );
    });
  }

  getFormattedLibraryQuestionDropdownOptions() {
    return this.state.libraryQuestionsFromSelectedLibrary.map(
      (libraryQuestionAndType, i) => {
        const libraryQuestionName = libraryQuestionAndType['name'];
        const libraryQuestionType = libraryQuestionAndType['type'];
        const libraryQuestionId = libraryQuestionAndType['id'];
        return (
          <MenuItem
            key={i}
            eventKey={i}
            onClick={() => this.loadConfiguration(libraryQuestionId)}
          >
            {`${libraryQuestionName} (${libraryQuestionType})`}
          </MenuItem>
        );
      }
    );
  }

  loadConfiguration(formId) {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    $.ajax({
      url: `/foorm/libraries/${formId}/question_names`,
      type: 'get'
    })
      .done(result => {
        this.updateFormData(result);
        this.setState({
          showCodeMirror: true,
          hasLoadError: false,
          selectedLibraryId: formId,
          libraryQuestionsFromSelectedLibrary: result
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
          hasLoadError: true,
          selectedLibraryId: null
        });
      });
  }

  // on select of library:
  // load options of library questions
  // show dropdown
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

  updateFormData = formData => {
    this.props.setFormData(formData);
    this.props.setHasError(false);
    this.props.setLastSavedQuestions(formData['questions']);
    this.props.resetCodeMirror(formData['questions']);
  };

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
        {this.state.selectedLibraryId &&
          this.state.libraryQuestionsFromSelectedLibrary && (
            <DropdownButton
              id="load_config"
              title="Load Library Question..."
              className="btn"
            >
              {this.getFormattedLibraryQuestionDropdownOptions()}
            </DropdownButton>
          )}
        {this.state.hasLoadError && (
          <div style={styles.loadError}>Could not load the selected form.</div>
        )}
        {false && (
          <FoormLibraryEditor
            populateCodeMirror={this.props.populateCodeMirror}
            formCategories={this.props.formCategories}
            resetCodeMirror={this.props.resetCodeMirror}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    formQuestions: state.foorm.formQuestions || {},
    availableLibraries: state.foorm.availableLibraries || []
  }),
  dispatch => ({
    resetAvailableLibraries: formMetadata =>
      dispatch(resetAvailableLibraries(formMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setFormData: formData => dispatch(setFormData(formData)),
    setHasError: hasError => dispatch(setHasError(hasError)),
    setLastSavedQuestions: formQuestions =>
      dispatch(setLastSavedQuestions(formQuestions))
  })
)(FoormLibraryEditorManager);
