import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';

import {
  FindProgrammingExpressionDialog,
  ProgrammingExpressionTable,
  SearchForm
} from '@cdo/apps/lib/levelbuilder/lesson-editor/FindProgrammingExpressionDialog';

import {expect} from '../../../../util/reconfiguredChai';

describe('SearchForm', () => {
  it('renders passed programming environments as options', () => {
    const wrapper = shallow(
      <SearchForm
        onFilter={() => {}}
        onSearch={() => {}}
        programmingEnvironments={[
          {
            name: 'firstProgrammingEnvironment',
            id: 1
          },
          {
            name: 'secondProgrammingEnvironment',
            id: 2
          }
        ]}
      />
    );

    expect(wrapper.find('option').length).to.equal(3);
    expect(wrapper.find('option').map(option => option.text())).to.eql([
      'filter',
      'firstProgrammingEnvironment',
      'secondProgrammingEnvironment'
    ]);
  });
});

describe('ProgrammingExpressionTable', () => {
  it('renders nothing at all if given no programming expressions', () => {
    const wrapper = shallow(
      <ProgrammingExpressionTable handleSelect={() => {}} />
    );
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('renders passed programming expressions as table rows', () => {
    const wrapper = shallow(
      <ProgrammingExpressionTable
        handleSelect={() => {}}
        programmingExpressions={[
          {
            name: 'first expression',
            programmingEnvironmentName: 'environment',
            uniqueKey: 'first'
          },
          {
            name: 'second expression',
            programmingEnvironmentName: 'environment',
            uniqueKey: 'second'
          }
        ]}
      />
    );

    expect(wrapper.find('tbody').find('tr').length).to.equal(2);
    expect(
      wrapper
        .find('tbody')
        .find('tr')
        .map(row => row.key())
    ).to.eql(['first', 'second']);
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
    const searchStub = sinon.stub(wrapper.instance(), 'doSearch');

    // searches on a new query
    wrapper.instance().handleSearch({
      target: {
        value: 'foo'
      }
    });
    expect(searchStub.callCount).to.equal(1);

    // does not search again on the same query
    wrapper.instance().handleSearch({
      target: {
        value: 'foo'
      }
    });
    expect(searchStub.callCount).to.equal(1);

    // does not search on unrelated changes
    wrapper.setState({
      foo: 'bar'
    });
    expect(searchStub.callCount).to.equal(1);

    // does search on filter or page change
    wrapper.instance().handleFilter({
      target: {
        value: 'foo'
      }
    });
    expect(searchStub.callCount).to.equal(2);
    wrapper.instance().setCurrentPage(2);
    expect(searchStub.callCount).to.equal(3);
  });

  it('searches the programming_expressions endpoint', () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves();
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
        value: false
      }
    });
    expect(fetchStub.callCount).to.equal(0);

    // searches with a query and page
    wrapper.instance().handleSearch({
      target: {
        value: 'foo'
      }
    });
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.lastCall.args).to.eql([
      '/programming_expressions/search?page=1&query=foo'
    ]);

    // optionally searches with filter
    wrapper.instance().handleFilter({
      target: {
        value: 'bar'
      }
    });
    expect(fetchStub.callCount).to.equal(2);
    expect(fetchStub.lastCall.args).to.eql([
      '/programming_expressions/search?page=1&programmingEnvironmentName=bar&query=foo'
    ]);

    fetchStub.restore();
  });
});
