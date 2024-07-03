import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';



describe('CloseOnEscape', () => {
  let wrapper, handleClose, className;

  beforeEach(() => {
    className = '.class-name';
    handleClose = sinon.spy();
    wrapper = shallow(
      <CloseOnEscape handleClose={handleClose} className={className} />
    );
  });

  it('calls handleClose() function when Escape pressed', () => {
    wrapper.find('div').first().props().onKeyDown({key: 'Escape'});

    sinon.toHaveBeenCalledTimes(1);
  });

  it('passes through provided class name', () => {
    expect(wrapper.find('div').first().props().className).toBe(className);
  });
});
