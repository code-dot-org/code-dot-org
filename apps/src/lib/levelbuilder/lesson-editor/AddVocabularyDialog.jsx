import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import color from '@cdo/apps/util/color';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  inputAndLabel: {
    display: 'flex',
    flexDirection: 'column'
  },
  textInput: {
    width: '98%'
  },
  submitButton: {
    color: 'white',
    backgroundColor: color.orange,
    borderColor: color.orange,
    borderRadius: 3,
    fontSize: 12,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5
  }
};

export default class AddVocabularyDialog extends Component {
  static propTypes = {
    afterSave: PropTypes.func,
    handleClose: PropTypes.func,
    editingVocabulary: vocabularyShape,
    courseVersionId: PropTypes.number
  };

  constructor(props) {
    super(props);
    console.log(props);
    if (this.props.editingVocabulary) {
      this.state = {
        ...this.props.editingVocabulary,
        isSaving: false,
        error: ''
      };
    } else {
      this.state = {
        word: '',
        definition: '',
        isSaving: false,
        error: ''
      };
    }
  }

  handleWordChange = e => {
    this.setState({word: e.target.value});
  };

  handleDefinitionChange = e => {
    this.setState({definition: e.target.value});
  };

  saveVocabulary = e => {
    e.preventDefault();
    this.setState({isSaving: true});
    const url = this.props.editingVocabulary
      ? `/vocabularies/${this.props.editingVocabulary.id}`
      : '/vocabularies';
    const method = this.props.editingVocabulary ? 'PATCH' : 'POST';
    const data = {
      word: this.state.word,
      definition: this.state.definition,
      courseVersionId: this.props.courseVersionId
    };
    if (this.props.editingVocabulary) {
      data['key'] = this.props.editingVocabulary.key;
    }
    $.ajax({
      url: url,
      method: method,
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data)
    })
      .done(data => {
        this.props.afterSave(data);
        this.props.handleClose();
      })
      .fail(error => {
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  render() {
    console.log(this.state);
    const canSubmit =
      !this.state.isSaving &&
      this.state.word !== '' &&
      this.state.definition !== '';
    return (
      <BaseDialog isOpen={true} handleClose={this.props.handleClose}>
        <label style={styles.inputAndLabel}>
          Word
          <input
            type="text"
            name="word"
            value={this.state.word}
            onChange={this.handleWordChange}
            style={styles.textInput}
          />
        </label>
        <label style={styles.inputAndLabel}>
          Definition
          <input
            type="text"
            name="definition"
            value={this.state.definition}
            onChange={this.handleDefinitionChange}
            style={styles.textInput}
          />
        </label>
        <DialogFooter rightAlign>
          <button
            id="submit-button"
            type="button"
            style={styles.submitButton}
            onClick={this.saveVocabulary}
            disabled={!canSubmit}
          >
            Close and Save
          </button>
        </DialogFooter>
      </BaseDialog>
    );
  }
}
