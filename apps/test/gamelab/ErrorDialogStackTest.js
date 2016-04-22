var errorDialogStackModule = require('@cdo/apps/gamelab/errorDialogStackModule');
var expect = require('chai').expect;

describe('ErrorDialogStack', function () {
  describe('reducer', function () {
    var reducer = errorDialogStackModule.default;

    it('has empty array as default state', function () {
      expect(reducer(undefined, {})).to.deep.equal([]);
    });

    it('returns original state on unhandled action', function () {
      var state = [];
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: reportError', function () {
      var reportError = errorDialogStackModule.reportError;

      it('pushes an error object onto the stack', function () {
        var state = [];
        var newState = reducer([], reportError('a mistake'));
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([
          { message: 'a mistake' }
        ]);
      });

      it('puts the new error object at the beginning of the stack', function () {
        var state = [{ message: 'original' }];
        var newState = reducer(state, reportError('new'));
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([
          { message: 'new' },
          { message: 'original' }
        ]);
      });
    });

    describe('action: dismissError', function () {
      var dismissError = errorDialogStackModule.dismissError;

      it('removes the first error object from the stack', function () {
        var state = [
          { message: 'first' },
          { message: 'second' }
        ];
        var newState = reducer(state, dismissError());
        expect(newState).not.to.equal(state);
        expect(newState).to.deep.equal([
          { message: 'second' }
        ]);
      });

      it('does nothing when stack is already empty', function () {
        var state = [];
        var newState = reducer(state, dismissError());
        expect(newState).to.equal(state);
      });
    });
  });
});
