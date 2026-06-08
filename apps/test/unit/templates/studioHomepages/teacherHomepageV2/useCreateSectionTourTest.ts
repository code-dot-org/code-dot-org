import {recordTourCompletion} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useCreateSectionTour';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

const mockHttpClientPost = HttpClient.post as jest.MockedFunction<
  typeof HttpClient.post
>;

describe('recordTourCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls HttpClient.post with correct args', () => {
    mockHttpClientPost.mockResolvedValue(new Response());

    recordTourCompletion();

    expect(mockHttpClientPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({tour_name: 'create_class_section'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('does not throw when the backend call fails', async () => {
    mockHttpClientPost.mockRejectedValue(new Error('network error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    recordTourCompletion();

    await Promise.resolve();
    expect(console.error).toHaveBeenCalled();
  });
});
