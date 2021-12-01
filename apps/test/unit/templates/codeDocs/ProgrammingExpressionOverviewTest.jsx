import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
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
          description: 'description'
        },
        {name: 'param2'}
      ]
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
      'Syntax',
      'Parameters',
      'Returns',
      'Tips',
      'Additional Information'
    ]);

    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(0)
        .props().markdown
    ).to.equal(defaultProgrammingExpression.content);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(1)
        .props().markdown
    ).to.contain(defaultProgrammingExpression.syntax);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(2)
        .props().markdown
    ).to.equal(defaultProgrammingExpression.tips);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(3)
        .props().markdown
    ).to.contain(defaultProgrammingExpression.externalDocumentation);

    expect(wrapper.text()).to.contain(defaultProgrammingExpression.category);
    expect(wrapper.text()).to.contain(defaultProgrammingExpression.returnValue);
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
});
