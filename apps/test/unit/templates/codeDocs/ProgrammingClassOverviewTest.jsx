import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
          description: 'description',
        },
        {name: 'param2'},
      ],
      examples: [
        {
          name: 'Example 1',
          description: 'the first example',
        },
      ],
      methods: [
        {
          key: 'method1',
          name: 'method1()',
        },
        {
          key: 'method2',
          name: 'method2()',
        },
      ],
    };
  });

  it('shows all sections if all fields are present', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );

    expect(wrapper.find('h1').text()).toContain(defaultProgrammingClass.name);
    expect(wrapper.find('h2').map(h => h.text())).toEqual([
      'Examples',
      'Syntax',
      'Tips',
      'Additional Information',
      'Fields',
      'Method Details',
    ]);

    expect(
      wrapper.find('EnhancedSafeMarkdown').at(0).props().markdown
    ).toBe(defaultProgrammingClass.content);
    expect(wrapper.find('EnhancedSafeMarkdown').at(1).props().markdown).toEqual(expect.arrayContaining([defaultProgrammingClass.syntax]));
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(2).props().markdown
    ).toBe(defaultProgrammingClass.tips);
    expect(wrapper.find('EnhancedSafeMarkdown').at(3).props().markdown).toEqual(expect.arrayContaining([defaultProgrammingClass.externalDocumentation]));

    expect(wrapper.text()).toContain(defaultProgrammingClass.category);

    expect(wrapper.find('MethodWithOverloads').length).toBe(2);
  });

  it('hides the examples header if no examples are provided', () => {
    delete defaultProgrammingClass.examples;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Examples');
  });

  it('hides the syntax header if no syntax is provided', () => {
    delete defaultProgrammingClass.syntax;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Syntax');
  });

  it('hides the fields headers if no fields are provided', () => {
    defaultProgrammingClass.fields = [];
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Fields');
  });

  it('hides the tips header if no tips is provided', () => {
    delete defaultProgrammingClass.tips;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Tips');
  });

  it('hides the additional information header if no external documentation is provided', () => {
    delete defaultProgrammingClass.externalDocumentation;
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Additional Information');
  });

  it('hides the methods headers if no fields are provided', () => {
    defaultProgrammingClass.methods = [];
    const wrapper = shallow(
      <ProgrammingClassOverview programmingClass={defaultProgrammingClass} />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Method Details');
  });

  it('uses color if color is provided', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview
        programmingClass={{
          ...defaultProgrammingClass,
          color: '#fff176',
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).toBe('#fff176');
  });

  it('handles null color', () => {
    const wrapper = shallow(
      <ProgrammingClassOverview
        programmingClass={{
          ...defaultProgrammingClass,
          color: null,
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).toBeNull();
  });
});
