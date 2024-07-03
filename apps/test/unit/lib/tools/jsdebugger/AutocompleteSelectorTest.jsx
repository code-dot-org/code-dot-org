import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import AutocompleteSelector from '@cdo/apps/lib/tools/jsdebugger/AutocompleteSelector';


import {allowConsoleWarnings} from '../../../../util/testUtils';

describe('AutocompleteSelector', () => {
  // TODO: (madelynkasula) Silences componentWillReceiveProps deprecation warning due to React 16 upgrade.
  // This warning should be addressed after we've upgraded React.
  allowConsoleWarnings();

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

    componentInstance = mount(component);
  });

  describe('handling option interaction', () => {
    let options;

    beforeEach(() => {
      options = componentInstance.find('.autocomplete-option');
      expect(options.length).toBe(2);
    });

    it('handles clicks', () => {
      options.first().simulate('click');
      expect(clicked).toHaveBeenCalledTimes(1);
      expect(clicked).toHaveBeenCalledWith(FIRST_OPTION_TEXT);
      clicked.resetHistory();
      options.last().simulate('click');
      expect(clicked).toHaveBeenCalledTimes(1);
      expect(clicked).toHaveBeenCalledWith(SECOND_OPTION_TEXT);
    });

    it('handles mouseovers', () => {
      options.first().simulate('mouseOver');
      expect(mousedOver).toHaveBeenCalledTimes(1);
      expect(mousedOver).toHaveBeenCalledWith(0);
      mousedOver.resetHistory();
      options.last().simulate('mouseOver');
      expect(mousedOver).toHaveBeenCalledTimes(1);
      expect(mousedOver).toHaveBeenCalledWith(1);
    });
  });

  it('handles clicks outside of any option', () => {
    document.dispatchEvent(new Event('mousedown'));
    expect(clickOutside).toHaveBeenCalledTimes(1);
  });

  it('styles selected elements with a background color', () => {
    const optionElements = mount(component).find('.autocomplete-option');
    expect(optionElements.length).toBe(2);
    expect(optionElements.at(0)).to.have.style('backgroundColor');
    expect(optionElements.at(1)).to.not.have.style('backgroundColor');
  });
});
