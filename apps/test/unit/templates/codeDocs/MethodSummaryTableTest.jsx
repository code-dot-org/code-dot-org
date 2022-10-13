import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import MethodSummaryTable from '@cdo/apps/templates/codeDocs/MethodSummaryTable';

describe('MethodSummaryTable', () => {
  let defaultMethods;

  beforeEach(() => {
    defaultMethods = [
      {
        key: 'turnleft',
        name: 'turnLeft()',
        content: 'A description about what this method does'
      },
      {
        key: 'step',
        name: 'step(int steps)',
        content: 'A description about what this method and parameter does'
      }
    ];
  });

  it('shows a table with the provided methods', () => {
    const wrapper = shallow(<MethodSummaryTable methods={defaultMethods} />);
    const methodTable = wrapper.find('table').at(0);
    expect(methodTable).to.not.be.null;
    expect(methodTable.find('td').length).to.equal(2);
  });

  it('show the markdown content for each method', () => {
    const wrapper = shallow(<MethodSummaryTable methods={defaultMethods} />);
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(2);
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(0)
        .props().markdown
    ).to.equal('A description about what this method does');
    expect(
      wrapper
        .find('EnhancedSafeMarkdown')
        .at(1)
        .props().markdown
    ).to.equal('A description about what this method and parameter does');
  });

  it('shows a link to the method', () => {
    const wrapper = shallow(<MethodSummaryTable methods={defaultMethods} />);
    expect(wrapper.find('a').length).to.equal(2);
  });
});
