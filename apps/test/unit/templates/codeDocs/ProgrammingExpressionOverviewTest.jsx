import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ProgrammingExpressionOverview from '@cdo/apps/templates/codeDocs/ProgrammingExpressionOverview';



describe('ProgrammingExpressionOverview', () => {
  let defaultProgrammingExpression;

  beforeEach(() => {
    defaultProgrammingExpression = {
      name: 'block',
      category: 'World',
      color: 'yellow',
      content: 'A detailed description of what this block does',
      syntax: 'block()',
      returnValue: 'no return value',
      tips: 'some tips on how to use this block',
      externalDocumentation: 'example.example',
      parameters: [
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
    };
  });

  it('shows all sections if all fields are present', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );

    expect(wrapper.find('h1').text()).toContain(defaultProgrammingExpression.name);
    expect(wrapper.find('h2').map(h => h.text())).toEqual([
      'Examples',
      'Syntax',
      'Parameters',
      'Returns',
      'Tips',
      'Additional Information',
    ]);

    expect(
      wrapper.find('EnhancedSafeMarkdown').at(0).props().markdown
    ).toBe(defaultProgrammingExpression.content);
    expect(wrapper.find('EnhancedSafeMarkdown').at(1).props().markdown).toEqual(expect.arrayContaining([defaultProgrammingExpression.syntax]));
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(2).props().markdown
    ).toBe(defaultProgrammingExpression.tips);
    expect(wrapper.find('EnhancedSafeMarkdown').at(3).props().markdown).toEqual(
      expect.arrayContaining([defaultProgrammingExpression.externalDocumentation])
    );

    expect(wrapper.text()).toContain(defaultProgrammingExpression.category);
    expect(wrapper.text()).toContain(defaultProgrammingExpression.returnValue);
  });

  it('hides the examples header if no syntax is provided', () => {
    delete defaultProgrammingExpression.examples;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Examples');
  });

  it('hides the syntax header if no syntax is provided', () => {
    delete defaultProgrammingExpression.syntax;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Syntax');
  });

  it('hides the parameters headers if no parameters are provided', () => {
    defaultProgrammingExpression.parameters = [];
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Parameters');
  });

  it('hides the returns header if no returns is provided', () => {
    delete defaultProgrammingExpression.returnValue;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Returns');
  });

  it('hides the tips header if no tips is provided', () => {
    delete defaultProgrammingExpression.tips;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Tips');
  });

  it('hides the additional information header if no external documentation is provided', () => {
    delete defaultProgrammingExpression.externalDocumentation;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).toBeGreaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).not.toContain('Additional Information');
  });

  it('shows block in title if blockName is provided', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{
          ...defaultProgrammingExpression,
          blockName: 'gamelab_location_picker',
          imageUrl: 'images.code.org/img',
        }}
      />
    );
    expect(wrapper.find('h3').length).toBe(0);
    expect(wrapper.find('img').length).toBe(0);
    expect(
      wrapper.find('div[title="gamelab_location_picker"]').length
    ).toBe(1);
  });

  it('shows image instead of name if image is provided', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{
          ...defaultProgrammingExpression,
          imageUrl: 'images.code.org/img',
        }}
      />
    );
    expect(wrapper.find('h3').length).toBe(0);
    expect(wrapper.find('img').length).toBe(1);
    expect(wrapper.find('img').props().src).toBe('images.code.org/img');
  });

  it('shows video if one is provided', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{...defaultProgrammingExpression, video: {}}}
      />
    );
    expect(wrapper.find('#programming-expression-video').length).toBe(1);
  });

  it('uses hsl color if array is provided for color', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{
          ...defaultProgrammingExpression,
          color: [355, '.7', '.7'],
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).toBe('hsl(355,70%, 70%)');
  });

  it('uses hex color if string is provided for color', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{
          ...defaultProgrammingExpression,
          color: '#fff176',
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).toBe('#fff176');
  });

  it('handles null color', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{
          ...defaultProgrammingExpression,
          color: null,
        }}
      />
    );
    expect(wrapper.find('span').props().style.backgroundColor).toBeNull();
  });
});
