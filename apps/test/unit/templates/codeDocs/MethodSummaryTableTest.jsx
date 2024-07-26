import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import MethodSummaryTable from '@cdo/apps/templates/codeDocs/MethodSummaryTable';

describe('MethodSummaryTable', () => {
  let defaultMethods;

  beforeEach(() => {
    defaultMethods = [
      {
        key: 'turnleft',
        name: 'turnLeft()',
        content: 'A description about what this method does',
      },
      {
        key: 'step',
        name: 'step(int steps)',
        content: 'A description about what this method and parameter does',
      },
    ];
  });

  it('shows a table with the provided methods', () => {
    const wrapper = shallow(<MethodSummaryTable methods={defaultMethods} />);
    const methodTable = wrapper.find('table').at(0);
    expect(methodTable).not.toBeNull();
    expect(methodTable.find('td').length).toBe(2);
  });

  it('show the markdown content for each method', () => {
    const wrapper = shallow(<MethodSummaryTable methods={defaultMethods} />);
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(2);
    expect(wrapper.find('EnhancedSafeMarkdown').at(0).props().markdown).toBe(
      'A description about what this method does'
    );
    expect(wrapper.find('EnhancedSafeMarkdown').at(1).props().markdown).toBe(
      'A description about what this method and parameter does'
    );
  });

  it('shows a link to the method', () => {
    const wrapper = shallow(<MethodSummaryTable methods={defaultMethods} />);
    expect(wrapper.find('a').length).toBe(2);
  });
});
