// Save bar that stays at bottom of the screen of the Foorm Editor.
// Shows last saved time, any errors, and requires confirmation for published surveys.
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ConfirmationDialog from '../../components/confirmation_dialog';
import {connect} from 'react-redux';
import {
  Modal,
  FormGroup,
  ControlLabel,
  Button,
  FormControl
} from 'react-bootstrap';
import Select from 'react-select/lib/Select';
import {SelectStyleProps} from '../../constants';
import 'react-select/dist/react-select.css';
import ModalHelpTip from '@cdo/apps/lib/ui/ModalHelpTip';
import {
  setLibraryQuestionData,
  setLibraryData,
  addAvailableLibrary,
  addAvailableLibraryQuestion,
  setLastSaved,
  setSaveError,
  setLastSavedQuestion
} from './foormLibraryEditorRedux';

const styles = {
  saveButtonBackground: {
    margin: 0,
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: color.lightest_gray,
    borderColor: color.lightest_gray,
    height: 50,
    width: '100%',
    zIndex: 900,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  button: {
    margin: '10px'
  },
  spinner: {
    fontSize: 25,
    padding: 10
  },
  lastSaved: {
    fontSize: 14,
    color: color.level_perfect,
    padding: 15
  },
  error: {
    fontSize: 14,
    color: color.red,
    padding: 15
  },
  warning: {
    color: color.red,
    fontWeight: 'bold'
  }
};

const confirmationDialogNames = {
  save: 'save'
};

class FoormLibrarySaveBar extends Component {
  static propTypes = {
    libraryCategories: PropTypes.array,
    resetCodeMirror: PropTypes.func,

    // Populated by Redux
    libraryQuestion: PropTypes.object,
    libraryHasError: PropTypes.bool,
    libraryQuestionId: PropTypes.number,
    libraryId: PropTypes.number,
    lastSaved: PropTypes.number,
    saveError: PropTypes.string,
    setLibraryData: PropTypes.func,
    setLibraryQuestionData: PropTypes.func,
    addAvailableLibrary: PropTypes.func,
    addAvailableLibraryQuestion: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setLastSavedQuestion: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      confirmationDialogBeingShownName: null,
      isSaving: false,
      showNewLibraryQuestionSave: false,
      libraryQuestionName: null,
      libraryName: null,
      formsAppearedIn: [],
      libraryCategory: null
    };
  }

  updateQuestionUrl = () =>
    `/foorm/library_questions/${this.props.libraryQuestionId}`;

  handleSave = () => {
    this.setState({isSaving: true});
    this.props.setSaveError(null);

    if (
      this.props.libraryQuestionId === null ||
      this.props.libraryQuestionId === undefined
    ) {
      // if this is not an existing library question, show new library question save modal
      this.setState({showNewLibraryQuestionSave: true});
      return;
    }

    $.ajax({
      url: `/foorm/library_questions/${
        this.props.libraryQuestionId
      }/published_forms_appeared_in`,
      type: 'get'
    }).done(result => {
      if (result.length !== 0) {
        this.setState({
          confirmationDialogBeingShownName: confirmationDialogNames.save,
          formsAppearedIn: result
        });
      } else {
        this.save(this.updateQuestionUrl());
      }
    });
  };

  publishedSaveWarning = forms => {
    let formBullets = forms.map((form, i) => <li key={i}>{form}</li>);

    return (
      <div>
        <span style={styles.warning}>Warning: </span>This question appears in
        one or more published surveys, listed below:
        <ul>{formBullets}</ul>
        Please only make safe edits as described in the{' '}
        <a
          href="https://github.com/code-dot-org/code-dot-org/wiki/%5BLevelbuilder%5d-Foorm-Editor:-Editing-a-Form#safe-edits-to-published-forms"
          target="_blank"
          rel="noopener noreferrer"
        >
          How To
        </a>
        .
        <br />
        <br />
        Are you sure you want to save your changes?
      </div>
    );
  };

  handleSaveCancel = () => {
    this.setState({confirmationDialogBeingShownName: null, isSaving: false});
  };

  handleNewLibraryQuestionSaveCancel = () => {
    this.setState({showNewLibraryQuestionSave: false, isSaving: false});
  };

  save = url => {
    $.ajax({
      url: url,
      type: 'put',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        question: this.props.libraryQuestion
      })
    })
      .done(result => {
        this.handleSaveSuccess(result);
        this.setState({
          confirmationDialogBeingShownName: null
        });
      })
      .fail(result => {
        this.handleSaveError(result);
        this.setState({
          confirmationDialogBeingShownName: null
        });
      });
  };

  isNameValid = name => {
    return name && name.match('^[a-z0-9_]+$');
  };

  saveNewLibraryQuestion = () => {
    // Need to include library name if this is a new library (no ID)
    let fullLibraryName = '';
    if (!this.props.libraryId) {
      fullLibraryName = `${this.state.libraryCategory}/${
        this.state.libraryName
      }`;
    }

    $.ajax({
      url: `/foorm/library_questions`,
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        name: this.state.libraryQuestionName,
        question: this.props.libraryQuestion,
        library_id: this.props.libraryId,
        library_name: fullLibraryName
      })
    })
      .done(result => {
        let libraryQuestion = result.library_question;
        let library = result.library;

        this.handleSaveSuccess(libraryQuestion);
        this.setState({
          showNewLibraryQuestionSave: false
        });

        // Since library is new, add to list of options
        // and set as currently selected library.
        this.props.addAvailableLibrary({
          name: library.name,
          version: library.version,
          id: library.id
        });
        this.props.setLibraryData(library);
      })
      .fail(result => {
        this.handleSaveError(result);
        this.setState({
          showNewLibraryQuestionSave: false
        });
      });
  };

  handleSaveSuccess(libraryQuestion) {
    this.setState({
      isSaving: false
    });
    this.props.setLastSaved(Date.now());
    const updatedQuestion = JSON.parse(libraryQuestion.question);
    // reset code mirror with returned questions (may have added question name)
    this.props.resetCodeMirror(updatedQuestion);
    // update store with library question data.
    this.props.addAvailableLibraryQuestion({
      id: libraryQuestion['id'],
      name: libraryQuestion['question_name'],
      type: JSON.parse(libraryQuestion.question)['type']
    });
    this.props.setLibraryQuestionData({
      name: libraryQuestion.question_name,
      id: libraryQuestion.id,
      question: updatedQuestion
    });
    this.props.setLastSavedQuestion(updatedQuestion);
  }

  handleSaveError(result) {
    this.setState({
      isSaving: false
    });

    this.props.setSaveError(
      (result.responseJSON && result.responseJSON.questions) ||
        result.responseText ||
        'Unknown error.'
    );
  }

  showNameError = () =>
    (this.state.libraryQuestionName &&
      !this.isNameValid(this.state.libraryQuestionName)) ||
    (this.state.libraryName && !this.isNameValid(this.state.libraryName));

  disableSaveNewLibraryQuestion = () => {
    // disable if invalid name for library question
    if (this.showNameError()) {
      return true;
    }

    // for existing library, library question name is all that is required
    if (this.props.libraryId && !this.state.libraryQuestionName) {
      return true;
    }

    // for new library, need library name, category, and a library question name
    if (
      !this.props.libraryId &&
      !(
        this.state.libraryName &&
        this.state.libraryCategory &&
        this.state.libraryQuestionName
      )
    ) {
      return true;
    }

    return false;
  };

  renderNewLibraryQuestionSaveModal = () => {
    return (
      <Modal
        show={this.state.showNewLibraryQuestionSave}
        onHide={this.handleNewLibraryQuestionSaveCancel}
      >
        <Modal.Header closeButton>
          <Modal.Title>Save New Library Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            {!this.props.libraryId && (
              <div>
                <ControlLabel>
                  Choose a Category
                  <ModalHelpTip>
                    Select a category for the library. The library name will be
                    prefixed with the category name.
                  </ModalHelpTip>
                </ControlLabel>
                <Select
                  id="folder"
                  value={this.state.libraryCategory}
                  onChange={e => this.setState({libraryCategory: e.value})}
                  placeholder="-"
                  options={this.props.libraryCategories.map(v => ({
                    value: v,
                    label: v
                  }))}
                  required={true}
                  {...SelectStyleProps}
                />
                <ControlLabel>
                  Library Name
                  <ModalHelpTip>
                    Library names must be all lowercase letters (numbers
                    allowed) with underscores to separate words (such as
                    example_library_name).
                  </ModalHelpTip>
                </ControlLabel>
                <FormControl
                  id="libraryName"
                  type="text"
                  required={true}
                  onChange={e => this.setState({libraryName: e.target.value})}
                />
              </div>
            )}
            <ControlLabel>
              Library Question Name
              <ModalHelpTip>
                Library question names must be all lowercase letters (numbers
                allowed) with underscores to separate words (such as
                example_library_question_name).
              </ModalHelpTip>
            </ControlLabel>
            <FormControl
              id="libraryQuestionName"
              type="text"
              required={true}
              onChange={e =>
                this.setState({libraryQuestionName: e.target.value})
              }
            />
          </FormGroup>
          {this.showNameError() && (
            <div>
              <span style={styles.warning}>Error: </span> Library or library
              question name is invalid. Library and library question names must
              be all lowercase letters (numbers allowed) with underscores to
              separate words (such as example_library_question_name).
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle="primary"
            onClick={this.saveNewLibraryQuestion}
            disabled={this.disableSaveNewLibraryQuestion()}
          >
            Save Library Question
          </Button>
          <Button onClick={this.handleNewLibraryQuestionSaveCancel}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  render() {
    return (
      <div>
        <div style={styles.saveButtonBackground} className="saveBar">
          {this.props.lastSaved &&
            !this.props.saveError &&
            !this.props.libraryHasError && (
              <div style={styles.lastSaved} className="lastSavedMessage">
                {`Last saved at: ${new Date(
                  this.props.lastSaved
                ).toLocaleString()}`}
              </div>
            )}
          {this.props.libraryHasError && (
            <div style={styles.error}>
              {`Please fix parsing error before saving. See the errors noted on the left side of the editor.`}
            </div>
          )}
          {this.props.saveError && !this.props.libraryHasError && (
            <div
              style={styles.error}
              className="saveErrorMessage"
            >{`Error Saving: ${this.props.saveError}`}</div>
          )}
          {this.state.isSaving && (
            <div style={styles.spinner}>
              <FontAwesome icon="spinner" className="fa-spin" />
            </div>
          )}
          <button
            className="btn btn-primary"
            type="button"
            style={styles.button}
            onClick={this.handleSave}
            disabled={this.state.isSaving || this.props.libraryHasError}
          >
            Save
          </button>
        </div>
        {this.renderNewLibraryQuestionSaveModal()}
        <ConfirmationDialog
          show={
            this.state.confirmationDialogBeingShownName ===
            confirmationDialogNames.save
          }
          onOk={() => {
            this.save(this.updateQuestionUrl());
          }}
          okText={'Yes, save the library question'}
          onCancel={this.handleSaveCancel}
          headerText="Save Library Question"
          bodyText={this.publishedSaveWarning(this.state.formsAppearedIn)}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    libraryQuestion: state.foorm.libraryQuestion || {},
    libraryHasError: state.foorm.hasError,
    libraryQuestionId: state.foorm.libraryQuestionId,
    lastSaved: state.foorm.lastSaved,
    saveError: state.foorm.saveError,
    libraryId: state.foorm.libraryId
  }),
  dispatch => ({
    setLibraryQuestionData: libraryQuestionData =>
      dispatch(setLibraryQuestionData(libraryQuestionData)),
    setLibraryData: libraryData => dispatch(setLibraryData(libraryData)),
    addAvailableLibrary: libraryMetadata =>
      dispatch(addAvailableLibrary(libraryMetadata)),
    addAvailableLibraryQuestion: libraryQuestionMetadata =>
      dispatch(addAvailableLibraryQuestion(libraryQuestionMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setLastSavedQuestion: libraryQuestion =>
      dispatch(setLastSavedQuestion(libraryQuestion))
  })
)(FoormLibrarySaveBar);
