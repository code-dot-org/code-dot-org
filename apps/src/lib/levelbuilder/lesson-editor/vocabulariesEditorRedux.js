import _ from 'lodash';
import PropTypes from 'prop-types';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'vocabulariesEditor/INIT';
const ADD_VOCABULARY = 'vocabulariesEditor/ADD_VOCABULARY';
const EDIT_VOCABULARY = 'vocabulariesEditor/EDIT_VOCABULARY';
const REMOVE_VOCABULARY = 'vocabulariesEditor/REMOVE_VOCABULARY';

export const initVocabularies = vocabularies => ({
  type: INIT,
  vocabularies
});

export const addVocabulary = newVocabulary => ({
  type: ADD_VOCABULARY,
  newVocabulary
});

export const updateVocabulary = updatedVocabulary => ({
  type: EDIT_VOCABULARY,
  updatedVocabulary
});

export const removeVocabulary = key => ({
  type: REMOVE_VOCABULARY,
  key
});

// Verify that an array of vocabularies all match vocabularyShape
function validateVocabularyList(vocabularies, location) {
  const propTypes = {vocabulary: PropTypes.arrayOf(vocabularyShape)};
  PropTypes.checkPropTypes(propTypes, {vocabularies}, 'property', location);
}

// Verify that a given vocabulary matches vocabularyShape
function validateVocabulary(vocabulary, location) {
  const propTypes = {vocabulary: vocabularyShape};
  PropTypes.checkPropTypes(propTypes, {vocabulary}, 'property', location);
}

export default function vocabularies(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      validateVocabularyList(action.vocabularies, action.type);
      return _.sortBy(action.vocabularies, v => v.word.toLowerCase());
    case ADD_VOCABULARY: {
      validateVocabulary(action.newVocabulary, action.type);
      newState = _.sortBy(newState.concat([action.newVocabulary]), v =>
        v.word.toLowerCase()
      );
      break;
    }
    case EDIT_VOCABULARY: {
      validateVocabulary(action.updatedVocabulary, action.type);
      const vocabularyToEdit = newState.find(
        vocabulary => vocabulary.key === action.updatedVocabulary.key
      );
      Object.assign(vocabularyToEdit, action.updatedVocabulary);
      newState = _.sortBy(newState, v => v.word.toLowerCase());
      break;
    }
    case REMOVE_VOCABULARY: {
      const vocabularyToRemove = newState.find(
        vocabulary => vocabulary.key === action.key
      );
      newState.splice(newState.indexOf(vocabularyToRemove), 1);
      break;
    }
  }

  return newState;
}
