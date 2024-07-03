import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  FindProgrammingExpressionDialog,
  ProgrammingExpressionTable,
  SearchForm,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/FindProgrammingExpressionDialog';



describe('SearchForm', () => {
  it('renders passed programming environments as options', () => {
    const wrapper = shallow(
      <SearchForm
        onFilter={() => {}}
        onSearch={() => {}}
        programmingEnvironments={[
          {
            name: 'firstProgrammingEnvironment',
            id: 1,
          },
          {
            name: 'secondProgrammingEnvironment',
            id: 2,
          },
        ]}
      />
    );

    expect(wrapper.find('option').length).toBe(3);
    expect(wrapper.find('option').map(option => option.text())).toEqual([
      'filter',
      'firstProgrammingEnvironment',
      'secondProgrammingEnvironment',
    ]);
  });
});

describe('ProgrammingExpressionTable', () => {
  it('renders nothing at all if given no programming expressions', () => {
    const wrapper = shallow(
      <ProgrammingExpressionTable handleSelect={() => {}} />
    );
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('renders passed programming expressions as table rows', () => {
    const wrapper = shallow(
      <ProgrammingExpressionTable
        handleSelect={() => {}}
        programmingExpressions={[
          {
            syntax: 'first_expression()',
            programmingEnvironmentName: 'environment',
            uniqueKey: 'first',
          },
          {
            syntax: 'second_expression()',
            programmingEnvironmentName: 'environment',
            uniqueKey: 'second',
          },
        ]}
      />
    );

    expect(wrapper.find('tbody').find('tr').length).toBe(2);
    expect(
      wrapper
        .find('tbody')
        .find('tr')
        .map(row => row.key())
    ).toEqual(['first', 'second']);
  });
});

describe('FindProgrammingExpressionDialog', () => {
  it('invokes doSearch if and only if search values changed', () => {
    const wrapper = shallow(
      <FindProgrammingExpressionDialog
        isOpen={true}
        handleConfirm={() => {}}
        handleClose={() => {}}
        programmingEnvironments={[]}
      />
    );
    const searchStub = jest.spyOn(wrapper.instance(), 'doSearch').mockClear().mockImplementation();

    // searches on a new query
    wrapper.instance().handleSearch({
      target: {
        value: 'foo',
      },
    });
    expect(searchStub).toHaveBeenCalledTimes(1);

    // does not search again on the same query
    wrapper.instance().handleSearch({
      target: {
        value: 'foo',
      },
    });
    expect(searchStub).toHaveBeenCalledTimes(1);

    // does not search on unrelated changes
    wrapper.setState({
      foo: 'bar',
    });
    expect(searchStub).toHaveBeenCalledTimes(1);

    // does search on filter or page change
    wrapper.instance().handleFilter({
      target: {
        value: 'foo',
      },
    });
    expect(searchStub).toHaveBeenCalledTimes(2);
    wrapper.instance().setCurrentPage(2);
    expect(searchStub).toHaveBeenCalledTimes(3);
    searchStub.mockRestore();
  });

  it('searches the programming_expressions endpoint', () => {
    const fetchStub = jest.spyOn(window, 'fetch').mockClear().mockImplementation().resolves({
      json: () => {
        return {
          programmingExpressions: [],
          numPages: 0,
        };
      },
    });
    const wrapper = shallow(
      <FindProgrammingExpressionDialog
        isOpen={true}
        handleConfirm={() => {}}
        handleClose={() => {}}
        programmingEnvironments={[]}
      />
    );

    // doesn't search if there is no query
    wrapper.instance().handleSearch({
      target: {
        value: false,
      },
    });
    expect(fetchStub).toHaveBeenCalledTimes(0);

    // searches with a query and page
    wrapper.instance().handleSearch({
      target: {
        value: 'foo',
      },
    });
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub.mock.lastCall).toEqual([
      '/programming_expressions/search?page=1&query=foo',
    ]);

    // optionally searches with filter
    wrapper.instance().handleFilter({
      target: {
        value: 'bar',
      },
    });
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(fetchStub.mock.lastCall).toEqual([
      '/programming_expressions/search?page=1&programmingEnvironmentName=bar&query=foo',
    ]);

    fetchStub.mockRestore();
  });
});
