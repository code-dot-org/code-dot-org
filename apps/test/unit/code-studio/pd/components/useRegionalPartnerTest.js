import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  PROGRAM_CSD,
  PROGRAM_CSA,
} from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplicationConstants';
import {useRegionalPartner} from '@cdo/apps/code-studio/pd/components/useRegionalPartner';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

let regionalPartnerData, regionalPartnerError;

const RegionalPartnerUser = props => {
  const {data} = props;
  const [regionalPartner, error] = useRegionalPartner(data);
  regionalPartnerData = regionalPartner;
  regionalPartnerError = error;
  return null;
};
RegionalPartnerUser.propTypes = {
  data: PropTypes.object,
};

const getRegionalPartnerData = () => {
  return [regionalPartnerData, regionalPartnerError];
};

const GOOD_RESPONSE = {
  id: 1,
  name: 'reginald partner',
  pl_programs_offered: ['CSA'],
};

const mockApiResponse = (status = 200, body = {}) => {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {'Content-type': 'application/json'},
  });
};

describe('useRegionalPartner tests', () => {
  let clock, fetchStub, debounceStub;
  beforeEach(() => {
    regionalPartnerData = undefined;
    regionalPartnerError = false;
    clock = sinon.useFakeTimers();
    fetchStub = sinon.stub(window, 'fetch');
    debounceStub = sinon.stub(_, 'debounce').callsFake(f => f);
  });
  afterEach(() => {
    clock.restore();
    fetchStub.restore();
    debounceStub.restore();
  });

  it('returns undefined when loading', async () => {
    let rendered;
    fetch.resetBehavior();
    rendered = await mount(<RegionalPartnerUser data={{}} />);
    const [regionalPartner, regionalPartnerError] =
      getRegionalPartnerData(rendered);
    expect(regionalPartner).to.equal(undefined);
    expect(regionalPartnerError).to.equal(false);
    rendered.unmount();
  });

  it('errors when parameters are bad', async () => {
    let rendered;
    // do a bunch of waiting around for the hooks state to resolve itself
    await act(async () => {
      rendered = await mount(<RegionalPartnerUser data={{}} />);
    });
    const [regionalPartner, regionalPartnerError] =
      getRegionalPartnerData(rendered);
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
            program: PROGRAM_CSA,
          }}
        />
      );
    });
    await clock.runAllAsync();
    const [regionalPartner, regionalPartnerError] =
      getRegionalPartnerData(rendered);
    expect(regionalPartner).to.equal(null);
    expect(regionalPartnerError).to.equal(true);
    rendered.unmount();
  });

  it('returns No Partner if RP does not offer selected program', async () => {
    let rendered;
    fetch.resolves(mockApiResponse(200, GOOD_RESPONSE));
    await act(async () => {
      rendered = await mount(
        <RegionalPartnerUser
          data={{
            school: '-1',
            schoolZipCode: '12345',
            schoolState: 'AK',
            program: PROGRAM_CSD,
          }}
        />
      );
    });
    await clock.runAllAsync();

    const [regionalPartner, regionalPartnerError] =
      getRegionalPartnerData(rendered);
    expect(fetch).to.be.calledWith(
      `/api/v1/pd/regional_partner_workshops/find?course=CS+Discoveries&subject=5-day+Summer&zip_code=12345&state=AK`
    );
    expect(regionalPartner).to.equal(null);
    expect(regionalPartnerError).to.equal(false);
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
            program: PROGRAM_CSA,
          }}
        />
      );
    });
    await clock.runAllAsync();

    const [regionalPartner, regionalPartnerError] =
      getRegionalPartnerData(rendered);
    expect(fetch).to.be.calledWith(
      `/api/v1/pd/regional_partner_workshops/find?course=Computer+Science+A&subject=5-day+Summer&zip_code=12345&state=AK`
    );
    expect(regionalPartner).to.deep.equal(GOOD_RESPONSE);
    expect(regionalPartnerError).to.equal(false);
    rendered.unmount();
  });
});
