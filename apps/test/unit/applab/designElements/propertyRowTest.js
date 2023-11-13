import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import PropertyRow from '@cdo/apps/applab/designElements/PropertyRow';
import {shallow} from 'enzyme';

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
    expect(wrapper.state().value).to.equal(initialValue);
    wrapper.instance().handleChangeInternal({target: {value: 'Hello World'}});
    wrapper.update();
    expect(wrapper.state().value).to.equal(initialValue);
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
    expect(wrapper.state().value).to.equal(initialValue);
    wrapper
      .instance()
      .handleChangeInternal({target: {value: initialValue + 's'}});
    wrapper.update();
    expect(wrapper.state().value).to.equal(initialValue + 's');
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
    expect(wrapper.state().value).to.equal(initialValue);
    wrapper.instance().handleChangeInternal({target: {value: targetValue}});
    wrapper.update();
    expect(wrapper.state().value).to.equal(targetValue);
  });
});
