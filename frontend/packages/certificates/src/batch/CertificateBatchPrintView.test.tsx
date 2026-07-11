import {render, screen, waitFor} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';

import {exportCertificateBlob} from '@/certificate/canvas/exportCertificateCanvas';
import {loadTemplateImage} from '@/certificate/template/loadCertificateTemplate';

import {courseInfoFixtures} from '../../dev/scenarios';

import {CertificateBatchPrintView} from './CertificateBatchPrintView';

vi.mock('@/certificate/canvas/exportCertificateCanvas', () => ({
  exportCertificateBlob: vi.fn().mockResolvedValue(new Blob(['certificate'])),
}));
vi.mock('@/certificate/template/loadCertificateTemplate', () => ({
  loadTemplateImage: vi.fn().mockResolvedValue({}),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('renders sequentially and revokes every object URL on unmount', async () => {
  const createObjectURL = vi
    .fn()
    .mockReturnValueOnce('blob:first')
    .mockReturnValueOnce('blob:second');
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', {createObjectURL, revokeObjectURL});

  const {unmount} = render(
    <CertificateBatchPrintView
      courseInfo={courseInfoFixtures.oceans}
      courseName="oceans"
      names={['Ada', 'Grace']}
    />,
  );

  expect(await screen.findByAltText('Certificate for Ada')).toHaveAttribute(
    'src',
    'blob:first',
  );
  expect(screen.getByAltText('Certificate for Grace')).toHaveAttribute(
    'src',
    'blob:second',
  );
  expect(loadTemplateImage).toHaveBeenCalledOnce();
  expect(exportCertificateBlob).toHaveBeenCalledTimes(2);
  expect(vi.mocked(exportCertificateBlob).mock.calls[0][0].params.name).toBe(
    'Ada',
  );
  expect(vi.mocked(exportCertificateBlob).mock.calls[1][0].params.name).toBe(
    'Grace',
  );

  unmount();
  await waitFor(() =>
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first'),
  );
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
});
