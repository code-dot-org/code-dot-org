import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import MethodWithOverloads, {
  MethodOverloadSection,
  SingleMethod,
} from '@cdo/apps/templates/codeDocs/MethodWithOverloads';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('MethodWithOverloads', () => {
  it('shows MethodOverloadSection if method has overloads', () => {
    const wrapper = shallow(
      <MethodWithOverloads
        method={{
          key: 'method1',
          name: 'method1()',
          overloads: [
            {key: 'method1-int-i', name: 'method1(int i)'},
            {key: 'method1-string-s', name: 'method1(string s)'},
          ],
        }}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.find('SingleMethod').length).to.equal(1);
    expect(wrapper.find('MethodOverloadSection').length).to.equal(1);
  });

  it('does not show MethodOverloadSection if method doesnt have overloads', () => {
    const wrapper = shallow(
      <MethodWithOverloads
        method={{key: 'method1', name: 'method1()', overloads: []}}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.find('SingleMethod').length).to.equal(1);
    expect(wrapper.find('MethodOverloadSection').length).to.equal(0);
  });
});

describe('MethodOverloadSection', () => {
  it('creates a SingleMethod for each overload', () => {
    const wrapper = shallow(
      <MethodOverloadSection
        overloads={[
          {key: 'method1-int-i', name: 'method1(int i)'},
          {key: 'method1-string-s', name: 'method1(string s)'},
        ]}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.text()).to.include('Overloads');
    expect(wrapper.find('SingleMethod').length).to.equal(2);
  });

  it('hides overloads when collapsed', () => {
    const wrapper = shallow(
      <MethodOverloadSection
        overloads={[
          {key: 'method1-int-i', name: 'method1(int i)'},
          {key: 'method1-string-s', name: 'method1(string s)'},
        ]}
        programmingEnvironmentName="test-environment"
      />
    );
    expect(wrapper.text()).to.include('Overloads');

    // The section starts open
    expect(wrapper.find('FontAwesome').props().icon).to.equal('caret-down');
    expect(wrapper.find('SingleMethod').length).to.equal(2);

    // Click the header to hide the overloads
    wrapper.find('.unittest-overloads-header').simulate('click');
    wrapper.update();

    // The section should be collapsed
    expect(wrapper.find('FontAwesome').props().icon).to.equal('caret-up');
    expect(wrapper.find('SingleMethod').length).to.equal(0);
  });
});

describe('SingleMethod', () => {
  let defaultMethod;

  beforeEach(() => {
    defaultMethod = {
      key: 'method-int-i',
      name: 'method(int i)',
      content: 'A detailed description of what this method does',
      syntax: 'method(int i)',
      externalLink: 'example.example',
      returnValue: '`string` that represents the return value',
      examples: [
        {
          name: 'Example 1',
          description: 'the first example',
        },
      ],
      parameters: [
        {
          name: 'i',
          type: 'int',
          required: true,
          description: 'a parameter',
        },
      ],
    };
  });

  it('shows all sections if all fields are present', () => {
    const wrapper = shallow(<SingleMethod method={defaultMethod} />);

    expect(wrapper.find('h3').text()).to.contain(defaultMethod.name);
    expect(wrapper.find('h4').map(h => h.text())).to.eql([
      'Returns',
      'Parameters',
      'Examples',
      'Additional Information',
    ]);

    expect(
      wrapper.find('EnhancedSafeMarkdown').at(0).props().markdown
    ).to.equal(defaultMethod.syntax);
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(1).props().markdown
    ).to.contain(defaultMethod.content);
    expect(wrapper.find('ParametersTable').length).to.equal(1);
    expect(wrapper.find('Example').length).to.equal(1);
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(2).props().markdown
    ).to.contain(defaultMethod.externalDocumentation);
  });

  it('hides the returns header if no returnValue is provided', () => {
    delete defaultMethod.returnValue;
    const wrapper = shallow(<SingleMethod method={defaultMethod} />);
    expect(wrapper.find('h4').length).to.be.greaterThan(0);
    expect(wrapper.find('h4').map(h => h.text())).to.not.include('Returns');
  });

  it('hides the examples header if no examples is provided', () => {
    delete defaultMethod.examples;
    const wrapper = shallow(<SingleMethod method={defaultMethod} />);
    expect(wrapper.find('h4').length).to.be.greaterThan(0);
    expect(wrapper.find('h4').map(h => h.text())).to.not.include('Examples');
  });

  it('hides the syntax header if no syntax is provided', () => {
    delete defaultMethod.syntax;
    const wrapper = shallow(<SingleMethod method={defaultMethod} />);
    expect(wrapper.find('h4').length).to.be.greaterThan(0);
    expect(wrapper.find('h4').map(h => h.text())).to.not.include('Syntax');
  });

  it('hides the additional information header if no external documentation is provided', () => {
    delete defaultMethod.externalLink;
    const wrapper = shallow(<SingleMethod method={defaultMethod} />);
    expect(wrapper.find('h4').length).to.be.greaterThan(0);
    expect(wrapper.find('h4').map(h => h.text())).to.not.include(
      'Additional Information'
    );
  });
});
