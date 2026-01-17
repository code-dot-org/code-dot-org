import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

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
  let postStub;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab, javalabView, javalabConsole});
    store = getStore();
    postStub = sinon.stub($, 'post').callsFake(url => {
      if (url.endsWith('/display_theme')) {
        return Promise.resolve({});
      }
      throw new Error(`Unexpected POST in test: ${url}`);
    });
  });

  afterEach(() => {
    postStub.restore();
    restoreRedux();
  });

  const createWrapper = props => {
    return render(
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
      createWrapper();
      expect(
        screen.getByLabelText('console input').style.backgroundColor
      ).to.equal('rgba(0, 0, 0, 0)');
    });

    it('Has dark mode', async () => {
      createWrapper();
      store.dispatch(setDisplayTheme(DisplayTheme.DARK));
      await waitFor(() => {
        expect(
          screen.getByLabelText('console input').style.backgroundColor
        ).to.equal('rgba(0, 0, 0, 0)');
      });
    });
  });

  describe('Photo prompter', () => {
    const prompt = 'promptText';
    let onPhotoPrompterFileSelected;

    beforeEach(() => {
      onPhotoPrompterFileSelected = sinon.stub();
      createWrapper({
        onPhotoPrompterFileSelected: onPhotoPrompterFileSelected,
      });
    });

    it('shows and hides photo prompter based on isPhotoPrompterOpen', async () => {
      expect(screen.queryByText(prompt)).to.equal(null);

      store.dispatch(openPhotoPrompter(prompt));
      await screen.findByText(prompt);

      store.dispatch(closePhotoPrompter());
      await waitFor(() => {
        expect(screen.queryByText(prompt)).to.equal(null);
      });
    });

    it('hides console logs if photo prompter is open', async () => {
      expect(screen.getByLabelText('console input')).to.not.equal(null);

      store.dispatch(openPhotoPrompter(prompt));
      await waitFor(() => {
        expect(screen.queryByLabelText('console input')).to.equal(null);
      });
    });

    it('calls onPhotoPrompterFileSelected callback and closes photo prompter after file is selected', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'file.png', {type: 'image/png'});

      store.dispatch(openPhotoPrompter(prompt));
      const input = await screen.findByLabelText(prompt);

      await user.click(input);
      fireEvent.change(input, {target: {files: [file]}});

      sinon.assert.calledWith(onPhotoPrompterFileSelected, file);
      await waitFor(() => {
        expect(screen.queryByText(prompt)).to.equal(null);
      });
    });
  });
});
