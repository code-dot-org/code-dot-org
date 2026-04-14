import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import DeleteVocabularyDialog from '@cdo/apps/levelbuilder/lesson-editor/DeleteVocabularyDialog';

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('DeleteVocabularyDialog', () => {
  let handleDeleteVocabularyConfirm,
    handleDeleteVocabularyDialogClose,
    fetchSpy,
    alertSpy,
    defaultProps;

  beforeEach(() => {
    handleDeleteVocabularyConfirm = jest.fn();
    handleDeleteVocabularyDialogClose = jest.fn();
    fetchSpy = jest.spyOn(window, 'fetch');
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    defaultProps = {
      vocabularyForDeletion: {
        id: 10,
        word: 'algorithm',
      },
      handleDeleteVocabularyConfirm,
      handleDeleteVocabularyDialogClose,
    };
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('shows the vocabulary word in the dialog copy', () => {
    const wrapper = mount(<DeleteVocabularyDialog {...defaultProps} />);
    expect(wrapper.text()).toContain('algorithm');
  });

  it('deletes vocabulary and calls confirm handler on success', async () => {
    fetchSpy.mockResolvedValue({ok: true});
    const wrapper = mount(<DeleteVocabularyDialog {...defaultProps} />);
    wrapper.find('#delete-vocabulary').first().simulate('click');
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalledWith('/vocabularies/10', {
      method: 'DELETE',
      headers: expect.objectContaining({'Content-Type': 'application/json'}),
    });
    expect(handleDeleteVocabularyConfirm).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows an alert when delete fails', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({message: 'boom'}),
    });
    const wrapper = mount(<DeleteVocabularyDialog {...defaultProps} />);

    wrapper.find('#delete-vocabulary').first().simulate('click');
    await flushPromises();

    expect(handleDeleteVocabularyConfirm).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('closes dialog without deleting when cancel is clicked', () => {
    const wrapper = mount(<DeleteVocabularyDialog {...defaultProps} />);
    wrapper.find('#cancel-delete-vocabulary').first().simulate('click');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(handleDeleteVocabularyDialogClose).toHaveBeenCalledTimes(1);
  });
});
