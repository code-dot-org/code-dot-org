import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class DeleteVocabularyDialog extends Component {
  static propTypes = {
    handleDeleteVocabularyConfirm: PropTypes.func.isRequired,
    handleDeleteVocabularyDialogClose: PropTypes.func.isRequired,
    vocabularyForDeletion: PropTypes.object.isRequired,
  };

  deleteVocabulary = async () => {
    try {
      const response = await fetch(
        `/vocabularies/${this.props.vocabularyForDeletion.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token':
              document.querySelector('meta[name="csrf-token"]')?.content || '',
          },
        }
      );
      if (response.ok) {
        this.props.handleDeleteVocabularyConfirm();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete vocabulary.');
      }
    } catch (err) {
      alert('Failed to delete vocabulary.');
    }
  };

  render() {
    const {handleDeleteVocabularyDialogClose, vocabularyForDeletion} =
      this.props;
    return (
      <Dialog
        title="Delete Vocabulary"
        description={`Are you sure you want to permanently delete vocabulary "${vocabularyForDeletion.word}"?`}
        onClose={() => handleDeleteVocabularyDialogClose()}
        primaryButtonProps={{
          id: 'delete-vocabulary',
          children: `Delete`,
          size: 'small',
          onClick: () => {
            this.deleteVocabulary();
          },
          color: 'error',
        }}
        secondaryButtonProps={{
          id: 'cancel-delete-vocabulary',
          size: 'small',
          children: 'Cancel',
          color: 'tertiary',
          variant: 'outlined',
          onClick: () => {
            handleDeleteVocabularyDialogClose();
          },
        }}
      />
    );
  }
}

export default DeleteVocabularyDialog;
