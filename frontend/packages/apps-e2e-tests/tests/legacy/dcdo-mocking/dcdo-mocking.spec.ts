import {mockDcdo} from '../../shared/cookies';
import {expect, test} from '../../shared/fixtures';

/**
 * DCDO cookie mocking — verifies the DCDO cookie mechanism via the
 * /api/test/get_dcdo endpoint.
 *
 * Source:
 *   dashboard/test/ui/features/dcdo_mocking.feature
 *
 * Anonymous; no authentication required.
 * The DCDO cookie (name: "DCDO") is a JSON object keyed by DCDO key names.
 * The endpoint returns {fetched, stored}: fetched is the value read from the
 * cookie-layer DCDO; stored is the server-side datastore value (always null in
 * a fresh test run).
 *
 * Source: dashboard/test/ui/features/dcdo_mocking.feature
 * Scenario: Using a cookie to mock DCDO
 */
test('DCDO cookie mock and unmock via API endpoint', async ({page}) => {
  // Navigate to establish domain context for subsequent cookie operations.
  await page.goto('/users/sign_in');

  // Initial state: no DCDO cookie → both fetched and stored are null.
  let resp = await page.request.get('/api/test/get_dcdo');
  let json = await resp.json();
  expect(json.stored).toBeNull();
  expect(json.fetched).toBeNull();

  // Mock the key as a plain string value.
  await mockDcdo(page, 'dcdo_mocking_test', 'mocked');
  resp = await page.request.get('/api/test/get_dcdo');
  json = await resp.json();
  expect(json.stored).toBeNull();
  expect(json.fetched).toBe('mocked');

  // Re-mock the same key with a JSON object value.
  await mockDcdo(page, 'dcdo_mocking_test', {dcdo: 're-mocked'});
  resp = await page.request.get('/api/test/get_dcdo');
  json = await resp.json();
  expect(json.stored).toBeNull();
  expect(json.fetched).toEqual({dcdo: 're-mocked'});

  // Delete the DCDO cookie entirely — both values return to null.
  await page.context().clearCookies({name: 'DCDO'});
  resp = await page.request.get('/api/test/get_dcdo');
  json = await resp.json();
  expect(json.stored).toBeNull();
  expect(json.fetched).toBeNull();
});
