import {expect} from '../../util/configuredChai';
import reducer, {setInitialAnimationMetadata, addAnimation, cloneAnimation,
    deleteAnimation, setAnimationName} from '@cdo/apps/gamelab/animationModule';

describe('animationModule', function () {
  describe('initial state', function () {
    it('is an empty array', function () {
      expect(reducer(undefined, {})).to.deep.equal([]);
    });
  });

  describe('setInitialAnimationMetadata', function () {
    it('sets the entire state for the module', function () {
      const initialMetadata = [{x:1}, {x:2}];
      expect(reducer(NaN, setInitialAnimationMetadata(initialMetadata))).to.deep.equal(initialMetadata);
    });
  });

  describe('addAnimation', function () {
    it('returns a function, must be processed by redux-thunk', function () {
      expect(addAnimation({})).to.be.a.function;
    });
  });

  describe('cloneAnimation', function () {
    it('returns a function, must be processed by redux-thunk', function () {
      expect(cloneAnimation({})).to.be.a.function;
    });
  });

  describe('deleteAnimation', function () {
    it('returns a function, must be processed by redux-thunk', function () {
      expect(deleteAnimation({})).to.be.a.function;
    });
  });

  describe('setAnimationName', function () {
    it('updates the name of the animation with the matching key', function () {
      const initialState = [
        {key: 'abc', name: 'Harry'},
        {key: 'xyz', name: 'David'}
      ];
      expect(reducer(initialState, setAnimationName('abc', 'Harold'))).to.deep.equal([
        {key: 'abc', name: 'Harold'},
        {key: 'xyz', name: 'David'}
      ]);
    });

    it('will not add an animation if the key is not found', function () {
      const initialState = [
        {key: 'abc', name: 'Harry'},
        {key: 'xyz', name: 'David'}
      ];
      expect(reducer(initialState, setAnimationName('ghi', 'Sam'))).to.deep.equal([
        {key: 'abc', name: 'Harry'},
        {key: 'xyz', name: 'David'}
      ]);
    });
  });
});
