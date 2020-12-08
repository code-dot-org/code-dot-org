import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ConfirmationDialog from '../../components/confirmation_dialog';
import {connect} from 'react-redux';

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
  }
};

const publishedSaveWarning = (
  <div>
    <span style={styles.warning}>Warning: </span>You are editing a published
    survey. Please only make safe edits as described in the{' '}
    <a href="https://github.com/code-dot-org/code-dot-org/wiki/%5BLevelbuilder%5D-The-Foorm-Editor">
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
    formId: PropTypes.number,

    // Populated by Redux
    formQuestions: PropTypes.object,
    formHasError: PropTypes.bool,
    isFormPublished: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      showSaveConfirmation: false,
      isSaving: false,
      saveError: null,
      lastSaved: null
    };
  }

  handleSave = () => {
    if (this.props.formHasError) {
      this.setState({
        saveError:
          'There is a parsing error. See the errors noted on the left side of the editor.'
      });
      return;
    }
    this.setState({isSaving: true, saveError: null});
    // do warning if in published mode
    if (this.props.isFormPublished) {
      this.setState({showSaveConfirmation: true});
    } else {
      this.save();
    }
  };

  handleSaveCancel = () => {
    this.setState({showSaveConfirmation: false});
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

  render() {
    return (
      <div>
        <div style={styles.saveButtonBackground} className="saveBar">
          {this.state.lastSaved && !this.state.error && (
            <div style={styles.lastSaved} className="lastSavedMessage">
              {`Last saved at: ${new Date(
                this.state.lastSaved
              ).toLocaleString()}`}
            </div>
          )}
          {this.state.saveError && (
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
            disabled={this.state.isSaving}
          >
            Save
          </button>
        </div>
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
    formHasError: state.foorm.hasError
  }),
  dispatch => ({})
)(FoormSaveBar);
