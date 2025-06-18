import {expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import WorkshopTableLoader from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_table_loader';
import {
  COURSE_CSF,
  COURSE_BUILD_YOUR_OWN,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';

const defaultFakeResponseData = {
  limit: 100,
  total_count: 2,
  filters: '',
  workshops: [
    {
      id: 1,
      course: COURSE_CSF,
      subject: 'Intro',
      course_offering_names: null,
    },
    {
      id: 2,
      course: COURSE_BUILD_YOUR_OWN,
      subject: '',
      course_offering_names: 'Test Topic A, Test Topic B',
    },
  ],
};

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

  it('Initially displays a spinner', () => {
    const Child = sinon.stub().returns(null);
    const loader = shallow(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    expect(loader.state('loading')).to.be.true;
    expect(loader.find('Spinner')).to.have.length(1);
  });

  it('Loads workshops over ajax and passes them to the child component', () => {
    const responseJson = JSON.stringify(defaultFakeResponseData);
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
    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal('fake-query-url');

    // First workshop is not BYO so its subject should remain unchanged, while the second workshop is BYO
    // so its subject should be its course offering names.
    expect(Child.calledOnce).to.be.true;
    const returnedWorkshopSubjects =
      Child.getCall(0).args[0].workshops.workshops;
    expect(returnedWorkshopSubjects[0].subject).to.eql(
      defaultFakeResponseData.workshops[0].subject
    );
    expect(returnedWorkshopSubjects[1].subject).to.eql(
      defaultFakeResponseData.workshops[1].course_offering_names
    );
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
    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal(expectedUrlWithParams);
  });

  it('Passes delete function to child when canDelete is true', () => {
    const fakeWorkshopsData = defaultFakeResponseData.workshops;
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

    expect(Child.calledOnce).to.be.true;
    expect(Child.getCall(0).args[0]).to.eql({
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

    expect(Child.called).to.be.false;
    expect(loader.find('p')).to.have.length(1);
    expect(loader.find('p').text()).to.eql('No workshops found');
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

    expect(Child.called).to.be.false;
    expect(loader.html()).to.be.null;
  });
});
