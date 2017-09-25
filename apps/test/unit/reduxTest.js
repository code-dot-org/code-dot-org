import {expect} from 'chai';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  hasReducer,
  getStore,
} from '@cdo/apps/redux';


function incrementor(state, action) {
  if (state === undefined) {
    state = 0;
  }
  if (action.type === 'INCREMENT') {
    state++;
  } else if (action.type === 'DECREMENT') {
    state--;
  }
  return state;
}

describe('global redux store', () => {
  beforeEach(() => {
    stubRedux();
  });
  afterEach(() => {
    restoreRedux();
  });

  describe('the registerReducers function', () => {

    beforeEach(() => {
      registerReducers({incrementor});
    });

    it('attaches reducers to the global store', () => {
      expect(hasReducer('incrementor')).to.be.true;

      getStore().dispatch({type: 'INCREMENT'});
      expect(getStore().getState()).to.deep.equal({incrementor: 1});

      getStore().dispatch({type: 'DECREMENT'});
      expect(getStore().getState()).to.deep.equal({incrementor: 0});
    });

    it('throws an exception if a reducer is already registered', () => {
      expect(() => registerReducers({incrementor: state => 1})).to.throw(
        Error,
        'reducer with key "incrementor" already registered!'
      );
    });

    it('does not throw an exception if you reregister the same reducer under the same name', () => {
      registerReducers({incrementor});
    });

    it("does not clobber previously registered reducers or state", () => {
      getStore().dispatch({type: 'INCREMENT'});
      getStore().dispatch({type: 'INCREMENT'});
      getStore().dispatch({type: 'INCREMENT'});
      expect(getStore().getState()).to.deep.equal({incrementor: 3});

      registerReducers({otherIncrementor: incrementor});
      getStore().dispatch({type: 'INCREMENT'});
      getStore().dispatch({type: 'INCREMENT'});
      expect(getStore().getState()).to.deep.equal({incrementor: 5, otherIncrementor: 2});
    });

    it("allows you to register multiple reducers at once", () => {
      registerReducers({a: incrementor, b: () => 'hello'});
      expect(hasReducer('a')).to.be.true;
      expect(hasReducer('b')).to.be.true;
    });

  });
});
