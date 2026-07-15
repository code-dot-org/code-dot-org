import {fireEvent, render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {expect, it, vi} from 'vitest';

import type {CertificateCompletion} from '@/api/completion';

import {server} from '../../dev/msw/server';
import {completionFixture} from '../../dev/scenarios';

import {CertificateCongratsPage} from './CertificateCongratsPage';

function completionHandler(completion: CertificateCompletion) {
  return http.get('*/api/v1/certificates/completion', () =>
    HttpResponse.json(completion),
  );
}

it('renders the granted certificate and local personalization', async () => {
  render(<CertificateCongratsPage encodedCourse="b2NlYW5z" />);

  expect(
    await screen.findByRole('heading', {
      name: 'You Earned a Certificate of Completion',
    }),
  ).toBeVisible();
  expect(screen.getByRole('link', {name: /Back to activity/})).toHaveAttribute(
    'href',
    '/s/oceans',
  );
  expect(
    await screen.findByRole('img', {
      name: 'AI for Oceans certificate of completion',
    }),
  ).toBeVisible();

  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: {value: 'Ada'},
  });
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

  expect(await screen.findByText('Thanks for submitting!')).toBeVisible();
  expect(screen.getByText('Ada')).toHaveAttribute('data-notranslate');
});

it('renders no certificate when the API grants no entitlement', async () => {
  server.use(completionHandler({...completionFixture, certificates: []}));

  render(<CertificateCongratsPage encodedCourse="b2NlYW5z" />);

  expect(await screen.findByText(/You must complete the course/)).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('renders each granted certificate in a multi-course completion', async () => {
  server.use(
    completionHandler({
      ...completionFixture,
      certificates: [
        {courseName: 'oceans', coursePath: '/s/oceans'},
        {courseName: 'coursea-2025', coursePath: '/s/coursea-2025'},
      ],
    }),
  );

  render(<CertificateCongratsPage encodedCourse="b2NlYW5z" />);

  expect(
    await screen.findByRole('img', {
      name: 'AI for Oceans certificate of completion',
    }),
  ).toBeVisible();
  expect(
    await screen.findByRole('img', {
      name: 'Course A certificate of completion',
    }),
  ).toBeVisible();
});

it.each([
  ['hour_of_code', 'Continue Beyond an Hour of AI'],
  ['professional_learning_k5', 'Discover facilitator-led workshops'],
  ['professional_learning_6_12', 'Discover facilitator-led workshops'],
  ['other', 'Graduate to the next level'],
] as const)('renders %s recommendations', async (courseKind, heading) => {
  server.use(
    completionHandler({
      ...completionFixture,
      courseKind,
      recommendations: [
        {
          actionLabel: 'Continue',
          description: 'Keep learning.',
          imageUrl: null,
          path: '/next',
          title: 'Next course',
        },
      ],
    }),
  );

  render(<CertificateCongratsPage encodedCourse="b2NlYW5z" />);

  expect(await screen.findByRole('heading', {name: heading})).toBeVisible();
  expect(screen.getByRole('link', {name: 'Continue'})).toHaveAttribute(
    'href',
    '/next',
  );
});

it.each([
  [
    'professional_learning_k5',
    'https://code.org/professional-development-workshops',
  ],
  ['professional_learning_6_12', 'https://code.org/apply'],
] as const)('keeps the %s workshop path', async (courseKind, path) => {
  server.use(
    completionHandler({
      certificates: [
        {courseName: 'self-paced-pl', coursePath: '/s/self-paced-pl'},
      ],
      courseKind,
      recommendations: [
        {
          actionLabel: 'Discover facilitator-led workshops',
          description: 'Learn with other educators.',
          imageUrl: null,
          path,
          title: 'Facilitator-led workshops',
        },
      ],
    }),
  );

  render(<CertificateCongratsPage encodedCourse="c2VsZi1wYWNlZC1wbA" />);

  expect(
    await screen.findByRole('link', {
      name: 'Discover facilitator-led workshops',
    }),
  ).toHaveAttribute('href', path);
});

it('uses the viewer certificate name for professional learning', async () => {
  server.use(
    completionHandler({
      certificates: [
        {courseName: 'self-paced-pl', coursePath: '/s/self-paced-pl'},
      ],
      courseKind: 'professional_learning_k5',
      recommendations: [],
    }),
    http.get('*/api/v1/certificates/viewer', () =>
      HttpResponse.json({
        allowedShareTargets: ['facebook', 'x', 'linkedin'],
        canBulkPrint: true,
        certificateName: 'Ada Lovelace',
      }),
    ),
  );

  render(<CertificateCongratsPage encodedCourse="c2VsZi1wYWNlZC1wbA" />);

  expect(
    await screen.findByRole('img', {
      name: 'Ada Lovelace certificate of completion for Self-Paced Professional Learning',
    }),
  ).toBeVisible();
  expect(
    screen.queryByRole('button', {name: 'Submit'}),
  ).not.toBeInTheDocument();
});

it('requires an account name for professional learning', async () => {
  server.use(
    completionHandler({
      certificates: [
        {courseName: 'self-paced-pl', coursePath: '/s/self-paced-pl'},
      ],
      courseKind: 'professional_learning_k5',
      recommendations: [],
    }),
    http.get('*/api/v1/certificates/viewer', () =>
      HttpResponse.json({
        allowedShareTargets: ['facebook', 'x', 'linkedin'],
        canBulkPrint: true,
        certificateName: null,
      }),
    ),
  );

  render(<CertificateCongratsPage encodedCourse="c2VsZi1wYWNlZC1wbA" />);

  expect(
    await screen.findByText(/add your full name to your account/),
  ).toBeVisible();
  expect(
    screen.queryByRole('link', {name: 'Share to LinkedIn'}),
  ).not.toBeInTheDocument();
});

it('PATCHes Hour of Code personalization when a session id exists', async () => {
  const patchRequest = vi.fn();
  server.use(
    http.patch('*/api/hour/certificates/:sessionId', async ({request}) => {
      patchRequest();
      const body = (await request.json()) as {name: string};
      return HttpResponse.json({certificate_sent: true, name: body.name});
    }),
  );

  render(
    <CertificateCongratsPage
      encodedCourse="b2NlYW5z"
      sessionId="session-123"
    />,
  );

  await screen.findByRole('button', {name: 'Submit'});
  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: {value: 'Ada'},
  });
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

  expect(await screen.findByText('Thanks for submitting!')).toBeVisible();
  expect(patchRequest).toHaveBeenCalledOnce();
});

it('personalizes a non-HOC completion locally with a session id', async () => {
  const patchRequest = vi.fn();
  server.use(
    completionHandler({...completionFixture, courseKind: 'other'}),
    http.patch('*/api/hour/certificates/:sessionId', () => {
      patchRequest();
      return HttpResponse.json({certificate_sent: true});
    }),
  );

  render(
    <CertificateCongratsPage
      encodedCourse="b2NlYW5z"
      sessionId="session-123"
    />,
  );

  await screen.findByRole('button', {name: 'Submit'});
  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: {value: 'Grace'},
  });
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

  expect(await screen.findByText('Thanks for submitting!')).toBeVisible();
  expect(patchRequest).not.toHaveBeenCalled();
});
