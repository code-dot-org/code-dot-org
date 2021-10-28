import React from 'react';
import {act} from 'react-dom/test-utils';
import PropTypes from 'prop-types';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {useRegionalPartner} from '@cdo/apps/code-studio/pd/components/useRegionalPartner';
import {PROGRAM_CSA} from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplicationConstants';

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
  let clock, fetchStub;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
    fetchStub = sinon.stub(window, 'fetch');
  });
  afterEach(() => {
    clock.restore();
    sinon.restore();
    fetchStub.restore();
  });

  xit('returns null when uninitialized', async () => {
    let rendered;
    rendered = await mount(<RegionalPartnerUser data={{}} />);
    const [regionalPartner, regionalPartnerError] = getRegionalPartnerData(
      rendered
    );
    expect(regionalPartner).to.equal(null);
    expect(regionalPartnerError).to.equal(false);
  });

  xit('errors when parameters are bad', async () => {
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
  });

  it('errors when server errors', async () => {
    let rendered;
    fetchStub.resolves(mockApiResponse(500, GOOD_RESPONSE));
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
  });

  it('fetches the regional partner data', async () => {
    let rendered;
    fetchStub.resolves(mockApiResponse(200, GOOD_RESPONSE));
    await clock.tickAsync(1000); // flush debouncer
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
    expect(
      fetchStub
        .getCall(0)
        .calledWith(
          `/api/v1/pd/regional_partner_workshops/find?course=Computer+Science+A&subject=5-day+Summer&zip_code=12345&state=AK`
        )
    ).to.equal(true);
    expect(regionalPartner).to.deep.equal(GOOD_RESPONSE);
    expect(regionalPartnerError).to.equal(false);
  });

  it('refetches when parameters change', async () => {
    let rendered;
    fetchStub.resolves(mockApiResponse(200, GOOD_RESPONSE));
    await clock.tickAsync(1000); // flush debouncer
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
      await clock.tickAsync(1000);
      rendered.setProps({
        data: {
          school: '-1',
          schoolZipCode: '12346',
          schoolState: 'AK',
          program: PROGRAM_CSA
        }
      });
    });
    await clock.runAllAsync();
    const [regionalPartner, regionalPartnerError] = getRegionalPartnerData(
      rendered
    );
    expect(
      fetchStub
        .getCall(1)
        .calledWith(
          `/api/v1/pd/regional_partner_workshops/find?course=Computer+Science+A&subject=5-day+Summer&zip_code=12346&state=AK`
        )
    ).to.equal(true);
    expect(regionalPartner).to.deep.equal(GOOD_RESPONSE);
    expect(regionalPartnerError).to.equal(false);
  });
});
