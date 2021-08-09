import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';
import JavalabConsole from '@cdo/apps/javalab/JavalabConsole';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import javalab, {setIsDarkMode} from '@cdo/apps/javalab/javalabRedux';

describe('Java Lab Console Test', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = () => {
    return mount(
      <Provider store={store}>
        <JavalabConsole onInputMessage={() => {}} />
      </Provider>
    );
  };

  describe('Dark and light mode', () => {
    it('Has light mode', () => {
      const editor = createWrapper();
      expect(
        editor
          .find('input')
          .first()
          .instance().style.backgroundColor
      ).to.equal('rgb(255, 255, 255)');
      expect(
        editor
          .find('.javalab-console')
          .first()
          .instance().style.backgroundColor
      ).to.equal('rgb(255, 255, 255)');
    });

    it('Has dark mode', () => {
      const editor = createWrapper();
      store.dispatch(setIsDarkMode(true));
      expect(
        editor
          .find('input')
          .first()
          .instance().style.backgroundColor
      ).to.equal('rgb(0, 0, 0)');
      expect(
        editor
          .find('.javalab-console')
          .first()
          .instance().style.backgroundColor
      ).to.equal('rgb(0, 0, 0)');
    });
  });
});
