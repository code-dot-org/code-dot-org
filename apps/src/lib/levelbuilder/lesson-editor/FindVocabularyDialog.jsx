import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';

import LessonEditorDialog from './LessonEditorDialog';

export default class FindVocabularyDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    vocabularies: PropTypes.arrayOf(vocabularyShape)
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedVocabularyKey:
        this.props.vocabularies.length > 0
          ? this.props.vocabularies[0].markdownKey
          : ''
    };
  }

  onVocabularySelect = e => {
    this.setState({selectedVocabularyKey: e.target.value});
  };

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h2>Add Vocabulary</h2>
        <label>
          <span>Add link to vocabulary:</span>
          <select
            onChange={this.onVocabularySelect}
            value={this.state.selectedVocabularyKey}
          >
            {this.props.vocabularies.map(vocabulary => (
              <option key={vocabulary.key} value={vocabulary.markdownKey}>
                {vocabulary.key}
              </option>
            ))}
          </select>
        </label>
        <p>
          <strong>Note:</strong> Vocabulary Definitions render as raw syntax
          (ie, <code>[v vocab-key/course_offering_key/course_version_key]</code>
          ) in the markdown preview here in the editor, but will render as
          definition-enabled, underlined spans in the actual lesson view.
        </p>
        <DialogFooter rightAlign>
          <Button
            text={'Close and Add'}
            onClick={e => {
              e.preventDefault();
              this.props.handleConfirm(this.state.selectedVocabularyKey);
            }}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </LessonEditorDialog>
    );
  }
}
