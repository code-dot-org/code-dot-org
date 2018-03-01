import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import _ from 'lodash';

describe('SchoolAutocompleteDropdown', () => {
  let schoolAutocompleteDropdown;
  let handleChange;
  let select;

  beforeEach(() => {
    handleChange = sinon.spy();
    schoolAutocompleteDropdown = shallow(
      <SchoolAutocompleteDropdown
        value="12345"
        onChange={handleChange}
      />
    );

    select = schoolAutocompleteDropdown.find('VirtualizedSelect');
  });

  it('renders VirtualizedSelect', () => {
    expect(select).to.exist;
  });

  it('Passes supplied value to the select control', () => {
    expect(select).to.have.prop('value', '12345');
  });

  it('Disables cache on the select control', () => {
    expect(select).to.have.prop('cache', false);
  });

  it("Calls props.onChange when the selection changes", () => {
    select.simulate("change", {value: '1', label: 'selected school'});
    expect(handleChange).to.be.calledOnce;
    expect(handleChange).to.be.calledWith({value: '1', label: 'selected school'});
  });

  describe("getOptions()", () => {
    let getOptions;
    let server;

    beforeEach(() => {
      getOptions = schoolAutocompleteDropdown.instance().getOptions;
      server = sinon.fakeServer.create();
    });
    afterEach(() => {
      server.restore();
    });

    const setServerResponse = (url, responseJson) => server.respondWith(
      "GET",
      url,
      [
        200,
        {"Content-Type": "application/json"},
        JSON.stringify(responseJson)
      ]
    );

    it("Resolves to undefined for queries less than 4 characters", () => {
      const promise = getOptions("abc");
      return expect(promise).to.eventually.equal(undefined);
    });

    it("Returns a promise immediately, even when actual server request is debounced", () => {
      const promise = getOptions("abcd");
      expect(promise).to.be.an.instanceOf(Promise);
      expect(server.requests).to.have.length(0);
    });

    describe('(stubbing debounce)', () => {
      let debounceStub;

      before(() => {
        // stub out debounce to return the original function, so it's called immediately
        debounceStub = sinon.stub(_, 'debounce').callsFake(f => f);
      });

      after(() => {
        debounceStub.restore();
      });

      it("Fetches schools from the schoolsearch API for queries >= 4 characters", () => {
        setServerResponse(
          "/dashboardapi/v1/schoolsearch/abcd/40",
          [
            {nces_id: 10, name: 'Abcd School 1', city: 'Seattle', state: 'WA', zip: '98101'},
            {nces_id: 11, name: 'Abcd School 2', city: 'Redmond', state: 'WA', zip: '98073'},
          ]
        );

        const promise = getOptions("abcd");
        expect(server.requests).to.have.length(1);
        server.respond();

        return expect(promise).to.eventually.deep.equal({
          options: [
            {value: '-1', label: 'Other school not listed below (click here to provide details)'},
            {value: '10', label: 'Abcd School 1 - Seattle, WA 98101', school: {nces_id: 10, name: 'Abcd School 1', city: 'Seattle', state: 'WA', zip: '98101'}},
            {value: '11', label: 'Abcd School 2 - Redmond, WA 98073', school: {nces_id: 11, name: 'Abcd School 2', city: 'Redmond', state: 'WA', zip: '98073'}}
          ]
        });
      });

      it("Shows the not listed option for queries >= 4 characters, even with no schools returned", () => {
        setServerResponse(
          "/dashboardapi/v1/schoolsearch/vwxyz/40",
          []
        );

        const promise = getOptions("vwxyz");
        expect(server.requests).to.have.length(1);
        server.respond();

        return expect(promise).to.eventually.deep.equal({
          options: [
            {value: '-1', label: 'Other school not listed below (click here to provide details)'}
          ]
        });
      });

      it("Returns not listed when there is no query and the value is -1", () => {
        schoolAutocompleteDropdown.setProps({value: '-1'});
        const promise = getOptions('');
        expect(server.requests).to.have.length(0);

        return expect(promise).to.eventually.deep.equal({
          options: [
            {value: '-1', label: 'Other school not listed below (click here to provide details)'}
          ]
        });
      });

      it("Fetches school option when there is no query and the value is a school id", () => {
        schoolAutocompleteDropdown.setProps({value: '9999'});
        setServerResponse(
          "/dashboardapi/v1/schools/9999",
          {nces_id: 9999, name: 'Abcd School 1', city: 'Seattle', state: 'WA', zip: '98101'}
        );

        const promise = getOptions('');
        expect(server.requests).to.have.length(1);
        server.respond();

        return expect(promise).to.eventually.deep.equal({
          options: [
            {value: '9999', label: 'Abcd School 1 - Seattle, WA 98101', school: {nces_id: 9999, name: 'Abcd School 1', city: 'Seattle', state: 'WA', zip: '98101'}}
          ]
        });
      });
    });
  });
});
