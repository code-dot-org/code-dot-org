import {fireEvent, render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {expect, it, vi} from 'vitest';

import {server} from '../../dev/msw/server';

import {CertificateBatchPage} from './CertificateBatchPage';

it('moves from editor to print view without persistence or navigation', async () => {
  const localStorageWrite = vi.spyOn(Storage.prototype, 'setItem');
  const {container, unmount} = render(
    <CertificateBatchPage courseName="oceans" />,
  );

  const textarea =
    await screen.findByLabelText<HTMLTextAreaElement>('Student names');
  fireEvent.change(textarea, {target: {value: ' Ada \n\nGrace '}});

  const form = container.querySelector('form');
  expect(form).not.toHaveAttribute('action');
  expect(form).not.toHaveAttribute('method');
  fireEvent.click(screen.getByRole('button', {name: 'Generate Certificates'}));

  expect(await screen.findByText(/Preparing 2 certificates/)).toBeVisible();
  expect(window.location.search).toBe('');
  expect(localStorageWrite).not.toHaveBeenCalled();

  unmount();
  render(<CertificateBatchPage courseName="oceans" />);
  expect(
    await screen.findByLabelText<HTMLTextAreaElement>('Student names'),
  ).toHaveValue('');
});

it('rejects an unknown non-HOC course fallback', async () => {
  render(<CertificateBatchPage courseName="not-a-course" />);

  expect(
    await screen.findByText(/cannot be used to print a certificate batch/),
  ).toBeVisible();
  expect(
    screen.queryByRole('button', {name: 'Generate Certificates'}),
  ).not.toBeInTheDocument();
});

it('uses the viewer bulk-print capability', async () => {
  server.use(
    http.get('*/api/v1/certificates/viewer', () =>
      HttpResponse.json({
        allowedShareTargets: [],
        canBulkPrint: false,
        certificateName: null,
      }),
    ),
  );

  render(<CertificateBatchPage />);

  expect(
    await screen.findByText(/signed in as a teacher to bulk print/),
  ).toBeVisible();
});
