var errorDialogStackModule = require('@cdo/apps/p5lab/errorDialogStackModule');
import {expect} from '../../util/configuredChai';
import {UnconnectedErrorDialogStack as ErrorDialogStack} from '@cdo/apps/p5lab/ErrorDialogStack';
import {mount} from 'enzyme';
import React from 'react';

describe('ErrorDialogStack', function() {
  describe('reducer', function() {
    var reducer = errorDialogStackModule.default;

    it('has empty array as default state', function() {
      expect(reducer(undefined, {})).to.deep.equal([]);
    });

    it('returns original state on unhandled action', function() {
      var state = [];
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: reportError', function() {
      var reportError = errorDialogStackModule.reportError;

      it('pushes an error object onto the stack', function() {
        var state = [];
        var newState = reducer([], reportError('a mistake'));
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([
          {message: 'a mistake', error_type: undefined, error_cause: undefined}
        ]);
      });

      it('puts the new error object at the beginning of the stack', function() {
        var state = [
          {message: 'original', error_type: undefined, error_cause: undefined}
        ];
        var newState = reducer(state, reportError('new'));
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([
          {message: 'new', error_type: undefined, error_cause: undefined},
          {message: 'original', error_type: undefined, error_cause: undefined}
        ]);
      });

      it('pushes an animation load error object onto the stack', function() {
        var state = [];
        var newState = reducer(
          [],
          reportError('a mistake', 'anim_load', '1234')
        );
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([
          {message: 'a mistake', error_type: 'anim_load', error_cause: '1234'}
        ]);
      });

      it('displays additional message and buttons for an animation load error', function() {
        var newState = reducer(
          [],
          reportError('a mistake', 'anim_load', '1234')
        );
        var dialog = mount(
          <ErrorDialogStack
            errors={newState}
            dismissError={() => {}}
            deleteAnimation={() => {}}
            animationList={undefined}
          />
        );
        expect(dialog.text()).to.contain(
          'It looks like we are having trouble loading your animation'
        );
        expect(dialog.text()).to.contain('https://code.org/contact');
        expect(dialog.find('Button')).to.have.length(2);
      });

      it('does not display additional message and buttons for a generic error', function() {
        var newState = reducer([], reportError('a mistake'));
        var dialog = mount(
          <ErrorDialogStack
            errors={newState}
            dismissError={() => {}}
            deleteAnimation={() => {}}
            animationList={undefined}
          />
        );
        expect(dialog.text()).to.not.contain(
          'It looks like we are having trouble loading your animation'
        );
        expect(dialog.find('Button')).to.have.length(0);
      });
    });

    describe('action: dismissError', function() {
      var dismissError = errorDialogStackModule.dismissError;

      it('removes the first error object from the stack', function() {
        var state = [{message: 'first'}, {message: 'second'}];
        var newState = reducer(state, dismissError());
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([{message: 'second'}]);
      });

      it('does nothing when stack is already empty', function() {
        var state = [];
        var newState = reducer(state, dismissError());
        expect(newState).to.equal(state);
      });
    });
  });
});
