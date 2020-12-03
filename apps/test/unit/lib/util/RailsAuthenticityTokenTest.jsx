import React from 'react';
import sinon from 'sinon';
import {assert} from 'chai';
import {shallow} from 'enzyme';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import logToCloud from '@cdo/apps/logToCloud';

const TEST_CSRF_PARAM_NAME = 'fake-csrf-param-name';
const TEST_CSRF_PARAM_VALUE = 'fake-csrf-token';

describe('RailsAuthenticityToken', () => {
  beforeEach(() => {
    sinon.stub(logToCloud, 'logError');
    destroyCsrfMetaTags();
  });

  afterEach(() => {
    logToCloud.logError.restore();
    destroyCsrfMetaTags();
  });

  it('renders a hidden field with values found in the DOM', () => {
    createCsrfMetaTags();

    const wrapper = shallow(<RailsAuthenticityToken />);
    assert(
      wrapper.matchesElement(
        <input
          type="hidden"
          name={TEST_CSRF_PARAM_NAME}
          value={TEST_CSRF_PARAM_VALUE}
        />
      ),
      'rendered the hidden field as expected'
    );
    assert(logToCloud.logError.notCalled, 'logged nothing to New Relic');
  });

  it('renders empty and logs to cloud when meta tags are not found', () => {
    destroyCsrfMetaTags();

    const wrapper = shallow(<RailsAuthenticityToken />);
    assert(wrapper.isEmptyRender(), 'rendered nothing');
    assert(logToCloud.logError.calledOnce, 'logged an error to New Relic');
  });
});

function createCsrfMetaTags() {
  const csrfParam = document.createElement('meta');
  csrfParam.setAttribute('name', 'csrf-param');
  csrfParam.setAttribute('content', TEST_CSRF_PARAM_NAME);
  document.head.appendChild(csrfParam);

  const csrfToken = document.createElement('meta');
  csrfToken.setAttribute('name', 'csrf-token');
  csrfToken.setAttribute('content', TEST_CSRF_PARAM_VALUE);
  document.head.appendChild(csrfToken);
}

function destroyCsrfMetaTags() {
  for (let selector of ['meta[name="csrf-param"]', 'meta[name="csrf-token"]']) {
    const tag = document.querySelector(selector);
    tag && tag.remove();
  }
}
