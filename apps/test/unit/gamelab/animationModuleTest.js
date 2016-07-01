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
      const initialMetadata = [{key:1}, {key:2}];
      const newState = reducer(['an','y','thing'], setInitialAnimationMetadata(initialMetadata));
      expect(newState.length).to.equal(2);
      expect(newState[0]).to.deep.equal({
        key: '1',
        name: '',
        frameCount: 1,
        frameRate: 15,
        frameSize: {x: 1, y: 1},
        size: 0,
        sourceSize: {x: 1, y: 1},
        sourceUrl: undefined,
        version: undefined
      });
      expect(newState[1]).to.deep.equal({
        key: '2',
        name: '',
        frameCount: 1,
        frameRate: 15,
        frameSize: {x: 1, y: 1},
        size: 0,
        sourceSize: {x: 1, y: 1},
        sourceUrl: undefined,
        version: undefined
      });
    });

    it('upgrades imported animation metadata to the latest format', function () {
      // Specifically this is an example from a metadata change in early May
      const oldAnimation = {
        key: 'abc',
        name: 'This Old House',
        sourceUrl: '/v3/animations/channel-id/animation-key.png',
        size: 15,
        version: '1'
      };
      const newState = reducer([], setInitialAnimationMetadata([oldAnimation]));
      expect(newState[0]).to.deep.equal({
        key: 'abc',
        name: 'This Old House',
        sourceUrl: '/v3/animations/channel-id/animation-key.png',
        sourceSize: {x: 1, y: 1},
        frameSize: {x: 1, y: 1},
        frameCount: 1,
        frameRate: 15,
        size: 15,
        version: '1'
      });
    });

    it('throws TypeError if metadata is invalid', function () {
      expect(function () {
        reducer([], setInitialAnimationMetadata([{name: 'broken'}]));
      }).to.throw(TypeError);
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
