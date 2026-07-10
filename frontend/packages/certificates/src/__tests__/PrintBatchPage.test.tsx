import {render, screen} from '@testing-library/react';
import {afterEach} from 'vitest';

import {CertificatePrintBatchPage} from '../pages/PrintBatchPage';

afterEach(() => {
  delete document.documentElement.dataset.certificate;
});

it('caps the batch at 30 names client-side', async () => {
  document.documentElement.dataset.certificate = JSON.stringify({
    courseName: 'hourofcode',
    studentNames: Array.from({length: 35}, (_, index) => `Student ${index}`),
  });

  render(<CertificatePrintBatchPage />);

  expect(await screen.findByText(/Preparing 30 certificates/)).toBeVisible();
  expect(screen.getByRole('button', {name: 'Print'})).toBeVisible();
});
