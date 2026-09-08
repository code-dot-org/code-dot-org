import {render, screen, waitFor} from '@testing-library/react';

import {
  ApiClientProvider,
  createApiClient,
  type RequestOptions,
  type Transport,
} from '@code-dot-org/core/api';

import TutorGalleryPage from '../TutorGalleryPage';
import {TutorGalleryData} from '../types';

const request = vi.fn();
const transport: Transport = {
  request,
  requestBlob: vi.fn(),
  requestWithMeta: vi.fn(),
};
const client = createApiClient(transport);

const renderPage = (script = 'ai-1', lessonPosition = 1) =>
  render(
    <ApiClientProvider client={client}>
      <TutorGalleryPage script={script} lessonPosition={lessonPosition} />
    </ApiClientProvider>,
  );

const galleryData: TutorGalleryData = {
  currentUnitId: 100,
  units: [
    {id: 100, name: 'Problem Solving with AI', position: 1, link: '/s/ai-1'},
  ],
  sections: [{id: 5, name: 'Section 1 - CS Period 3'}],
};

// Routes the mocked transport by URL: the bootstrap fetch resolves the
// gallery data, and the gallery's own follow-up fetches resolve empty.
const stubBootstrap = () => {
  request.mockImplementation(({url}: RequestOptions) => {
    if (url.includes('gallery_data')) {
      return Promise.resolve(galleryData);
    }
    if (url.includes('unit_counts')) {
      return Promise.resolve({});
    }
    return Promise.resolve([]);
  });
};

describe('TutorGalleryPage', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('fetches the bootstrap and renders the gallery', async () => {
    stubBootstrap();

    renderPage();

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v1/scripts/ai-1/lessons/1/tutor_gallery_data',
      }),
    );
    await waitFor(() =>
      expect(screen.getByText('Extension Activities')).toBeInTheDocument(),
    );
  });

  it('shows a loading message before the bootstrap resolves', () => {
    request.mockImplementation(() => new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Loading projects…')).toBeInTheDocument();
  });

  it('shows an error message when the bootstrap request fails', async () => {
    request.mockRejectedValue(new Error('network'));

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText(/We couldn't load the gallery/),
      ).toBeInTheDocument(),
    );
  });
});
