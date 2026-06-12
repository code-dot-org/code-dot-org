import {describe, expect, it} from 'vitest';

import {initialSaveState, saveStateReducer, type SaveState} from '../saveState';

const FAILED = {
  type: 'saveFailed' as const,
  fieldErrors: {username: ['Username has already been taken']},
  formErrors: [],
};

describe('saveStateReducer', () => {
  it('starts idle', () => {
    expect(initialSaveState).toEqual({status: 'idle'});
  });

  describe('edit', () => {
    it.each<SaveState>([
      {status: 'idle'},
      {status: 'saved'},
      {status: 'error', fieldErrors: {}, formErrors: ['x']},
    ])('marks the form dirty from %j', state => {
      expect(saveStateReducer(state, {type: 'edit'})).toEqual({
        status: 'dirty',
      });
    });

    it('is ignored while saving (inputs are disabled)', () => {
      const saving: SaveState = {status: 'saving'};
      expect(saveStateReducer(saving, {type: 'edit'})).toBe(saving);
    });
  });

  describe('save', () => {
    it('begins saving from dirty', () => {
      expect(saveStateReducer({status: 'dirty'}, {type: 'save'})).toEqual({
        status: 'saving',
      });
    });

    it('begins saving from a prior error (retry)', () => {
      const errored: SaveState = {
        status: 'error',
        fieldErrors: {},
        formErrors: [],
      };
      expect(saveStateReducer(errored, {type: 'save'})).toEqual({
        status: 'saving',
      });
    });

    it('is a no-op (double-submit guard) while already saving', () => {
      const saving: SaveState = {status: 'saving'};
      expect(saveStateReducer(saving, {type: 'save'})).toBe(saving);
    });

    it.each<SaveState>([{status: 'idle'}, {status: 'saved'}])(
      'does nothing when not dirty (%j)',
      state => {
        expect(saveStateReducer(state, {type: 'save'})).toBe(state);
      },
    );
  });

  describe('saveSucceeded', () => {
    it('moves saving → saved', () => {
      expect(
        saveStateReducer({status: 'saving'}, {type: 'saveSucceeded'}),
      ).toEqual({status: 'saved'});
    });

    it('is ignored unless a save is in flight', () => {
      const dirty: SaveState = {status: 'dirty'};
      expect(saveStateReducer(dirty, {type: 'saveSucceeded'})).toBe(dirty);
    });
  });

  describe('saveFailed', () => {
    it('carries field and form errors into the error state', () => {
      expect(saveStateReducer({status: 'saving'}, FAILED)).toEqual({
        status: 'error',
        fieldErrors: {username: ['Username has already been taken']},
        formErrors: [],
      });
    });

    it('is ignored unless a save is in flight', () => {
      const dirty: SaveState = {status: 'dirty'};
      expect(saveStateReducer(dirty, FAILED)).toBe(dirty);
    });
  });

  it('reset returns to idle from any state', () => {
    const errored: SaveState = {
      status: 'error',
      fieldErrors: {},
      formErrors: ['x'],
    };
    expect(saveStateReducer(errored, {type: 'reset'})).toEqual({
      status: 'idle',
    });
  });
});
