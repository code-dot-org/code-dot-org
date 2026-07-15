import {test, expect} from './fixtures/visual';

test.beforeEach(async ({page, baseURL}) => {
  const origin = new URL(baseURL ?? 'http://localhost:5173').origin;
  await page.route(
    url => url.origin !== origin,
    route => route.abort(),
  );
});

test('@visual share page with a short name', async ({page, visualCheck}) => {
  await page.goto(
    '/certificates/eyJuYW1lIjoiQWRhIiwiY291cnNlIjoib2NlYW5zIiwiZG9ub3IiOiJDb2RlLm9yZyJ9',
  );
  await expect(
    page.getByRole('img', {
      name: 'Ada certificate of completion for AI for Oceans',
    }),
  ).toBeVisible();
  await visualCheck('certificates-share-short-name');
});

test('@visual share page with UTF-8 text', async ({page, visualCheck}) => {
  await page.goto(
    '/certificates/eyJuYW1lIjoiWm_DqyDmnY4g8J-miiIsImNvdXJzZSI6Im9jZWFucyIsImRvbm9yIjoiQ29kZS5vcmcifQ',
  );
  await expect(
    page.getByRole('img', {
      name: 'Zoë 李 🦊 certificate of completion for AI for Oceans',
    }),
  ).toBeVisible();
  await visualCheck('certificates-share-utf8');
});

test('@visual share page with a long name', async ({page, visualCheck}) => {
  await page.goto(
    '/certificates/eyJuYW1lIjoiQW4gRXh0cmVtZWx5IExvbmcgQ2VydGlmaWNhdGUgTmFtZSBGb3IgT3ZlcmZsb3cgVmVyaWZpY2F0aW9uIiwiY291cnNlIjoib2NlYW5zIiwiZG9ub3IiOiJDb2RlLm9yZyJ9',
  );
  await expect(
    page.getByRole('img', {
      name: 'An Extremely Long Certificate Name For Overflow Verification certificate of completion for AI for Oceans',
    }),
  ).toBeVisible();
  await visualCheck('certificates-share-long-name');
});

test('@visual congrats page', async ({page, visualCheck}) => {
  await page.goto('/congrats?s=b2NlYW5z&i=session-123');
  await expect(
    page.getByRole('heading', {
      name: 'You Earned a Certificate of Completion',
    }),
  ).toBeVisible();
  await expect(page.getByRole('button', {name: 'Submit'})).toBeVisible();
  await visualCheck('certificates-congrats');
});

test('@visual batch page', async ({page, visualCheck}) => {
  await page.goto('/certificates/batch');
  await expect(
    page.getByRole('button', {name: 'Generate Certificates'}),
  ).toBeVisible();
  await visualCheck('certificates-batch');
});
