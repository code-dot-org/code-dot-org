import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import AutocompleteSelector from '@cdo/apps/templates/watchers/AutocompleteSelector';

describe('AutocompleteSelector', () => {
  let componentInstance, clicked, mousedOver, clickOutside;

  beforeEach(() => {
    clicked = sinon.spy();
    mousedOver = sinon.spy();
    clickOutside = sinon.spy();

    componentInstance = ReactTestUtils.renderIntoDocument(
      <AutocompleteSelector
        currentText="test"
        currentIndex={2}
        options={['option1', 'option2']}
        onOptionClicked={clicked}
        onOptionHovered={mousedOver}
        onClickOutside={clickOutside}
      />);
  });

  describe('handling option interaction', () => {
    let options;

    beforeEach(() => {
      options = ReactTestUtils.scryRenderedDOMComponentsWithClass(
        componentInstance, 'autocomplete-option');
      expect(options.length).to.equal(2);
    });

    it('handles clicks', () => {
      ReactTestUtils.Simulate.click(options[0]);
      expect(clicked).to.have.been.calledOnce;
      expect(clicked).to.have.been.calledWithExactly('option1');
      clicked.reset();
      ReactTestUtils.Simulate.click(options[1]);
      expect(clicked).to.have.been.calledOnce;
      expect(clicked).to.have.been.calledWithExactly('option2');
    });

    it('handles mouseovers', () => {
      ReactTestUtils.Simulate.mouseOver(options[0]);
      expect(mousedOver).to.have.been.calledOnce;
      expect(mousedOver).to.have.been.calledWithExactly(0);
      mousedOver.reset();
      ReactTestUtils.Simulate.mouseOver(options[1]);
      expect(mousedOver).to.have.been.calledOnce;
      expect(mousedOver).to.have.been.calledWithExactly(1);
    });
  });

  //it('handles clicks outside of any option', () => {
  //  // TODO (bjordan): trigger click outside
  //  return;
  //
  //  var panel = ReactTestUtils.scryRenderedDOMComponentsWithClass(
  //    componentInstance, 'autocomplete-panel');
  //  expect(panel.length).to.equal(1);
  //  ReactTestUtils.Simulate.click(panel[0]);
  //  expect(clickOutside).to.have.been.calledOnce;
  //});
});
