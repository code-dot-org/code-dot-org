import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import FoormEntityEditor from '../components/FoormEntityEditor';
import FoormEntityLoadButtons from '../components/FoormEntityLoadButtons';
import {
  setFetchableSubEntities,
  setLastSaved,
  setSaveError,
  setLibraryQuestionData,
  setHasJSONError,
  setLastSavedQuestions,
  setLibraryData
} from '../foormEditorRedux';
import FoormLibrarySaveBar from './FoormLibrarySaveBar';

const styles = {
  surveyTitle: {
    marginBottom: 0
  },
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

const JSONErrorMessage =
  'There is a parsing error in the JSON being edited. Errors are noted on the left side of the editor.';

/*
  Parent component for editing Foorm Libraries --
  specifically, for editing individual Library Questions that are the atomic unit that underlie each Library.
  Library Questions can be reused across multiple Foorm Forms.
  This component will initially show a choice between loading an existing library or an empty library.
  If an existing library is chosen, a user will then choose between
  editing an existing library question, or creating a new one.
  Finally, after these choices are made, we render FoormLibraryEditor with the chosen
  library question to allow editing that library question.
*/
class FoormLibraryEditorManager extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func,
    resetCodeMirror: PropTypes.func,
    categories: PropTypes.array,

    // populated by redux
    questions: PropTypes.object,
    hasJSONError: PropTypes.bool,
    libraryId: PropTypes.number,
    fetchableLibraries: PropTypes.array,
    libraryName: PropTypes.string,
    libraryQuestionName: PropTypes.string,
    fetchableLibraryQuestionsForCurrentLibrary: PropTypes.array,
    setFetchableLibraryQuestions: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setLibraryQuestionData: PropTypes.func,
    setHasJSONError: PropTypes.func,
    setLastSavedQuestions: PropTypes.func,
    setLibraryData: PropTypes.func
  };

  state = {
    showCodeMirror: false,
    hasLoadError: false,
    forceRerenderKey: 0,
    previewQuestions: null
  };

  getLibraryChoices() {
    return this.props.fetchableLibraries.map((libraryNameAndVersion, i) => {
      const libraryName = libraryNameAndVersion['name'];
      const libraryVersion = libraryNameAndVersion['version'];

      return {
        metadata: libraryNameAndVersion,
        text: `${libraryName}, version ${libraryVersion}`
      };
    });
  }

  getLibraryQuestionChoices() {
    return this.props.fetchableLibraryQuestionsForCurrentLibrary.map(
      (libraryQuestionAndType, i) => {
        const libraryQuestionName = libraryQuestionAndType['name'];
        const libraryQuestionType = libraryQuestionAndType['type'];

        return {
          metadata: libraryQuestionAndType,
          text: `${libraryQuestionName} (${libraryQuestionType})`
        };
      }
    );
  }

  loadLibraryQuestionChoices(libraryMetadata) {
    const libraryId = libraryMetadata.id;

    this.props.setLibraryData(libraryMetadata);
    this.initializeLibraryQuestion(false);

    $.ajax({
      url: `/foorm/libraries/${libraryId}/question_names`,
      type: 'get'
    })
      .done(result => {
        this.props.setFetchableLibraryQuestions(result);
        this.setState({
          hasLoadError: false
        });
      })
      .fail(() => {
        this.setState({
          hasLoadError: true
        });
      });
  }

  loadLibraryQuestionData(libraryQuestionMetadata) {
    const libraryQuestionId = libraryQuestionMetadata.id;

    this.resetSaveStatus();
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
        this.updateLibraryQuestionData({
          question: {},
          name: null,
          id: null
        });
        this.setState({
          showCodeMirror: true,
          hasLoadError: true
        });
      });
  }

  // Callback for FoormEntityEditor
  updateLibraryQuestionPreview() {
    this.setState({
      previewQuestions: {
        elements: [this.props.questions]
      },
      forceRerenderKey: this.state.forceRerenderKey + 1
    });
  }

  // Callback for FoormEntityLoadButtons (for initializing new library)
  initializeNewLibrary() {
    this.props.setFetchableLibraryQuestions([]);
    this.props.setLibraryData({
      name: null,
      version: null,
      id: null
    });
    this.initializeLibraryQuestion(true);
  }

  // Callback for FoormEntityLoadButtons (for initializing new library question)
  initializeLibraryQuestion(showCodeMirror) {
    this.updateLibraryQuestionData({
      question: {},
      name: null,
      id: null
    });

    this.resetSaveStatus();
    this.setState({
      hasLoadError: false,
      showCodeMirror: showCodeMirror
    });
  }

  // Callback for FoormEntityLoadButtons
  showCodeMirror() {
    this.setState({showCodeMirror: true});
  }

  resetSaveStatus() {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
  }

  updateLibraryQuestionData(libraryQuestionData) {
    this.props.setLibraryQuestionData(libraryQuestionData);
    this.props.setHasJSONError(false);
    this.props.setLastSavedQuestions(libraryQuestionData['question']);
    this.props.resetCodeMirror(libraryQuestionData['question']);
  }

  areLibraryQuestionsFetchable() {
    return !!(
      this.props.libraryId &&
      this.props.fetchableLibraryQuestionsForCurrentLibrary
    );
  }

  getPreviewErrors() {
    return this.props.hasJSONError ? [JSONErrorMessage] : [];
  }

  renderHeaderTitle() {
    return (
      this.props.libraryName && (
        <div>
          <h2 style={styles.surveyTitle}>
            {`Library Name: ${this.props.libraryName}`}
            <br />
            {`Library Question Name: ${this.props.libraryQuestionName}`}
          </h2>
        </div>
      )
    );
  }

  renderSaveBar() {
    return (
      <FoormLibrarySaveBar
        libraryCategories={this.props.categories}
        resetCodeMirror={this.props.resetCodeMirror}
      />
    );
  }

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
        <FoormEntityLoadButtons
          resetCodeMirror={this.props.resetCodeMirror}
          resetSelectedData={() => this.initializeNewLibrary()}
          showCodeMirror={() => this.showCodeMirror()}
          onSelect={libraryMetadata =>
            this.loadLibraryQuestionChoices(libraryMetadata)
          }
          foormEntities={this.getLibraryChoices()}
          foormEntityName="Library"
        />
        <FoormEntityLoadButtons
          resetCodeMirror={this.props.resetCodeMirror}
          resetSelectedData={() => this.initializeLibraryQuestion(true)}
          showCodeMirror={() => this.showCodeMirror()}
          onSelect={libraryQuestionMetadata =>
            this.loadLibraryQuestionData(libraryQuestionMetadata)
          }
          foormEntities={this.getLibraryQuestionChoices()}
          foormEntityName="Library Question"
          isDisabled={!this.areLibraryQuestionsFetchable()}
        />
        {this.state.hasLoadError && (
          <div style={styles.loadError}>
            Could not load the selected library or library question.
          </div>
        )}
        {this.state.showCodeMirror && (
          <FoormEntityEditor
            populateCodeMirror={this.props.populateCodeMirror}
            categories={this.props.categories}
            resetCodeMirror={this.props.resetCodeMirror}
            preparePreview={() => this.updateLibraryQuestionPreview()}
            previewQuestions={this.state.previewQuestions}
            previewErrors={this.getPreviewErrors()}
            forceRerenderKey={this.state.forceRerenderKey}
            headerTitle={this.renderHeaderTitle()}
            validateURL={
              '/api/v1/pd/foorm/library_questions/validate_library_question'
            }
            validateDataKey={'question'}
            validateInExistingEntityContext={true}
            saveBar={this.renderSaveBar()}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedFoormLibraryEditorManager = FoormLibraryEditorManager;

export default connect(
  state => ({
    questions: state.foorm.questions || {},
    fetchableLibraries: state.foorm.fetchableEntities || [],
    fetchableLibraryQuestionsForCurrentLibrary:
      state.foorm.fetchableSubEntities || [],
    libraryId: state.foorm.libraryId,
    libraryName: state.foorm.libraryName,
    libraryQuestionName: state.foorm.libraryQuestionName,
    hasJSONError: state.foorm.hasJSONError
  }),
  dispatch => ({
    setFetchableLibraryQuestions: libraryQuestionsMetadata =>
      dispatch(setFetchableSubEntities(libraryQuestionsMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setLibraryQuestionData: libraryQuestionData =>
      dispatch(setLibraryQuestionData(libraryQuestionData)),
    setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
    setLastSavedQuestions: libraryQuestion =>
      dispatch(setLastSavedQuestions(libraryQuestion)),
    setLibraryData: libraryData => dispatch(setLibraryData(libraryData))
  })
)(FoormLibraryEditorManager);
