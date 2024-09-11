import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import PhotoSelectionView from '@cdo/apps/javalab/components/PhotoSelectionView';
import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import JavalabConsole from '@cdo/apps/javalab/JavalabConsole';
import javalabConsole, {
  openPhotoPrompter,
  closePhotoPrompter,
} from '@cdo/apps/javalab/redux/consoleRedux';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';
import javalabView, {setDisplayTheme} from '@cdo/apps/javalab/redux/viewRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('Java Lab Console Test', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab, javalabView, javalabConsole});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = props => {
    return mount(
      <Provider store={store}>
        <JavalabConsole
          onInputMessage={() => {}}
          onPhotoPrompterFileSelected={() => {}}
          {...props}
        />
      </Provider>
    );
  };

  describe('Dark and light mode', () => {
    it('Has light mode', () => {
      const editor = createWrapper();
      expect(
        editor.find('input').first().instance().style.backgroundColor
      ).to.equal('rgba(0, 0, 0, 0)');
      expect(
        editor.find('.javalab-console').first().instance().style.backgroundColor
      ).to.equal('rgb(255, 255, 255)');
    });

    it('Has dark mode', () => {
      const editor = createWrapper();
      store.dispatch(setDisplayTheme(DisplayTheme.DARK));
      expect(
        editor.find('input').first().instance().style.backgroundColor
      ).to.equal('rgba(0, 0, 0, 0)');
      expect(
        editor.find('.javalab-console').first().instance().style.backgroundColor
      ).to.equal('rgb(0, 0, 0)');
    });
  });

  describe('Photo prompter', () => {
    const prompt = 'promptText';
    let onPhotoPrompterFileSelected, wrapper;

    beforeEach(() => {
      onPhotoPrompterFileSelected = sinon.stub();
      wrapper = createWrapper({
        onPhotoPrompterFileSelected: onPhotoPrompterFileSelected,
      });
    });

    it('shows and hides photo prompter based on isPhotoPrompterOpen', () => {
      expect(wrapper.find(PhotoSelectionView)).to.be.empty;

      store.dispatch(openPhotoPrompter(prompt));
      wrapper.update();

      expect(wrapper.find(PhotoSelectionView).length).to.equal(1);
      const photoSelectionView = wrapper.find(PhotoSelectionView).first();
      expect(photoSelectionView.props().promptText).to.equal(prompt);

      store.dispatch(closePhotoPrompter());
      wrapper.update();
      expect(wrapper.find(PhotoSelectionView)).to.be.empty;
    });

    it('hides console logs if photo prompter is open', () => {
      expect(wrapper.find('input').length).to.equal(1);

      store.dispatch(openPhotoPrompter(prompt));
      wrapper.update();

      expect(wrapper.find('input')).to.be.empty;
    });

    it('calls onPhotoPrompterFileSelected callback and closes photo prompter after file is selected', () => {
      const file = new File([], 'file');

      store.dispatch(openPhotoPrompter(prompt));
      wrapper.update();

      expect(wrapper.find(PhotoSelectionView).length).to.equal(1);
      const photoSelectionView = wrapper.find(PhotoSelectionView).first();

      photoSelectionView.props().onPhotoSelected(file);
      wrapper.update();

      sinon.assert.calledWith(onPhotoPrompterFileSelected, file);
      expect(wrapper.find(PhotoSelectionView)).to.be.empty;
    });
  });
});
