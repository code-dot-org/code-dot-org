import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  }
};

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
        this.props.vocabularies.length > 0 ? this.props.vocabularies[0].key : ''
    };
  }

  onVocabularySelect = e => {
    this.setState({selectedVocabularyKey: e.target.value});
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Vocabulary</h2>
        <label>
          <span>Add link to vocabulary:</span>
          <select
            onChange={this.onVocabularySelect}
            value={this.state.selectedVocabularyKey}
          >
            {this.props.vocabularies.map(vocabulary => (
              <option key={vocabulary.key} value={vocabulary.key}>
                {vocabulary.key}
              </option>
            ))}
          </select>
        </label>
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
      </BaseDialog>
    );
  }
}
