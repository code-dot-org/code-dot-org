import { assert } from 'chai';
import React from 'react';
import 'jquery-ui/ui/effects/effect-drop';
import $ from 'jquery';
import sinon from 'sinon';
import { showDialog, getSuccessDialog } from '@cdo/apps/code-studio/levels/dialogHelper';

describe('dialogHelper', () => {
  let stashedWindowJquery;
  before(() => {
    stashedWindowJquery = window.jQuery;
    // We need bootstrap-sass for $.modal. In the real app, this is provided by dashboard
    // boostrap-sass also depends on window.jQuery being set. We use require instead
    // of import for boostrap-sass, otherwise babel moves the import to the top of
    // the file (before we've globalized jQuery)
    window.jQuery = $;
    require('bootstrap-sass');
  });

  after(() => {
    window.jQuery = stashedWindowJquery;
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
    });

    const MyComponent = () => (
      <div>
        <div className="modal-content no-modal-icon">
          <p className="dialog-title">Title</p>
          <p className="dialog-body">Body</p>
          <button id="cancel-button">Cancel</button>
          <button id="ok-button">Okay</button>
        </div>
      </div>
    );

    it('can take a React component to generate DOM contents', () => {
      const dialog = showDialog(<MyComponent/>);
      dialog.hide();
    });

    it('calls callback when ok button is clicked', () => {
      const callback = sinon.spy();
      showDialog(<MyComponent/>, callback);
      $('#ok-button').click();
      assert(callback.calledOnce);
    });

    it('calls onHidden when ok button is clicked', () => {
      const onHidden = sinon.spy();
      showDialog(<MyComponent/>, null, onHidden);
      $('#ok-button').click();
      assert(onHidden.calledOnce);
    });

    it('calls onHidden when cancel button is clicked', () => {
      const onHidden = sinon.spy();
      showDialog(<MyComponent/>, null, onHidden);
      $('#cancel-button').click();
      assert(onHidden.calledOnce);
    });
  });

  describe('getSuccessDialog', () => {
    const fakeAppOptions = (app, levelOptions) => ({
      level: {
        submittable: false,
        answers: [
          {
            "text": "I feel like I could teach this right now",
            "correct": true
          },
          {
            "text": "I feel like I need to do SOME review of lessons, content, etc before I teach this",
            "correct": true
          },
          {
            "text": "I feel like I need to do A LOT of review of lessons, content, etc before I teach this",
            "correct": true
          }
        ],
        ...levelOptions,
      },
      dialog: {
        app
      }
    });

    it('has the right title/body when using success_title/success_body', () => {
      const appOptions = fakeAppOptions('multi', {
        options: {
          success_title: 'Customized success title',
          success_body: 'Customized success body'
        }
      });
      const dialog = getSuccessDialog(appOptions);
      assert.equal(dialog.props.title, 'Customized success title');
      assert.equal(dialog.props.body, 'Customized success body');
    });

    it('has the right title/body for a standard multi', () => {
      const appOptions = fakeAppOptions('multi');
      const dialog = getSuccessDialog(appOptions);
      assert.equal(dialog.props.title, 'Correct');
      assert.equal(dialog.props.body, 'That is the correct answer.');
    });

    it('has the right title/body for a submittable multi', () => {
      // I can only find on submittable multi, and it's in allthethings, so this
      // probably could be cut if we wanted to simplify.
      // Also, this tests accurately reflects the fact that submittable is the
      // string "true" rather than boolean true here.
      const appOptions = fakeAppOptions('multi', {
        submittable: "true",
        answers: undefined,
      });
      const dialog = getSuccessDialog(appOptions);
      assert.equal(dialog.props.title, 'Thank you');
      assert.equal(dialog.props.body, 'Thank you for submitting an answer.');
    });

    it('has the right title/body for a text_match without answers', () => {
      // Worth noting that I only see 3 levels that meet this criteria and dont
      // have skip_dialog: true
      const appOptions = fakeAppOptions('text_match', {
        answers: undefined,
      });
      const dialog = getSuccessDialog(appOptions);
      assert.equal(dialog.props.title, 'Thank you');
      assert.equal(dialog.props.body, 'Thanks for your response!');
    });
  });
});
