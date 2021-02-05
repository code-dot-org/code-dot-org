import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import color from '@cdo/apps/util/color';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';
import $ from 'jquery';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

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

const initialState = {
  word: '',
  definition: '',
  isSaving: false,
  error: '',
  lessons: []
};

export default class AddVocabularyDialog extends Component {
  static propTypes = {
    afterSave: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    editingVocabulary: vocabularyShape,
    courseVersionId: PropTypes.number.isRequired,
    selectableLessons: PropTypes.arrayOf(PropTypes.object)
  };

  constructor(props) {
    super(props);
    if (this.props.editingVocabulary) {
      this.state = {
        ...this.props.editingVocabulary,
        isSaving: false,
        error: ''
      };
    } else {
      this.state = {...initialState};
    }
  }

  handleWordChange = e => {
    this.setState({word: e.target.value});
  };

  handleDefinitionChange = e => {
    this.setState({definition: e.target.value});
  };

  resetState = () => {
    this.setState(initialState);
  };

  onClose = () => {
    this.resetState();
    this.props.handleClose();
  };

  handleLessonSelectChange = lessonSelections => {
    this.setState({lessons: lessonSelections.map(l => l.value)});
  };

  saveVocabulary = e => {
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
    if (this.props.selectableLessons) {
      data['lessonIds'] = JSON.stringify(this.state.lessons);
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
        this.onClose();
      })
      .fail(error => {
        this.setState({
          isSaving: false,
          error: error.responseText
        });
      });
  };

  render() {
    const canSubmit =
      !this.state.isSaving &&
      this.state.word !== '' &&
      this.state.definition !== '';
    const selectableLessonOptions = this.props.selectableLessons
      ? this.props.selectableLessons.map(l => ({
          label: l.name,
          value: l.id
        }))
      : null;
    return (
      <BaseDialog isOpen={true} handleClose={this.onClose}>
        <h2>
          {this.props.editingVocabulary ? 'Edit Vocabulary' : 'Add Vocabulary'}
        </h2>

        {this.state.error && <h3>{this.state.error}</h3>}

        <label style={styles.inputAndLabel}>
          Word{' '}
          {this.props.editingVocabulary === null &&
            ' (Note: this cannot be edited after creation!)'}
          <input
            type="text"
            name="word"
            value={this.state.word}
            onChange={this.handleWordChange}
            style={styles.textInput}
            disabled={!!this.props.editingVocabulary}
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
        {this.props.selectableLessons && (
          <label>
            Lessons this vocabulary is in
            <Select
              closeMenuOnSelect={false}
              options={selectableLessonOptions}
              multi={true}
              value={this.state.lessons}
              onChange={this.handleLessonSelectChange}
              className={'lessons-dropdown'}
            />
          </label>
        )}

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
