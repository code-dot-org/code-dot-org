import {fireEvent, render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';

import {server} from '../../dev/msw/server';
import {congratsFixture} from '../../dev/scenarios';
import {CertificateCongratsPage} from '../pages/CongratsPage';

it('renders the granted certificate and personalize flow', async () => {
  render(<CertificateCongratsPage s="b2NlYW5z" />);

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

  const nameText = screen.getByText('Ada');
  expect(nameText).toBeVisible();
  expect(nameText).toHaveAttribute('data-notranslate');
});

it('renders nothing entitlement-wise when the API grants no certificates', async () => {
  server.use(
    http.get('*/api/v1/certificates/congrats', () =>
      HttpResponse.json({...congratsFixture, certificates: []}),
    ),
  );

  render(<CertificateCongratsPage s="b2NlYW5z" />);

  expect(await screen.findByText(/You must complete the course/)).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('renders an assignable-course suggestion as a card linking to the catalog', async () => {
  server.use(
    http.get('*/api/v1/certificates/congrats', () =>
      HttpResponse.json({
        ...congratsFixture,
        assignableCourseSuggestions: [
          {
            course_version_path: '/courses/csd',
            description: 'A great course.',
            display_name: 'CS Discoveries',
            key: 'csd',
          },
        ],
      }),
    ),
  );

  render(<CertificateCongratsPage s="b2NlYW5z" />);

  expect(
    await screen.findByRole('heading', {
      name: 'Start teaching CS Discoveries!',
    }),
  ).toBeVisible();
  expect(
    screen.getByRole('link', {name: 'View in the curriculum catalog'}),
  ).toHaveAttribute('href', '/courses/csd');
});
