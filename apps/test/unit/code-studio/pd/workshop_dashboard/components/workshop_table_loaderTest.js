import { mount, shallow } from 'enzyme';
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';

import WorkshopTableLoader from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_table_loader';

describe('WorkshopTableLoader', () => {
  let server;
  let debounceStub;

  beforeAll(() => {
    // stub out debounce to return the original function, so it's called immediately
    debounceStub = sinon.stub(_, 'debounce').callsFake(f => f);
  });

  afterAll(() => {
    debounceStub.restore();
  });

  beforeEach(() => {
    server = sinon.fakeServer.create();
  });

  afterEach(() => {
    server.restore();
  });

  const getFakeWorkshopsData = () => {
    return [{id: 1}, {id: 2}];
  };

  it('Initially displays a spinner', () => {
    const Child = sinon.stub().returns(null);
    const loader = shallow(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    expect(loader.state('loading')).toBe(true);
    expect(loader.find('Spinner')).toHaveLength(1);
  });

  it('Loads workshops over ajax and passes them to the child component', () => {
    const fakeWorkshopsData = getFakeWorkshopsData();
    const responseJson = JSON.stringify(fakeWorkshopsData);
    server.respondWith('GET', 'fake-query-url', [
      200,
      {'Content-Type': 'application/json'},
      responseJson,
    ]);

    const Child = sinon.stub().returns(null);
    mount(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    server.respond();
    expect(server.requests.length).toBe(1);
    expect(server.requests[0].url).toBe('fake-query-url');

    expect(Child.calledOnce).toBe(true);
    expect(Child.getCall(0).args[0]).toEqual({
      workshops: fakeWorkshopsData,
      onDelete: null,
    });
  });

  it('Applies queryParams to the queryURL', () => {
    const Child = sinon.stub().returns(null);
    mount(
      <WorkshopTableLoader
        queryUrl="https://studio.code.org/api/v1/pd/workshops/filter"
        queryParams={{
          date_order: 'desc',
          state: 'In Progress',
          empty: null, // Empty params are filtered out / not added to the url
        }}
      >
        <Child />
      </WorkshopTableLoader>
    );

    const expectedUrlWithParams =
      'https://studio.code.org/api/v1/pd/workshops/filter?date_order=desc&state=In+Progress';
    expect(server.requests.length).toBe(1);
    expect(server.requests[0].url).toBe(expectedUrlWithParams);
  });

  it('Passes delete function to child when canDelete is true', () => {
    const fakeWorkshopsData = getFakeWorkshopsData();
    const Child = sinon.stub().returns(null);
    const loader = mount(
      <WorkshopTableLoader queryUrl="fake-query-url" canDelete>
        <Child />
      </WorkshopTableLoader>
    );

    loader.setState({
      loading: false,
      workshops: fakeWorkshopsData,
    });

    expect(Child.calledOnce).toBe(true);
    expect(Child.getCall(0).args[0]).toEqual({
      workshops: fakeWorkshopsData,
      onDelete: loader.instance().handleDelete,
    });
  });

  it('Displays no workshops found message when no workshops are found', () => {
    const Child = sinon.stub().returns(null);
    const loader = mount(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    loader.setState({
      loading: false,
      workshops: [],
    });

    expect(Child.called).toBe(false);
    expect(loader.find('p')).toHaveLength(1);
    expect(loader.find('p').text()).toEqual('No workshops found');
  });

  it('Renders null when hideNoWorkshopsMessage is specified and no workshops are found', () => {
    const Child = sinon.stub().returns(null);
    const loader = mount(
      <WorkshopTableLoader queryUrl="fake-query-url" hideNoWorkshopsMessage>
        <Child />
      </WorkshopTableLoader>
    );

    loader.setState({
      loading: false,
      workshops: [],
    });

    expect(Child.called).toBe(false);
    expect(loader.html()).toBeNull();
  });
});
