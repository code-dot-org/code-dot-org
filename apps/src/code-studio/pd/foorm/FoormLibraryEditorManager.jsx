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
  resetAvailableLibraryQuestions,
  setLastSaved,
  setSaveError,
  setLibraryQuestionData,
  setHasError,
  setLastSavedQuestion,
  setLibraryData
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
    libraryCategories: PropTypes.array,

    // populated by redux
    libraryId: PropTypes.number,
    formQuestions: PropTypes.object,
    availableLibraries: PropTypes.array,
    resetAvailableLibraries: PropTypes.func,
    availableLibraryQuestionsForCurrentLibrary: PropTypes.array,
    resetAvailableLibraryQuestions: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setLibraryQuestionData: PropTypes.func,
    setHasError: PropTypes.func,
    setLastSavedQuestion: PropTypes.func,
    setLibraryData: PropTypes.func
  };

  constructor(props) {
    super(props);

    // is/should selectedlibraryid effectively managed by redux?
    this.state = {
      formKey: 0,
      formPreviewQuestions: null,
      showCodeMirror: false,
      hasLoadError: false
    };

    this.props.resetAvailableLibraries(this.props.libraryNamesAndVersions);
  }

  // i'm not sure how I understand how this gets used...
  // formNamesAndVersions is loaded on initialization of
  // the page, so wouldn't get updated unless you
  // reloaded the page?
  componentDidUpdate(prevProps) {
    if (
      prevProps.libraryNamesAndVersions !== this.props.libraryNamesAndVersions
    ) {
      this.props.resetAvailableLibraries(this.props.libraryNamesAndVersions);
    }
  }

  // could probably dedupe this method
  getFormattedConfigurationDropdownOptions() {
    return this.props.availableLibraries.map((libraryNameAndVersion, i) => {
      const libraryName = libraryNameAndVersion['name'];
      const libraryVersion = libraryNameAndVersion['version'];

      return (
        <MenuItem
          key={i}
          eventKey={i}
          onClick={() => this.loadLibraryQuestions(libraryNameAndVersion)}
        >
          {`${libraryName}, version ${libraryVersion}`}
        </MenuItem>
      );
    });
  }

  getFormattedLibraryQuestionDropdownOptions() {
    return this.props.availableLibraryQuestionsForCurrentLibrary.map(
      (libraryQuestionAndType, i) => {
        const libraryQuestionName = libraryQuestionAndType['name'];
        const libraryQuestionType = libraryQuestionAndType['type'];
        const libraryQuestionId = libraryQuestionAndType['id'];
        return (
          <MenuItem
            key={i}
            eventKey={i}
            onClick={() => this.loadLibraryContents(libraryQuestionId)}
          >
            {`${libraryQuestionName} (${libraryQuestionType})`}
          </MenuItem>
        );
      }
    );
  }

  loadLibraryQuestions(selectedLibraryNameAndVersion) {
    let libraryId = selectedLibraryNameAndVersion['id'];

    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    this.props.setLibraryData(selectedLibraryNameAndVersion);

    $.ajax({
      url: `/foorm/libraries/${libraryId}/question_names`,
      type: 'get'
    })
      .done(result => {
        this.props.setHasError(false);
        this.props.resetAvailableLibraryQuestions(result);
        this.setState({
          hasLoadError: false
        });
      })
      .fail(() => {
        // setHasError(true) wasn't in fail handler for loadconfiguration, look into why
        this.props.setHasError(true);
        this.setState({
          hasLoadError: true
        });
      });
  }

  // Need better name here
  loadLibraryContents(libraryQuestionId) {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    $.ajax({
      url: `/foorm/library_questions/${libraryQuestionId}`,
      type: 'get'
    })
      .done(result => {
        this.updateLibraryQuestionData(result);
        this.setState({
          showCodeMirror: true,
          hasLoadError: false
        });
      })
      .fail(() => {
        // need to fix this
        this.updateFormData({
          questions: {},
          published: null,
          formName: null,
          formVersion: null,
          formId: null
        });
        // remove selectedLibraryId from here?
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

    this.updateLibraryQuestionData({
      question: {},
      libraryQuestionName: null,
      libraryQuestionId: null
    });
    this.setState({
      showCodeMirror: true,
      hasLoadError: false
    });
  };

  updateLibraryQuestionData = libraryQuestionData => {
    this.props.setLibraryQuestionData(libraryQuestionData);
    this.props.setHasError(false);
    this.props.setLastSavedQuestion(libraryQuestionData['question']);
    this.props.resetCodeMirror(libraryQuestionData['question']);
  };

  libraryQuestionOptionsAvailable = () => {
    return !!(
      this.props.libraryId &&
      this.props.availableLibraryQuestionsForCurrentLibrary
    );
  };

  // update library dropdown to be disabled instead of not shown when no library question selected
  render() {
    return (
      <div>
        <h1>Foorm Library Editor</h1>
        <p>
          Interface for creating and making updates to Foorm libraries. Check
          out our{' '}
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
          <DropdownButton
            id="load_config"
            title="Load Library..."
            className="btn"
          >
            {this.getFormattedConfigurationDropdownOptions()}
          </DropdownButton>
          <Button onClick={this.initializeEmptyCodeMirror} className="btn">
            New Library
          </Button>
        </div>
        <div>
          <DropdownButton
            id="load_config"
            title="Load Library Question..."
            className="btn"
            disabled={!this.libraryQuestionOptionsAvailable()}
          >
            {this.libraryQuestionOptionsAvailable() &&
              this.getFormattedLibraryQuestionDropdownOptions()}
          </DropdownButton>
          <Button
            onClick={this.initializeEmptyCodeMirror}
            className="btn"
            disabled={!this.libraryQuestionOptionsAvailable()}
          >
            New Library Question
          </Button>
        </div>
        {this.state.hasLoadError && (
          <div style={styles.loadError}>Could not load the selected form.</div>
        )}
        {this.state.showCodeMirror && (
          <FoormLibraryEditor
            populateCodeMirror={this.props.populateCodeMirror}
            libraryCategories={this.props.libraryCategories}
            resetCodeMirror={this.props.resetCodeMirror}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    libraryQuestion: state.foorm.libraryQuestion || {},
    availableLibraries: state.foorm.availableLibraries || [],
    availableLibraryQuestionsForCurrentLibrary:
      state.foorm.availableLibraryQuestionsForCurrentLibrary || [],
    libraryId: state.foorm.libraryId
  }),
  dispatch => ({
    resetAvailableLibraries: formMetadata =>
      dispatch(resetAvailableLibraries(formMetadata)),
    resetAvailableLibraryQuestions: libraryQuestionsMetadata =>
      dispatch(resetAvailableLibraryQuestions(libraryQuestionsMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setLibraryQuestionData: libraryQuestionData =>
      dispatch(setLibraryQuestionData(libraryQuestionData)),
    setHasError: hasError => dispatch(setHasError(hasError)),
    setLastSavedQuestion: libraryQuestion =>
      dispatch(setLastSavedQuestion(libraryQuestion)),
    setLibraryData: libraryData => dispatch(setLibraryData(libraryData))
  })
)(FoormLibraryEditorManager);
