/** @file Tests for BaseDialog component */
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from '../../util/configuredChai';
import {findChildrenWithClass} from '../../util/testUtils';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

describe('BaseDialog', function () {
  describe('fullWidth option', function () {
    function getModalDiv(fromRoot) {
      const modals = findChildrenWithClass(fromRoot, 'modal');
      expect(modals.length).to.equal(1);
      return modals[0];
    }

    it('has only the modal class (no explicit width) by default', function () {
      const result = shallowRender(<BaseDialog isOpen/>);
      expect(getModalDiv(result).props.style).to.be.undefined;
    });

    it('has 90% width and -45% left margin if fullWidth is provided', function () {
      const result = shallowRender(<BaseDialog isOpen fullWidth/>);
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
