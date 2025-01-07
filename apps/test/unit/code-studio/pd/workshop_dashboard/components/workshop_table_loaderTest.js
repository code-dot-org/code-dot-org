import {expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

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

    expect(loader.find('Spinner')).to.have.length(1);
  });

  it('Loads workshops over ajax and passes them to the child component', () => {
    const fakeWorkshopsData = getFakeWorkshopsData();

    const ajaxStub = sinon.stub($, 'ajax').callsFake(() => {
      return {
        done: callback => {
          callback(fakeWorkshopsData);
        },
      };
    });

    const Child = sinon.stub().returns(null);
    mount(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    expect(ajaxStub.calledOnce).to.be.true;

    expect(Child.calledOnce).to.be.true;
    expect(Child.getCall(0).args[0]).to.eql({
      workshops: fakeWorkshopsData,
      onDelete: null,
    });

    ajaxStub.restore();
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
    const fakeWorkshopsData = getFakeWorkshopsData();

    const ajaxStub = sinon.stub($, 'ajax').callsFake(() => {
      return {
        done: callback => {
          callback(fakeWorkshopsData);
        },
      };
    });

    const Child = sinon.stub().returns(null);
    mount(
      <WorkshopTableLoader queryUrl="fake-query-url" canDelete>
        <Child />
      </WorkshopTableLoader>
    );

    expect(Child.calledOnce).to.be.true;
    expect(Child.getCall(0).args[0].workshops).to.eql(fakeWorkshopsData);

    ajaxStub.restore();
  });

  it('Displays no workshops found message when no workshops are found', () => {
    const ajaxStub = sinon.stub($, 'ajax').callsFake(() => {
      return {
        done: callback => {
          callback({
            workshops: [],
            length: 0,
            total_count: 0,
          });
        },
      };
    });

    const Child = sinon.stub().returns(null);
    const loader = mount(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    expect(Child.called).to.be.false;
    expect(loader.find('p')).to.have.length(1);
    expect(loader.find('p').text()).to.eql('No workshops found');

    ajaxStub.restore();
  });

  it('Renders null when hideNoWorkshopsMessage is specified and no workshops are found', () => {
    const ajaxStub = sinon.stub($, 'ajax').callsFake(() => {
      return {
        done: callback => {
          callback({
            workshops: [],
            length: 0,
            total_count: 0,
          });
        },
      };
    });

    const Child = sinon.stub().returns(null);
    const loader = mount(
      <WorkshopTableLoader queryUrl="fake-query-url" hideNoWorkshopsMessage>
        <Child />
      </WorkshopTableLoader>
    );

    expect(ajaxStub.calledOnce).to.be.true;

    loader.update();
    expect(Child.called).to.be.false;
    expect(loader.html()).to.be.null;

    ajaxStub.restore();
  });
});
