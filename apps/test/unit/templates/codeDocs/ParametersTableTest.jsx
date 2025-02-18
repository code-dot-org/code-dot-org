import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ParametersTable from '@cdo/apps/templates/codeDocs/ParametersTable';

describe('ParametersTable', () => {
  let defaultParameters;

  beforeEach(() => {
    defaultParameters = [
      {
        name: 'param1',
        type: 'string',
        required: true,
        description: 'description',
      },
      {name: 'param2'},
    ];
  });

  it('shows a table with the correct number of rows', () => {
    const wrapper = mount(
      <ParametersTable
        parameters={defaultParameters}
        programmingEnvironmentLanguage="droplet"
      />
    );
    expect(wrapper.find('table').length).toBe(1);
    expect(wrapper.find('tbody').find('tr').length).toBe(2);
  });

  it('shows the correct data for a complete parameter in a non java environment', () => {
    const wrapper = mount(
      <ParametersTable
        parameters={defaultParameters}
        programmingEnvironmentLanguage="droplet"
      />
    );
    const firstRow = wrapper.find('tbody').find('tr').at(0);
    expect(firstRow.find('td').length).toBe(4);
    expect(firstRow.find('td').at(0).text()).toBe('param1');
    expect(firstRow.find('td').at(1).text()).toBe('string');
    expect(firstRow.find('td').at(2).find('.fa-check').length).toBe(1);
    expect(
      firstRow.find('td').at(3).find('EnhancedSafeMarkdown').props().markdown
    ).toBe('description');
  });

  it('shows the correct data for a complete parameter in a java environment', () => {
    const wrapper = mount(
      <ParametersTable
        parameters={defaultParameters}
        programmingEnvironmentLanguage="java"
      />
    );
    const firstRow = wrapper.find('tbody').find('tr').at(0);
    expect(firstRow.find('td').length).toBe(4);
    expect(firstRow.find('td').at(0).text()).toBe('param1');
    expect(firstRow.find('td').at(1).text()).toBe('string');
    expect(firstRow.find('td').at(2).props().style.display).toBe('none');
    expect(
      firstRow.find('td').at(3).find('EnhancedSafeMarkdown').props().markdown
    ).toBe('description');
  });

  it('shows the correct data for a parameter with fields missing', () => {
    const wrapper = mount(<ParametersTable parameters={defaultParameters} />);
    const secondRow = wrapper.find('tbody').find('tr').at(1);
    expect(secondRow.find('td').length).toBe(4);
    expect(secondRow.find('td').at(0).text()).toBe('param2');
    expect(secondRow.find('td').at(1).text()).toBe('');
    expect(secondRow.find('td').at(2).find('.fa-check').length).toBe(0);
    expect(secondRow.find('td').at(3).find('EnhancedSafeMarkdown').length).toBe(
      0
    );
  });
});
