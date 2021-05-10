import {assert} from 'chai';
import vocabularyEditor, {
  addVocabulary,
  updateVocabulary,
  removeVocabulary
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import _ from 'lodash';

const getInitialState = () => [
  {
    id: 1,
    key: 'vocabulary-1',
    word: 'vocabulary-1',
    definition: 'definition1',
    commonSenseMedia: false
  },
  {
    id: 2,
    key: 'vocabulary-2',
    word: 'vocabulary-2',
    definition: 'definition2',
    commonSenseMedia: false
  }
];

describe('vocabulariesEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('add vocabulary', () => {
    const nextState = vocabularyEditor(
      initialState,
      addVocabulary({
        id: 3,
        key: 'new-word',
        word: 'new-word',
        definition: 'new-definition',
        commonSenseMedia: false
      })
    );
    assert.deepEqual(nextState.map(r => r.key), [
      'vocabulary-1',
      'vocabulary-2',
      'new-word'
    ]);
  });

  it('edit vocabulary', () => {
    const editedVocabulary = _.cloneDeep(initialState[0]);
    editedVocabulary.word = 'new word';
    const nextState = vocabularyEditor(
      initialState,
      updateVocabulary(editedVocabulary)
    );
    assert.deepEqual(nextState.map(r => r.word), ['new word', 'vocabulary-2']);
  });

  it('remove vocabulary', () => {
    const nextState = vocabularyEditor(
      initialState,
      removeVocabulary('vocabulary-1')
    );
    assert.deepEqual(nextState.map(r => r.key), ['vocabulary-2']);
  });
});
