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
import HelpTipModal from '@cdo/apps/lib/ui/HelpTipModal';
import {
  setFormData,
  addAvilableForm,
  setFormQuestions
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
  saveButton: {
    margin: '10px 50px 10px 20px'
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
      href="https://github.com/code-dot-org/code-dot-org/wiki/%5BLevelbuilder%5D-The-Foorm-Editor"
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

class FoormSaveBar extends Component {
  static propTypes = {
    formCategories: PropTypes.array,
    resetCodeMirror: PropTypes.func,

    // Populated by Redux
    formQuestions: PropTypes.object,
    formHasError: PropTypes.bool,
    isFormPublished: PropTypes.bool,
    formId: PropTypes.number,
    updateFormData: PropTypes.func,
    addAvilableForm: PropTypes.func,
    setFormQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      showSaveConfirmation: false,
      isSaving: false,
      saveError: null,
      lastSaved: null,
      showNewFormSave: false,
      formName: null,
      formCategory: null
    };
  }

  handleSave = () => {
    this.setState({isSaving: true, saveError: null});
    // do warning if in published mode
    if (this.props.isFormPublished) {
      this.setState({showSaveConfirmation: true});
    } else if (!this.props.formId) {
      // if this is not an existing form, show new form save modal
      this.setState({showNewFormSave: true});
    } else {
      this.save();
    }
  };

  handleSaveCancel = () => {
    this.setState({showSaveConfirmation: false, isSaving: false});
  };

  handleNewFormSaveCancel = () => {
    this.setState({showNewFormSave: false, isSaving: false});
  };

  save = () => {
    $.ajax({
      url: `/foorm/forms/${this.props.formId}/update_questions`,
      type: 'put',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        questions: this.props.formQuestions
      })
    })
      .done(result => {
        this.setState({
          showSaveConfirmation: false,
          isSaving: false,
          lastSaved: Date.now()
        });
        const updatedQuestions = JSON.parse(result.questions);
        // reset code mirror with returned questions (may have fixed spacing/added published state)
        this.props.setFormQuestions(updatedQuestions);
        this.props.resetCodeMirror(updatedQuestions);
      })
      .fail(result => {
        this.setState({
          showSaveConfirmation: false,
          saveError:
            (result.responseJSON && result.responseJSON.questions) ||
            'Unknown error.',
          isSaving: false
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
        this.setState({
          showNewFormSave: false,
          isSaving: false,
          lastSaved: Date.now()
        });
        const updatedQuestions = JSON.parse(result.questions);
        this.props.updateFormData({
          published: result.published,
          name: result.name,
          version: result.version,
          id: result.id,
          questions: updatedQuestions
        });
        // adds new form to form dropdown
        this.props.addAvilableForm({
          name: result.name,
          version: result.version,
          id: result.id
        });
        // reset code mirror with returned questions (may have fixed spacing/added published state)
        this.props.resetCodeMirror(updatedQuestions);
      })
      .fail(result => {
        this.setState({
          showNewFormSave: false,
          saveError:
            result.responseText ||
            (result.responseJSON && result.responseJSON.questions) ||
            'Unknown error.',
          isSaving: false
        });
      });
  };

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
              <HelpTipModal>
                Select a category for the form. The form name will be prefixed
                with the category name.
              </HelpTipModal>
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
              <HelpTipModal>
                Form names must be all lowercase letters (numbers allowed) with
                underscores to separate words (such as example_form_name).
              </HelpTipModal>
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
          {this.state.lastSaved &&
            !this.state.saveError &&
            !this.props.formHasError && (
              <div style={styles.lastSaved} className="lastSavedMessage">
                {`Last saved at: ${new Date(
                  this.state.lastSaved
                ).toLocaleString()}`}
              </div>
            )}
          {this.props.formHasError && (
            <div style={styles.error}>
              {`Please fix parsing error before saving. See the errors noted on the left side of the editor.`}
            </div>
          )}
          {this.state.saveError && !this.props.formHasError && (
            <div style={styles.error}>{`Error Saving: ${
              this.state.saveError
            }`}</div>
          )}
          {this.state.isSaving && (
            <div style={styles.spinner}>
              <FontAwesome icon="spinner" className="fa-spin" />
            </div>
          )}
          <button
            className="btn btn-primary"
            type="button"
            style={styles.saveButton}
            onClick={this.handleSave}
            disabled={this.state.isSaving || this.props.formHasError}
          >
            Save
          </button>
        </div>
        {this.renderNewFormSaveModal()}
        <ConfirmationDialog
          show={this.state.showSaveConfirmation}
          onOk={this.save}
          okText={'Yes, save the form'}
          onCancel={this.handleSaveCancel}
          headerText="Save Form"
          bodyText={publishedSaveWarning}
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
    formId: state.foorm.formId
  }),
  dispatch => ({
    updateFormData: formData => dispatch(setFormData(formData)),
    addAvilableForm: formMetadata => dispatch(addAvilableForm(formMetadata)),
    setFormQuestions: formQuestions => dispatch(setFormQuestions(formQuestions))
  })
)(FoormSaveBar);
