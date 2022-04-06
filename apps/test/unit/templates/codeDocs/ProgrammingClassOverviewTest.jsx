import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ProgrammingClassOverview from '@cdo/apps/templates/codeDocs/ProgrammingClassOverview';

describe('ProgrammingClassOverview', () => {
  let defaultProgrammingClass;

  beforeEach(() => {
    defaultProgrammingClass = {
      name: 'class',
      category: 'World',
      color: 'yellow',
      content: 'A detailed description of what this class does',
      syntax: 'class()',
      tips: 'some tips on how to use this class',
      externalDocumentation: 'example.example',
      fields: [
        {
          name: 'param1',
          type: 'string',
          required: true,
          description: 'description'
        },
        {name: 'param2'}
      ],
      examples: [
        {
          name: 'Example 1',
          description: 'the first example'
        }
      ]
    };
  });

  it('shows all sections if all fields are present', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );

    expect(wrapper.find('h1').text()).to.contain(defaultProgrammingClass.name);
    expect(wrapper.find('h2').map(h => h.text())).to.eql([
      'Examples',
      'Syntax',
      'Tips',
      'Additional Information',
      'Fields'
    ]);

    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(0)
        .props().markdown
    ).to.equal(defaultProgrammingClass.content);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(1)
        .props().markdown
    ).to.contain(defaultProgrammingClass.syntax);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(2)
        .props().markdown
    ).to.equal(defaultProgrammingClass.tips);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(3)
        .props().markdown
    ).to.contain(defaultProgrammingClass.externalDocumentation);

    expect(wrapper.text()).to.contain(defaultProgrammingClass.category);
  });

  it('hides the examples header if no syntax is provided', () => {
    delete defaultProgrammingClass.examples;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Examples');
  });

  it('hides the syntax header if no syntax is provided', () => {
    delete defaultProgrammingClass.syntax;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Syntax');
  });

  it('hides the fields headers if no fields are provided', () => {
    defaultProgrammingClass.fields = [];
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Fields');
  });

  it('hides the tips header if no tips is provided', () => {
    delete defaultProgrammingClass.tips;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Tips');
  });

  it('hides the additional information header if no external documentation is provided', () => {
    delete defaultProgrammingClass.externalDocumentation;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include(
      'Additional Information'
    );
  });

  it('uses hsl color if array is provided for color', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview
        programmingClass={{
          ...defaultProgrammingClass,
          color: [355, '.7', '.7']
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).to.equal(
      'hsl(355,70%, 70%)'
    );
  });

  it('uses hex color if string is provided for color', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview
        programmingClass={{
          ...defaultProgrammingClass,
          color: '#fff176'
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).to.equal(
      '#fff176'
    );
  });

  it('handles null color', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview
        programmingClass={{
          ...defaultProgrammingClass,
          color: null
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).to.be.null;
  });
});
