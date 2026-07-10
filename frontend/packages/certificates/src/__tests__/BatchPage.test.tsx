import {render, screen} from '@testing-library/react';
import {afterEach} from 'vitest';

import {CertificateBatchPage} from '../pages/BatchPage';

afterEach(() => {
  delete document.documentElement.dataset.certificate;
});

it('seeds the editor from the Rails-hydrated shell data and POSTs the legacy form', () => {
  document.documentElement.dataset.certificate = JSON.stringify({
    courseName: 'oceans',
    courseTitle: 'AI for Oceans',
    studentNames: ['Ada', 'Grace'],
  });

  const {container} = render(<CertificateBatchPage />);

  const textarea = screen.getByLabelText<HTMLTextAreaElement>('Student names');
  expect(textarea.value).toBe('Ada\nGrace');
  expect(textarea).toHaveAttribute('name', 'studentNames');

  const form = container.querySelector('form');
  expect(form).toHaveAttribute('action', '/print_certificates/batch');
  expect(form).toHaveAttribute('method', 'post');
  expect(container.querySelector('input[name="courseName"]')).toHaveAttribute(
    'value',
    'oceans',
  );
  expect(
    container.querySelector('input[name="authenticity_token"]'),
  ).toBeInTheDocument();

  expect(screen.getByText(/Enter up to 30 names/)).toBeVisible();
  expect(
    screen.getByRole('button', {name: 'Generate Certificates'}),
  ).toBeVisible();
});
