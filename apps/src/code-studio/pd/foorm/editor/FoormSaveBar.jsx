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
  setFormData,
  addAvilableForm,
  setFormQuestions,
  setLastSaved,
  setSaveError,
  setLastSavedQuestions
} from './foormEditorRedux';

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

const publishedSaveWarning = (
  <div>
    <span style={styles.warning}>Warning: </span>You are editing a published
    survey. Please only make safe edits as described in the{' '}
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

const aboutToPublishWarning = (
  <div>
    <span style={styles.warning}>Warning: </span>You are about to publish a new
    survey. Once a survey is published, it may be put into active use.
    <br />
    <br />
    Are you sure you want to publish?
  </div>
);

const confirmationDialogNames = {
  save: 'save',
  publish: 'publish'
};

class FoormSaveBar extends Component {
  static propTypes = {
    formCategories: PropTypes.array,
    resetCodeMirror: PropTypes.func,

    // Populated by Redux
    formQuestions: PropTypes.object,
    formHasError: PropTypes.bool,
    isFormPublished: PropTypes.bool,
    formId: PropTypes.number,
    lastSaved: PropTypes.number,
    saveError: PropTypes.string,
    setFormData: PropTypes.func,
    addAvilableForm: PropTypes.func,
    setFormQuestions: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setLastSavedQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      confirmationDialogBeingShownName: null,
      isSaving: false,
      showNewFormSave: false,
      formName: null,
      formCategory: null
    };
  }

  handleSave = () => {
    this.setState({isSaving: true});
    this.props.setSaveError(null);
    if (this.props.isFormPublished) {
      // show a warning if in published mode
      this.setState({
        confirmationDialogBeingShownName: confirmationDialogNames.save
      });
    } else if (this.props.formId === null || this.props.formId === undefined) {
      // if this is not an existing form, show new form save modal
      this.setState({showNewFormSave: true});
    } else {
      const saveUrl = `/foorm/forms/${this.props.formId}/update_questions`;
      this.save(saveUrl);
    }
  };

  // Could this be deduped with handleSave?
  handlePublish = () => {
    this.setState({
      isSaving: true,
      confirmationDialogBeingShownName: confirmationDialogNames.publish
    });
    this.props.setSaveError(null);
  };

  // probably should dedupe these two methods (handlesavecancel and handlepublishcancel)
  handleSaveCancel = () => {
    this.setState({confirmationDialogBeingShownName: null, isSaving: false});
  };

  handlePublishCancel = () => {
    this.setState({
      confirmationDialogBeingShownName: null,
      isSaving: false
    });
  };

  handleNewFormSaveCancel = () => {
    this.setState({showNewFormSave: false, isSaving: false});
  };

  save = url => {
    // Dedupe AJAX request? Only diffs in URL, maybe some state changes?
    // Figure out what to do with saveError?
    // Need to update this so it doesn't automatically make survey published?
    $.ajax({
      url: url,
      type: 'put',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        questions: this.props.formQuestions
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

  saveNewForm = () => {
    const newFormName = `${this.state.formCategory}/${this.state.formName}`;
    $.ajax({
      url: `/foorm/forms`,
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        name: newFormName,
        questions: this.props.formQuestions
      })
    })
      .done(result => {
        this.handleSaveSuccess(result);
        this.setState({
          showNewFormSave: false
        });
        // adds new form to form dropdown
        this.props.addAvilableForm({
          name: result.name,
          version: result.version,
          id: result.id
        });
      })
      .fail(result => {
        this.handleSaveError(result);
        this.setState({
          showNewFormSave: false
        });
      });
  };

  handleSaveSuccess(result) {
    this.setState({
      isSaving: false
    });
    this.props.setLastSaved(Date.now());
    const updatedQuestions = JSON.parse(result.questions);
    // reset code mirror with returned questions (may have added published state)
    this.props.resetCodeMirror(updatedQuestions);
    // update store with form data.
    this.props.setFormData({
      published: result.published,
      name: result.name,
      version: result.version,
      id: result.id,
      questions: updatedQuestions
    });
    this.props.setLastSavedQuestions(updatedQuestions);
  }

  handleSaveError(result) {
    this.setState({
      isSaving: false
    });
    // figure out exactly what this is doing
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
              options={this.props.formCategories.map(v => ({
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
            !this.props.formHasError && (
              <div style={styles.lastSaved} className="lastSavedMessage">
                {`Last saved at: ${new Date(
                  this.props.lastSaved
                ).toLocaleString()}`}
              </div>
            )}
          {this.props.formHasError && (
            <div style={styles.error}>
              {`Please fix parsing error before saving. See the errors noted on the left side of the editor.`}
            </div>
          )}
          {this.props.saveError && !this.props.formHasError && (
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
          {!this.props.isFormPublished && (
            <button
              className="btn btn-danger"
              type="button"
              style={styles.button}
              onClick={this.handlePublish}
              disabled={this.state.isSaving || this.props.formHasError}
            >
              Publish
            </button>
          )}
          <button
            className="btn btn-primary"
            type="button"
            style={styles.button}
            onClick={this.handleSave}
            disabled={this.state.isSaving || this.props.formHasError}
          >
            Save
          </button>
        </div>
        {this.renderNewFormSaveModal()}
        <ConfirmationDialog
          show={
            this.state.confirmationDialogBeingShownName ===
            confirmationDialogNames.save
          }
          onOk={() => {
            this.save(`/foorm/forms/${this.props.formId}/update_questions`);
          }}
          okText={'Yes, save the form'}
          onCancel={this.handleSaveCancel}
          headerText="Save Form"
          bodyText={publishedSaveWarning}
        />
        <ConfirmationDialog
          show={
            this.state.confirmationDialogBeingShownName ===
            confirmationDialogNames.publish
          }
          onOk={() => {
            this.save(`/foorm/forms/${this.props.formId}/publish`);
          }}
          okText={'Yes, publish the form'}
          onCancel={this.handlePublishCancel}
          headerText="Publish Form"
          bodyText={aboutToPublishWarning}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    formQuestions: state.foorm.formQuestions || {},
    isFormPublished: state.foorm.isFormPublished,
    formHasError: state.foorm.hasError,
    formId: state.foorm.formId,
    lastSaved: state.foorm.lastSaved,
    saveError: state.foorm.saveError
  }),
  dispatch => ({
    setFormData: formData => dispatch(setFormData(formData)),
    addAvilableForm: formMetadata => dispatch(addAvilableForm(formMetadata)),
    setFormQuestions: formQuestions =>
      dispatch(setFormQuestions(formQuestions)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setLastSavedQuestions: formQuestions =>
      dispatch(setLastSavedQuestions(formQuestions))
  })
)(FoormSaveBar);
