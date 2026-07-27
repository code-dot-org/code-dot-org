import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import AutocompleteSelector from '@cdo/apps/lib/tools/jsdebugger/AutocompleteSelector';

import {expect} from '../../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports
import {allowConsoleWarnings} from '../../../../util/testUtils';

import styles from '@cdo/apps/lib/tools/jsdebugger/AutocompleteSelector.module.scss';

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
      options = componentInstance.find(`.${styles.option}`);
      expect(options.length).to.equal(2);
    });

    it('handles clicks', () => {
      options.first().simulate('click');
      expect(clicked).to.have.been.calledOnce;
      expect(clicked).to.have.been.calledWithExactly(FIRST_OPTION_TEXT);
      clicked.resetHistory();
      options.last().simulate('click');
      expect(clicked).to.have.been.calledOnce;
      expect(clicked).to.have.been.calledWithExactly(SECOND_OPTION_TEXT);
    });

    it('handles mouseovers', () => {
      options.first().simulate('mouseOver');
      expect(mousedOver).to.have.been.calledOnce;
      expect(mousedOver).to.have.been.calledWithExactly(0);
      mousedOver.resetHistory();
      options.last().simulate('mouseOver');
      expect(mousedOver).to.have.been.calledOnce;
      expect(mousedOver).to.have.been.calledWithExactly(1);
    });
  });

  it('handles clicks outside of any option', () => {
    document.dispatchEvent(new Event('mousedown'));
    expect(clickOutside).to.have.been.calledOnce;
  });

  it('marks the selected option', () => {
    const optionElements = mount(component).find(`.${styles.option}`);
    expect(optionElements.length).to.equal(2);
    expect(optionElements.at(0).prop('className')).to.include(styles.selected);
    expect(optionElements.at(1).prop('className')).to.not.include(
      styles.selected
    );
  });
});
