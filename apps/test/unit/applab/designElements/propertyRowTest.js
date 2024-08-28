import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PropertyRow from '@cdo/apps/applab/designElements/PropertyRow';

describe('applab property row', function () {
  it('does not change an id row when a space is added', () => {
    var initialValue = 'HelloWorld';
    const wrapper = shallow(
      <PropertyRow
        desc={'id'}
        isIdRow={true}
        initialValue={initialValue}
        handleChange={() => {}}
      />
    );
    expect(wrapper.state().value).toBe(initialValue);
    wrapper.instance().handleChangeInternal({target: {value: 'Hello World'}});
    wrapper.update();
    expect(wrapper.state().value).toBe(initialValue);
  });

  it('changes an id row when edited', () => {
    var initialValue = 'HelloWorld';
    const wrapper = shallow(
      <PropertyRow
        desc={'id'}
        isIdRow={true}
        initialValue={initialValue}
        handleChange={() => {}}
      />
    );
    expect(wrapper.state().value).toBe(initialValue);
    wrapper
      .instance()
      .handleChangeInternal({target: {value: initialValue + 's'}});
    wrapper.update();
    expect(wrapper.state().value).toBe(initialValue + 's');
  });

  it('changes a row when edited', () => {
    var initialValue = 'text';
    var targetValue = 'Hello World';
    const wrapper = shallow(
      <PropertyRow
        desc={'text'}
        initialValue={initialValue}
        handleChange={() => {}}
      />
    );
    expect(wrapper.state().value).toBe(initialValue);
    wrapper.instance().handleChangeInternal({target: {value: targetValue}});
    wrapper.update();
    expect(wrapper.state().value).toBe(targetValue);
  });
});
