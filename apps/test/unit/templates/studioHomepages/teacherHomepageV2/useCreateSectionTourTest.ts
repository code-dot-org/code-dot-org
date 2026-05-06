import {renderHook} from '@testing-library/react-hooks';

import useOnboardingTour, {
  UseOnboardingTourProps,
} from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import useCreateSectionTour from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useCreateSectionTour';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

jest.mock('@cdo/apps/sharedComponents/productTour/useOnboardingTour', () =>
  jest.fn()
);

jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/createSectionOnboarding',
  () => ({
    createHomepageSteps: jest.fn().mockReturnValue([]),
    createSectionsNewSteps: jest.fn().mockReturnValue([]),
  })
);

const mockUseOnboardingTour = useOnboardingTour as jest.MockedFunction<
  typeof useOnboardingTour
>;
const mockHttpClientPost = HttpClient.post as jest.MockedFunction<
  typeof HttpClient.post
>;

describe('useCreateSectionTour', () => {
  let capturedProps: UseOnboardingTourProps;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOnboardingTour.mockImplementation(
      (props: UseOnboardingTourProps) => {
        capturedProps = props;
        return {tour: {} as never};
      }
    );
  });

  it('calls HttpClient.post with correct args when onComplete fires', async () => {
    mockHttpClientPost.mockResolvedValue(new Response());

    renderHook(() => useCreateSectionTour(false));

    expect(capturedProps.onComplete).toBeDefined();
    capturedProps.onComplete!();

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

    renderHook(() => useCreateSectionTour(false));
    capturedProps.onComplete!();

    // Allow the rejected promise to settle without throwing
    await Promise.resolve();
    expect(console.error).toHaveBeenCalled();
  });
});
