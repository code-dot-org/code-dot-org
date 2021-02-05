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
  addAvilableForm,
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
    isFormPublished: PropTypes.bool,
    libraryQuestionId: PropTypes.number,
    lastSaved: PropTypes.number,
    saveError: PropTypes.string,
    setLibraryQuestionData: PropTypes.func,
    addAvilableForm: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setLastSavedQuestion: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      confirmationDialogBeingShownName: null,
      isSaving: false,
      showNewFormSave: false,
      formName: null,
      formCategory: null,
      formsAppearedIn: []
    };
  }

  updateQuestionUrl = () =>
    `/foorm/library_questions/${this.props.libraryQuestionId}`;

  handleSave = () => {
    this.setState({isSaving: true});
    this.props.setSaveError(null);

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
      } else if (
        this.props.libraryQuestionId === null ||
        this.props.libraryQuestionId === undefined
      ) {
        // if this is not an existing form, show new form save modal
        this.setState({showNewFormSave: true});
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

  handleNewFormSaveCancel = () => {
    this.setState({showNewFormSave: false, isSaving: false});
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

  isFormNameValid = () => {
    return this.state.formName && this.state.formName.match('^[a-z0-9_]+$');
  };

  saveNewForm = () => {};
  // {
  //   const newFormName = `${this.state.formCategory}/${this.state.formName}`;
  //   $.ajax({
  //     url: `/foorm/forms`,
  //     type: 'post',
  //     contentType: 'application/json',
  //     processData: false,
  //     data: JSON.stringify({
  //       name: newFormName,
  //       questions: this.props.formQuestions
  //     })
  //   })
  //     .done(result => {
  //       this.handleSaveSuccess(result);
  //       this.setState({
  //         showNewFormSave: false
  //       });
  //       // adds new form to form dropdown
  //       this.props.addAvilableForm({
  //         name: result.name,
  //         version: result.version,
  //         id: result.id
  //       });
  //     })
  //     .fail(result => {
  //       this.handleSaveError(result);
  //       this.setState({
  //         showNewFormSave: false
  //       });
  //     });
  // };

  handleSaveSuccess(result) {
    this.setState({
      isSaving: false
    });
    this.props.setLastSaved(Date.now());
    const updatedQuestion = JSON.parse(result.question);
    // reset code mirror with returned questions (may have added published state)
    this.props.resetCodeMirror(updatedQuestion);
    // update store with form data.
    this.props.setLibraryQuestionData({
      published: result.published,
      name: result.name,
      id: result.id,
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

  renderNewFormSaveModal = () => {
    const showFormNameError = this.state.formName && !this.isFormNameValid();
    return (
      <Modal
        show={this.state.showNewFormSave}
        onHide={this.handleNewFormSaveCancel}
      >
        <Modal.Header closeButton>
          <Modal.Title>Save New Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>
              Choose a Category
              <ModalHelpTip>
                Select a category for the form. The form name will be prefixed
                with the category name.
              </ModalHelpTip>
            </ControlLabel>
            <Select
              id="folder"
              value={this.state.formCategory}
              onChange={e => this.setState({formCategory: e.value})}
              placeholder="-"
              options={this.props.libraryCategories.map(v => ({
                value: v,
                label: v
              }))}
              required={true}
              {...SelectStyleProps}
            />
            <ControlLabel>
              Form Name
              <ModalHelpTip>
                Form names must be all lowercase letters (numbers allowed) with
                underscores to separate words (such as example_form_name).
              </ModalHelpTip>
            </ControlLabel>
            <FormControl
              id="formName"
              type="text"
              required={true}
              onChange={e => this.setState({formName: e.target.value})}
            />
          </FormGroup>
          {showFormNameError && (
            <div>
              <span style={styles.warning}>Error: </span> Form name is invalid.
              Form names must be all lowercase letters (numbers allowed) with
              underscores to separate words (such as example_form_name).
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle="primary"
            onClick={this.saveNewForm}
            disabled={
              !(this.state.formName && this.state.formCategory) ||
              showFormNameError
            }
          >
            Save Form
          </Button>
          <Button onClick={this.handleNewFormSaveCancel}>Cancel</Button>
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
        {false && this.renderNewFormSaveModal()}s
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
    isFormPublished: state.foorm.isFormPublished,
    libraryHasError: state.foorm.hasError,
    libraryQuestionId: state.foorm.libraryQuestionId,
    lastSaved: state.foorm.lastSaved,
    saveError: state.foorm.saveError
  }),
  dispatch => ({
    setLibraryQuestionData: libraryQuestionData =>
      dispatch(setLibraryQuestionData(libraryQuestionData)),
    addAvilableForm: formMetadata => dispatch(addAvilableForm(formMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setLastSavedQuestion: libraryQuestion =>
      dispatch(setLastSavedQuestion(libraryQuestion))
  })
)(FoormLibrarySaveBar);
