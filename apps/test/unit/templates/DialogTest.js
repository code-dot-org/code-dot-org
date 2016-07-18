/** @file Tests for Dialog component */
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';
import {findChildrenWithClass} from '../../util/testUtils';

// Import order matters here :(
setupLocales();
var Dialog = require('@cdo/apps/templates/Dialog').default;

describe('Dialog', function () {
  describe('fullWidth option', function () {
    function getModalDiv(fromRoot) {
      const modals = findChildrenWithClass(fromRoot, 'modal');
      expect(modals.length).to.equal(1);
      return modals[0];
    }

    it('has only the modal class (no explicit width) by default', function () {
      // Shallow-render two layers to see width properties rendered by BaseDialog
      const baseDialog = shallowRender(<Dialog isOpen/>);
      const result = shallowRender(baseDialog);
      expect(getModalDiv(result).props.style).to.be.undefined;
    });

    it('has 90% width and -45% left margin if fullWidth is provided', function () {
      // Shallow-render two layers to see width properties rendered by BaseDialog
      const baseDialog = shallowRender(<Dialog isOpen fullWidth/>);
      const result = shallowRender(baseDialog);
      expect(getModalDiv(result).props.style).to.deep.equal({
        width: '90%',
        marginLeft: '-45%'
      });
    });
  });
});

function shallowRender(component) {
  let renderer = ReactTestUtils.createRenderer();
  renderer.render(component);
  return renderer.getRenderOutput();
}
