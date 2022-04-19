import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import Method, {MethodOverloads} from '@cdo/apps/templates/codeDocs/Method';

describe('Method', () => {
  it('shows MethodOverloads if method has overloads', () => {
    const wrapper = shallow(
      <Method
        method={{
          key: 'method1',
          name: 'method1()',
          overloads: [
            {key: 'method1-int-i', name: 'method1(int i)'},
            {key: 'method1-string-s', name: 'method1(string s)'}
          ]
        }}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.find('StandaloneMethod').length).to.equal(1);
    expect(wrapper.find('MethodOverloads').length).to.equal(1);
  });

  it('does not show MethodOverloads if method doesnt have overloads', () => {
    const wrapper = shallow(
      <Method
        method={{key: 'method1', name: 'method1()', overloads: []}}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.find('StandaloneMethod').length).to.equal(1);
    expect(wrapper.find('MethodOverloads').length).to.equal(0);
  });
});

describe('MethodOverloads', () => {
  it('creates a StandaloneMethod for each overload', () => {
    const wrapper = shallow(
      <MethodOverloads
        overloads={[
          {key: 'method1-int-i', name: 'method1(int i)'},
          {key: 'method1-string-s', name: 'method1(string s)'}
        ]}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.text()).to.include('Overloads');
    expect(wrapper.find('StandaloneMethod').length).to.equal(2);
  });

  it('hides overloads when collapsed', () => {
    const wrapper = shallow(
      <MethodOverloads
        overloads={[
          {key: 'method1-int-i', name: 'method1(int i)'},
          {key: 'method1-string-s', name: 'method1(string s)'}
        ]}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.text()).to.include('Overloads');

    // The section starts open
    expect(wrapper.find('FontAwesome').props().icon).to.equal('caret-down');
    expect(wrapper.find('StandaloneMethod').length).to.equal(2);

    // Click the header to hide the overloads
    wrapper.find('.unittest-overloads-header').simulate('click');
    wrapper.update();

    // The section should be collapsed
    expect(wrapper.find('FontAwesome').props().icon).to.equal('caret-up');
    expect(wrapper.find('StandaloneMethod').length).to.equal(0);
  });
});
