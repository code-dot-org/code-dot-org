import $ from 'jquery'; // eslint-disable-line no-restricted-imports
import React from 'react';
import 'jquery-ui/ui/effects/effect-drop';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  showDialog,
  getSuccessDialog,
} from '@cdo/apps/code-studio/levels/dialogHelper';

describe('dialogHelper', () => {
  beforeAll(() => {
    // We need bootstrap-sass for $.fn.modal. In the real app, this is provided by dashboard
    // boostrap-sass also depends on window.jQuery being set. We use require instead
    // of import for boostrap-sass, otherwise babel moves the import to the top of
    // the file (before we've globalized jQuery)
    require('bootstrap-sass');
  });

  describe('showDialog', () => {
    let parent;
    beforeEach(() => {
      parent = document.createElement('div');
      parent.style.display = 'none';
      document.body.appendChild(parent);
    });

    afterEach(() => {
      while (parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
      }
      document.body.removeChild(parent);
    });

    const MyComponent = () => (
      <div>
        <div className="modal-content no-modal-icon">
          <p className="dialog-title">Title</p>
          <p className="dialog-body">Body</p>
          <button type="button" id="cancel-button">
            Cancel
          </button>
          <button type="button" id="ok-button">
            Okay
          </button>
        </div>
      </div>
    );

    it('can take a React component to generate DOM contents', () => {
      const dialog = showDialog(<MyComponent />);
      dialog.hide();
    });

    it('calls callback when ok button is clicked', () => {
      const callback = sinon.spy();
      showDialog(<MyComponent />, callback);
      $('#ok-button').click();
      expect(callback.calledOnce).toBeTruthy();
    });

    it('calls onHidden when ok button is clicked', () => {
      const onHidden = sinon.spy();
      showDialog(<MyComponent />, null, onHidden);
      $('#ok-button').click();
      expect(onHidden.calledOnce).toBeTruthy();
    });

    it('calls onHidden when cancel button is clicked', () => {
      const onHidden = sinon.spy();
      showDialog(<MyComponent />, null, onHidden);
      $('#cancel-button').click();
      expect(onHidden.calledOnce).toBeTruthy();
    });
  });

  describe('getSuccessDialog', () => {
    const fakeAppOptions = (app, levelOptions) => ({
      level: {
        submittable: false,
        answers: [
          {
            text: 'I feel like I could teach this right now',
            correct: true,
          },
          {
            text: 'I feel like I need to do SOME review of lessons, content, etc before I teach this',
            correct: true,
          },
          {
            text: 'I feel like I need to do A LOT of review of lessons, content, etc before I teach this',
            correct: true,
          },
        ],
        ...levelOptions,
      },
      dialog: {
        app,
      },
    });

    it('has the right title/body when using success_title/success_body', () => {
      const appOptions = fakeAppOptions('multi', {
        options: {
          success_title: 'Customized success title',
          success_body: 'Customized success body',
        },
      });
      const dialog = getSuccessDialog(appOptions);
      expect(dialog.props.title).toEqual('Customized success title');
      expect(dialog.props.body).toEqual('Customized success body');
    });

    it('has the right title/body for a standard multi', () => {
      const appOptions = fakeAppOptions('multi');
      const dialog = getSuccessDialog(appOptions);
      expect(dialog.props.title).toEqual('Correct');
      expect(dialog.props.body).toEqual('That is the correct answer.');
    });

    it('has the right title/body for a submittable multi', () => {
      // I can only find on submittable multi, and it's in allthethings, so this
      // probably could be cut if we wanted to simplify.
      // Also, this tests accurately reflects the fact that submittable is the
      // string "true" rather than boolean true here.
      const appOptions = fakeAppOptions('multi', {
        submittable: 'true',
        answers: undefined,
      });
      const dialog = getSuccessDialog(appOptions);
      expect(dialog.props.title).toEqual('Thank you');
      expect(dialog.props.body).toEqual('Thank you for submitting an answer.');
    });

    it('has the right title/body for a text_match without answers', () => {
      // Worth noting that I only see 3 levels that meet this criteria and dont
      // have skip_dialog: true
      const appOptions = fakeAppOptions('text_match', {
        answers: undefined,
      });
      const dialog = getSuccessDialog(appOptions);
      expect(dialog.props.title).toEqual('Thank you');
      expect(dialog.props.body).toEqual('Thanks for your response!');
    });
  });
});
