import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from 'chai';
import sinon from 'sinon';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import _ from 'lodash';

describe('SchoolAutocompleteDropdown', () => {
  let fetchStub;
  let schoolAutocompleteDropdown;
  let handleChange;
  let select;

  beforeEach(async () => {
    // This component uses Fetch to send search queries to the server
    // Stub in a default server response here, and we'll add specific
    // responses in test cases later.
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.returns(Promise.resolve({ok: true, json: () => []}));

    handleChange = sinon.spy();
    schoolAutocompleteDropdown = mount(
      <SchoolAutocompleteDropdown value="12345" onChange={handleChange} />
    );

    // Wait for VirtualizedSelect to be lazy-loaded
    await new Promise(r => setTimeout(r, 0));

    schoolAutocompleteDropdown.update();
    select = schoolAutocompleteDropdown.find('VirtualizedSelect');

    // Reset Fetch call counts so we can assert them in specific cases later.
    fetchStub.resetHistory();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  /** Seed a successful response to a particular url. */
  const setServerResponse = (url, responseJson) =>
    fetchStub.withArgs(url).returns(
      Promise.resolve({
        ok: true,
        json: () => responseJson
      })
    );

  it('renders VirtualizedSelect', () => {
    expect(select).to.exist;
  });

  it('Passes supplied value to the select control', () => {
    assert.equal('12345', select.prop('value'));
  });

  it('Disables cache on the select control', () => {
    assert.isFalse(select.prop('cache'));
  });

  it('Calls props.onChange when the selection changes', () => {
    select.props().onChange({value: '1', label: 'selected school'});
    assert(
      handleChange.calledOnce &&
        handleChange.calledWith({
          value: '1',
          label: 'selected school'
        })
    );
  });

  describe('getOptions()', () => {
    let getOptions;

    beforeEach(() => {
      getOptions = schoolAutocompleteDropdown.instance().getOptions;
    });

    it('Resolves to undefined for queries less than 4 characters', async () => {
      const result = await getOptions('abc');
      expect(result).to.equal(undefined);
    });

    it('Returns a promise immediately, even when actual server request is debounced', () => {
      const promise = getOptions('abcd');
      expect(promise).to.be.an.instanceOf(Promise);
      assert(!fetchStub.called, 'fetch was not called');
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

      it('Fetches schools from the schoolsearch API for queries >= 4 characters', async () => {
        setServerResponse('/dashboardapi/v1/schoolsearch/abcd/40', [
          {
            nces_id: 10,
            name: 'Abcd School 1',
            city: 'Seattle',
            state: 'WA',
            zip: '98101'
          },
          {
            nces_id: 11,
            name: 'Abcd School 2',
            city: 'Redmond',
            state: 'WA',
            zip: '98073'
          }
        ]);

        const response = await getOptions('abcd');
        assert(fetchStub.calledOnce, 'fetch was called once');
        expect(response).to.deep.equal({
          options: [
            {
              value: '-1',
              label:
                'Other school not listed below (click here to provide details)'
            },
            {
              value: '10',
              label: 'Abcd School 1 - Seattle, WA 98101',
              school: {
                nces_id: 10,
                name: 'Abcd School 1',
                city: 'Seattle',
                state: 'WA',
                zip: '98101'
              }
            },
            {
              value: '11',
              label: 'Abcd School 2 - Redmond, WA 98073',
              school: {
                nces_id: 11,
                name: 'Abcd School 2',
                city: 'Redmond',
                state: 'WA',
                zip: '98073'
              }
            }
          ]
        });
      });

      it('Shows the not listed option for queries >= 4 characters, even with no schools returned', async () => {
        setServerResponse('/dashboardapi/v1/schoolsearch/vwxyz/40', []);

        const response = await getOptions('vwxyz');
        assert(fetchStub.calledOnce, 'fetch was called once');
        expect(response).to.deep.equal({
          options: [
            {
              value: '-1',
              label:
                'Other school not listed below (click here to provide details)'
            }
          ]
        });
      });

      it('Returns not listed when there is no query and the value is -1', async () => {
        schoolAutocompleteDropdown.setProps({value: '-1'});
        const result = await getOptions('');
        assert(!fetchStub.called);
        expect(result).to.deep.equal({
          options: [
            {
              value: '-1',
              label:
                'Other school not listed below (click here to provide details)'
            }
          ]
        });
      });

      it('Fetches school option when there is no query and the value is a school id', async () => {
        schoolAutocompleteDropdown.setProps({value: '9999'});
        setServerResponse('/dashboardapi/v1/schools/9999', {
          nces_id: 9999,
          name: 'Abcd School 1',
          city: 'Seattle',
          state: 'WA',
          zip: '98101'
        });

        const response = await getOptions('');
        assert(fetchStub.calledOnce, 'fetch was called once');
        expect(response).to.deep.equal({
          options: [
            {
              value: '9999',
              label: 'Abcd School 1 - Seattle, WA 98101',
              school: {
                nces_id: 9999,
                name: 'Abcd School 1',
                city: 'Seattle',
                state: 'WA',
                zip: '98101'
              }
            }
          ]
        });
      });
    });
  });
});
