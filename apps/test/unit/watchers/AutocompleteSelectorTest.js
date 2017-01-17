import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import {mount} from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import AutocompleteSelector from '@cdo/apps/templates/watchers/AutocompleteSelector';

describe('AutocompleteSelector', () => {
  let component, componentInstance, clicked, mousedOver, clickOutside;

  const FIRST_OPTION_TEXT = 'option1';
  const SECOND_OPTION_TEXT = 'option2';
  const SELECTED_OPTION_INDEX = 0;

  beforeEach(() => {
    clicked = sinon.spy();
    mousedOver = sinon.spy();
    clickOutside = sinon.spy();

    component = (
      <AutocompleteSelector
        currentText="test"
        currentIndex={SELECTED_OPTION_INDEX}
        options={[FIRST_OPTION_TEXT, SECOND_OPTION_TEXT]}
        onOptionClicked={clicked}
        onOptionHovered={mousedOver}
        onClickOutside={clickOutside}
      />
    );

    componentInstance = ReactTestUtils.renderIntoDocument(component);
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
      expect(clicked).to.have.been.calledWithExactly(FIRST_OPTION_TEXT);
      clicked.reset();
      ReactTestUtils.Simulate.click(options[1]);
      expect(clicked).to.have.been.calledOnce;
      expect(clicked).to.have.been.calledWithExactly(SECOND_OPTION_TEXT);
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

  it('handles clicks outside of any option', () => {
    document.dispatchEvent(new Event('mousedown'));
    expect(clickOutside).to.have.been.calledOnce;
  });

  it('styles selected elements with a background color', () => {
    const optionElements = mount(component).find('.autocomplete-option');
    expect(optionElements.length).to.equal(2);
    expect(optionElements.at(0)).to.have.style('backgroundColor');
    expect(optionElements.at(1)).to.not.have.style('backgroundColor');
  });
});
