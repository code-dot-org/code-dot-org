import { assert } from 'chai';
import React from 'react';
import 'jquery-ui/ui/effects/effect-drop';
import $ from 'jquery';
import sinon from 'sinon';
import { showDialog } from '@cdo/apps/code-studio/levels/dialogHelper';

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

    // Note: Though it can do this, we'd like to get away from this usage
    it('can take a string type including DOM contents', () => {
      const child = `
        <div id="my-type-dialogcontent">
          <div class="modal-content no-modal-icon">
            <p class="dialog-title">Title</p>
            <p class="dialog-body">Body</p>
            <button id="cancel-button">Cancel</button>
            <button id="ok-button">Okay</button>
          </div>
        </div>
      `;
      // const child = document.createElement('div');
      // child.setAttribute('id', 'my-type-dialogcontent');
      $(parent).append(child);
      const dialog = showDialog('my-type');
      dialog.hide();
    });

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
});
