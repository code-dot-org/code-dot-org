import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ProgrammingExpressionOverview from '@cdo/apps/templates/codeDocs/ProgrammingExpressionOverview';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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

    expect(wrapper.find('h1').text()).to.contain(
      defaultProgrammingExpression.name
    );
    expect(wrapper.find('h2').map(h => h.text())).to.eql([
      'Examples',
      'Syntax',
      'Parameters',
      'Returns',
      'Tips',
      'Additional Information',
    ]);

    expect(
      wrapper.find('EnhancedSafeMarkdown').at(0).props().markdown
    ).to.equal(defaultProgrammingExpression.content);
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(1).props().markdown
    ).to.contain(defaultProgrammingExpression.syntax);
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(2).props().markdown
    ).to.equal(defaultProgrammingExpression.tips);
    expect(
      wrapper.find('EnhancedSafeMarkdown').at(3).props().markdown
    ).to.contain(defaultProgrammingExpression.externalDocumentation);

    expect(wrapper.text()).to.contain(defaultProgrammingExpression.category);
    expect(wrapper.text()).to.contain(defaultProgrammingExpression.returnValue);
  });

  it('hides the examples header if no syntax is provided', () => {
    delete defaultProgrammingExpression.examples;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Examples');
  });

  it('hides the syntax header if no syntax is provided', () => {
    delete defaultProgrammingExpression.syntax;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Syntax');
  });

  it('hides the parameters headers if no parameters are provided', () => {
    defaultProgrammingExpression.parameters = [];
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Parameters');
  });

  it('hides the returns header if no returns is provided', () => {
    delete defaultProgrammingExpression.returnValue;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Returns');
  });

  it('hides the tips header if no tips is provided', () => {
    delete defaultProgrammingExpression.tips;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include('Tips');
  });

  it('hides the additional information header if no external documentation is provided', () => {
    delete defaultProgrammingExpression.externalDocumentation;
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={defaultProgrammingExpression}
      />
    );
    expect(wrapper.find('h2').length).to.be.greaterThan(0);
    expect(wrapper.find('h2').map(h => h.text())).to.not.include(
      'Additional Information'
    );
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
    expect(wrapper.find('h3').length).to.equal(0);
    expect(wrapper.find('img').length).to.equal(0);
    expect(
      wrapper.find('div[title="gamelab_location_picker"]').length
    ).to.equal(1);
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
    expect(wrapper.find('h3').length).to.equal(0);
    expect(wrapper.find('img').length).to.equal(1);
    expect(wrapper.find('img').props().src).to.equal('images.code.org/img');
  });

  it('shows video if one is provided', () => {
    const wrapper = shallow(
      <ProgrammingExpressionOverview
        programmingExpression={{...defaultProgrammingExpression, video: {}}}
      />
    );
    expect(wrapper.find('#programming-expression-video').length).to.equal(1);
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
    expect(wrapper.find('span').props().style.backgroundColor).to.equal(
      'hsl(355,70%, 70%)'
    );
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
    expect(wrapper.find('span').props().style.backgroundColor).to.equal(
      '#fff176'
    );
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
    expect(wrapper.find('span').props().style.backgroundColor).to.be.null;
  });
});
