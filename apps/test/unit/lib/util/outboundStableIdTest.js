import cookies from 'js-cookie';
import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {initOutboundStableId} from '@cdo/apps/metrics/outboundStableId';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('outboundStableId', () => {
  const stableId = '550e8400-e29b-41d4-a716-446655440000';
  let cookieGetStub;

  beforeAll(() => {
    initOutboundStableId();
  });

  beforeEach(() => {
    cookieGetStub = stub(cookies, 'get');
  });

  afterEach(() => {
    cookieGetStub.restore();
  });

  function clickAnchor(href) {
    const a = document.createElement('a');
    a.href = href;
    document.body.appendChild(a);
    a.click();
    const result = a.href;
    a.remove();
    return result;
  }

  it('appends statsig_stable_id when cookie exists and link is to code.org', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const result = clickAnchor('https://code.org/students');
    expect(result).to.include('statsig_stable_id=' + stableId);
    expect(result).to.include('code.org/students');
  });

  it('does nothing when cookie does not exist', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(undefined);
    const result = clickAnchor('https://code.org/students');
    expect(result).to.not.include('statsig_stable_id');
  });

  it('does not append param when cookie value is not a valid UUID', () => {
    cookieGetStub
      .withArgs('statsig_stable_id')
      .returns('<script>alert(1)</script>');
    const result = clickAnchor('https://code.org/students');
    expect(result).to.not.include('statsig_stable_id');
  });

  it('does not decorate links to studio.code.org', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const result = clickAnchor('https://studio.code.org/home');
    expect(result).to.not.include('statsig_stable_id');
  });

  it('does not decorate links to support.code.org', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const result = clickAnchor('https://support.code.org/help');
    expect(result).to.not.include('statsig_stable_id');
  });

  it('does not decorate links to external domains', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const result = clickAnchor('https://google.com');
    expect(result).to.not.include('statsig_stable_id');
  });

  it('replaces existing statsig_stable_id param instead of duplicating', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const result = clickAnchor(
      'https://code.org/students?statsig_stable_id=old-value'
    );
    expect(result).to.include('statsig_stable_id=' + stableId);
    expect(result).to.not.include('old-value');
    // Ensure only one occurrence
    const matches = result.match(/statsig_stable_id/g);
    expect(matches).to.have.lengthOf(1);
  });

  it('preserves existing query parameters', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const result = clickAnchor('https://code.org/students?ref=studio');
    expect(result).to.include('ref=studio');
    expect(result).to.include('statsig_stable_id=' + stableId);
  });

  it('catches clicks on child elements inside an anchor', () => {
    cookieGetStub.withArgs('statsig_stable_id').returns(stableId);
    const a = document.createElement('a');
    a.href = 'https://code.org/about';
    const span = document.createElement('span');
    span.textContent = 'About';
    a.appendChild(span);
    document.body.appendChild(a);
    span.click();
    expect(a.href).to.include('statsig_stable_id=' + stableId);
    a.remove();
  });
});
