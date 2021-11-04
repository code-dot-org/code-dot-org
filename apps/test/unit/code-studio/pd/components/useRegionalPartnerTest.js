import React from 'react';
import {act} from 'react-dom/test-utils';
import PropTypes from 'prop-types';
// import {expect} from 'chai';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {useRegionalPartner} from '@cdo/apps/code-studio/pd/components/useRegionalPartner';
import {PROGRAM_CSA} from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplicationConstants';
import _ from 'lodash';

const RegionalPartnerUser = props => {
  const {data} = props;
  const [regionalPartner, regionalPartnerError] = useRegionalPartner(data);
  return (
    <>
      <div id="data">{JSON.stringify(regionalPartner)}</div>
      <div id="error">{JSON.stringify(regionalPartnerError)}</div>
    </>
  );
};
RegionalPartnerUser.propTypes = {
  data: PropTypes.object
};

const getRegionalPartnerData = element => {
  return [
    JSON.parse(element.find('#data').text()),
    JSON.parse(element.find('#error').text())
  ];
};

const GOOD_RESPONSE = {name: 'reginald partner'};

const mockApiResponse = (status = 200, body = {}) => {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {'Content-type': 'application/json'}
  });
};

describe('useRegionalPartner tests', () => {
  let clock, fetchStub, debounceStub;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
    fetchStub = sinon.stub(window, 'fetch');
    debounceStub = sinon.stub(_, 'debounce').callsFake(f => f);
  });
  afterEach(() => {
    clock.restore();
    fetchStub.restore();
    debounceStub.restore();
  });

  it('returns null when uninitialized', async () => {
    let rendered;
    rendered = await mount(<RegionalPartnerUser data={{}} />);
    const [regionalPartner, regionalPartnerError] = getRegionalPartnerData(
      rendered
    );
    expect(regionalPartner).to.equal(null);
    expect(regionalPartnerError).to.equal(false);
    rendered.unmount();
  });

  it('errors when parameters are bad', async () => {
    let rendered;
    // do a bunch of waiting around for the hooks state to resolve itself
    await act(async () => {
      rendered = await mount(<RegionalPartnerUser data={{}} />);
    });
    const [regionalPartner, regionalPartnerError] = getRegionalPartnerData(
      rendered
    );
    expect(regionalPartner).to.equal(null);
    expect(regionalPartnerError).to.equal(true);
    rendered.unmount();
  });

  it('errors when server errors', async () => {
    let rendered;
    fetch.resolves(mockApiResponse(500, GOOD_RESPONSE));
    await act(async () => {
      rendered = await mount(
        <RegionalPartnerUser
          data={{
            school: '-1',
            schoolZipCode: '12345',
            schoolState: 'AK',
            program: PROGRAM_CSA
          }}
        />
      );
    });
    await clock.runAllAsync();
    const [regionalPartner, regionalPartnerError] = getRegionalPartnerData(
      rendered
    );
    expect(regionalPartner).to.equal(null);
    expect(regionalPartnerError).to.equal(true);
    rendered.unmount();
  });

  it('fetches the regional partner data', async () => {
    let rendered;
    fetch.resolves(mockApiResponse(200, GOOD_RESPONSE));
    await act(async () => {
      rendered = await mount(
        <RegionalPartnerUser
          data={{
            school: '-1',
            schoolZipCode: '12345',
            schoolState: 'AK',
            program: PROGRAM_CSA
          }}
        />
      );
      await clock.runAllAsync();
    });
    const [regionalPartner, regionalPartnerError] = getRegionalPartnerData(
      rendered
    );
    expect(fetch).to.be.calledWith(
      `/api/v1/pd/regional_partner_workshops/find?course=Computer+Science+A&subject=5-day+Summer&zip_code=12345&state=AK`
    );
    expect(regionalPartner).to.deep.equal(GOOD_RESPONSE);
    expect(regionalPartnerError).to.equal(false);
    rendered.unmount();
  });
});
