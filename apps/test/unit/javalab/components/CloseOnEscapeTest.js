import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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

    sinon.assert.calledOnce(handleClose);
  });

  it('passes through provided class name', () => {
    expect(wrapper.find('div').first().props().className).to.equal(className);
  });
});
