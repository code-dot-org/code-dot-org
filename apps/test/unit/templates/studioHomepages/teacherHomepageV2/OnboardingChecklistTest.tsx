import '@testing-library/jest-dom';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {Tour} from 'shepherd.js';

import confirmDemoSectionSettings from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/confirmDemoSectionSettings';
import OnboardingChecklist from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/OnboardingChecklist';
import useCreateSectionTour from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useCreateSectionTour';
import useLearnHowToEvaluateTour from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useLearnHowToEvaluateTour';
import useReviewSyllabusTour from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useReviewSyllabusTour';
import {
  createDemoSection,
  DemoSectionCreationError,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(() => undefined),
  useAppDispatch: jest.fn(),
}));
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useCreateSectionTour',
  () => ({__esModule: true, default: jest.fn()})
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useReviewSyllabusTour',
  () => ({__esModule: true, default: jest.fn()})
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useLearnHowToEvaluateTour',
  () => ({__esModule: true, default: jest.fn()})
);
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/confirmDemoSectionSettings',
  () => ({__esModule: true, default: jest.fn()})
);
// Keep the real DemoSectionCreationError class (the component checks
// `instanceof` it) and only stub the thunk creator itself.
jest.mock('@cdo/apps/templates/teacherDashboard/teacherSectionsRedux', () => ({
  ...jest.requireActual(
    '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux'
  ),
  createDemoSection: jest.fn(),
}));

const mockGet = HttpClient.get as jest.MockedFunction<typeof HttpClient.get>;
const mockPost = HttpClient.post as jest.MockedFunction<typeof HttpClient.post>;
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
  typeof useAppDispatch
>;
const mockUseCreateSectionTour = useCreateSectionTour as jest.MockedFunction<
  typeof useCreateSectionTour
>;
const mockUseReviewSyllabusTour = useReviewSyllabusTour as jest.MockedFunction<
  typeof useReviewSyllabusTour
>;
const mockUseLearnHowToEvaluateTour =
  useLearnHowToEvaluateTour as jest.MockedFunction<
    typeof useLearnHowToEvaluateTour
  >;
const mockConfirmDemoSectionSettings =
  confirmDemoSectionSettings as jest.MockedFunction<
    typeof confirmDemoSectionSettings
  >;
const mockCreateDemoSection = createDemoSection as jest.MockedFunction<
  typeof createDemoSection
>;

const makeJsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: {'Content-Type': 'application/json'},
  });

// A Tour exposes many methods; the checklist only ever calls start()/cancel(),
// so we stub just those and cast through unknown.
const fakeTour = () =>
  ({start: jest.fn(), cancel: jest.fn()} as unknown as Tour);

describe('OnboardingChecklist', () => {
  let createSectionTour: Tour;
  let reviewSyllabusTour: Tour;
  let learnHowToEvaluateTour: Tour;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(makeJsonResponse([]));
    mockPost.mockResolvedValue(new Response());

    createSectionTour = fakeTour();
    reviewSyllabusTour = fakeTour();
    learnHowToEvaluateTour = fakeTour();
    mockUseCreateSectionTour.mockReturnValue(createSectionTour);
    mockUseReviewSyllabusTour.mockReturnValue(reviewSyllabusTour);
    mockUseLearnHowToEvaluateTour.mockReturnValue(learnHowToEvaluateTour);
    // Not stale by default: the staleness dialog stays out of the way and
    // tours start directly.
    mockConfirmDemoSectionSettings.mockResolvedValue(false);

    // Most tests render with demoSection: null, which routes the
    // syllabus/evaluate buttons through ensureDemoSection(). Default to a
    // successful creation so those tests behave as if a section already
    // existed unless a test overrides mockDispatch itself.
    mockDispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockDispatch.mockResolvedValue({id: 99} as unknown as Section);
    mockCreateDemoSection.mockImplementation(
      demoType =>
        ({
          type: 'MOCK_CREATE_DEMO_SECTION',
          demoType,
        } as unknown as ReturnType<typeof createDemoSection>)
    );
  });

  function renderComponent(
    overrides: Partial<React.ComponentProps<typeof OnboardingChecklist>> = {}
  ) {
    const props = {
      demoSection: null,
      demoType: 'high' as const,
      isHidden: false,
      onHide: jest.fn(),
      ...overrides,
    };
    return {props, ...render(<OnboardingChecklist {...props} />)};
  }

  it('renders the checklist items when not hidden', () => {
    renderComponent();

    expect(screen.queryByText('Where should we start?')).not.toBeNull();
    expect(screen.queryByText('Review the syllabus')).not.toBeNull();
    expect(screen.queryByText('Learn how to evaluate')).not.toBeNull();
    expect(screen.queryByText('Create a class section')).not.toBeNull();
  });

  it('renders nothing when hidden', () => {
    const {container} = renderComponent({isHidden: true});

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Where should we start?')).toBeNull();
  });

  it('calls onHide when the hide button is clicked', () => {
    const {props} = renderComponent();

    fireEvent.click(screen.getByText('Hide onboarding'));

    expect(props.onHide).toHaveBeenCalledTimes(1);
  });

  it('starts the matching tour when a checklist item is clicked', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Create a class section'));
    expect(createSectionTour.start).toHaveBeenCalledTimes(1);

    // The syllabus/evaluate tours run through the async staleness gate, so
    // their start() lands a microtask after the click.
    fireEvent.click(screen.getByText('Review the syllabus'));
    await waitFor(() =>
      expect(reviewSyllabusTour.start).toHaveBeenCalledTimes(1)
    );

    fireEvent.click(screen.getByText('Learn how to evaluate'));
    await waitFor(() =>
      expect(learnHowToEvaluateTour.start).toHaveBeenCalledTimes(1)
    );
  });

  it('calls HttpClient.post with started_at and demo_type when a tour button is clicked', () => {
    renderComponent({demoType: 'elementary'});

    fireEvent.click(screen.getByText('Create a class section'));

    expect(mockPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({
        tour_name: 'create_class_section',
        started_at: true,
        properties: {demo_type: 'elementary'},
      }),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('starts the correct tour after recording', async () => {
    renderComponent({demoType: 'high'});

    fireEvent.click(screen.getByText('Review the syllabus'));

    expect(mockPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({
        tour_name: 'view_syllabus',
        started_at: true,
        properties: {demo_type: 'high'},
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    await waitFor(() => expect(reviewSyllabusTour.start).toHaveBeenCalled());
  });

  it('sends the correct tour name for learn-to-evaluate', () => {
    renderComponent({demoType: 'middle'});

    fireEvent.click(screen.getByText('Learn how to evaluate'));

    expect(mockPost).toHaveBeenCalledWith(
      '/dashboardapi/v1/user_product_tours',
      JSON.stringify({
        tour_name: 'learn_to_evaluate',
        started_at: true,
        properties: {demo_type: 'middle'},
      }),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('does not throw when the tour start POST fails', async () => {
    mockPost.mockRejectedValue(new Error('network error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();

    fireEvent.click(screen.getByText('Create a class section'));

    await Promise.resolve();
    expect(console.error).toHaveBeenCalled();
  });

  it('shows no check icons when no tours are completed', async () => {
    mockGet.mockResolvedValue(makeJsonResponse([]));

    renderComponent();

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        '/dashboardapi/v1/user_product_tours',
        true
      );
    });

    expect(document.querySelector('.fa-circle-check')).toBeNull();
  });

  it('shows a check icon only for tours that are completed', async () => {
    mockGet.mockResolvedValue(makeJsonResponse(['create_class_section']));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Create a class section').closest('button')
      ).toContainElement(
        // The circle-check icon is rendered as an <i> or <svg> inside the button
        document.querySelector('[data-icon-name="circle-check"]') ||
          document.querySelector('.fa-circle-check') ||
          (screen.queryAllByRole('img')[0] as HTMLElement)
      );
    });
  });

  it('does not show a check icon for tours that are not completed', async () => {
    mockGet.mockResolvedValue(makeJsonResponse(['create_class_section']));

    renderComponent();

    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    const reviewButton = screen
      .getByText('Review the syllabus')
      .closest('button');
    expect(reviewButton).not.toContainHTML('circle-check');
  });

  describe('when all three tours are completed', () => {
    const ALL_TOURS = [
      'view_syllabus',
      'learn_to_evaluate',
      'create_class_section',
    ];

    it('shows the celebration state instead of the checklist', async () => {
      mockGet.mockResolvedValue(makeJsonResponse(ALL_TOURS));

      renderComponent();

      await waitFor(() =>
        expect(screen.queryByText("You're all set!")).not.toBeNull()
      );
      expect(screen.queryByText('Where should we start?')).toBeNull();
      expect(screen.queryByText('Review the syllabus')).toBeNull();
    });

    it('calls onHide when "Complete onboarding" is clicked', async () => {
      mockGet.mockResolvedValue(makeJsonResponse(ALL_TOURS));
      const {props} = renderComponent();

      await waitFor(() =>
        expect(screen.queryByText('Complete onboarding')).not.toBeNull()
      );
      fireEvent.click(screen.getByText('Complete onboarding'));

      expect(props.onHide).toHaveBeenCalledTimes(1);
    });

    it('hides the "Hide onboarding" button in the celebration state', async () => {
      mockGet.mockResolvedValue(makeJsonResponse(ALL_TOURS));

      renderComponent();

      await waitFor(() =>
        expect(screen.queryByText("You're all set!")).not.toBeNull()
      );
      expect(screen.queryByText('Hide onboarding')).toBeNull();
    });
  });

  it('does not show the celebration state when only some tours are completed', async () => {
    mockGet.mockResolvedValue(
      makeJsonResponse(['view_syllabus', 'learn_to_evaluate'])
    );

    renderComponent();

    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    expect(screen.queryByText("You're all set!")).toBeNull();
    expect(screen.queryByText('Where should we start?')).not.toBeNull();
  });

  it('does not throw when the completion fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderComponent();

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());
    consoleErrorSpy.mockRestore();
  });

  describe('when the demo section is stale', () => {
    const STALENESS_TITLE = 'Your onboarding experience is just one step away';
    const RESET_ERROR =
      "We couldn't reset your demo section. Please try again.";
    const staleDemoSection = {id: 42} as unknown as Section;

    // The mount-time staleness check resolves on a microtask; drain it so
    // isDemoSectionStale is set before we click a checklist item.
    const flushMountEffects = () =>
      act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

    beforeEach(() => {
      mockConfirmDemoSectionSettings.mockResolvedValue(true);
    });

    it('blocks the syllabus tour behind the dialog instead of starting it', async () => {
      renderComponent({demoSection: staleDemoSection});
      await flushMountEffects();

      fireEvent.click(screen.getByText('Review the syllabus'));

      expect(await screen.findByText(STALENESS_TITLE)).not.toBeNull();
      expect(reviewSyllabusTour.start).not.toHaveBeenCalled();
    });

    it('does not block the create-section tour', async () => {
      renderComponent({demoSection: staleDemoSection});
      await flushMountEffects();

      fireEvent.click(screen.getByText('Create a class section'));

      expect(createSectionTour.start).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(STALENESS_TITLE)).toBeNull();
    });

    it('cancels the pending tour and dismisses the dialog on cancel', async () => {
      renderComponent({demoSection: staleDemoSection});
      await flushMountEffects();

      fireEvent.click(screen.getByText('Review the syllabus'));
      fireEvent.click(await screen.findByText('Cancel'));

      expect(reviewSyllabusTour.cancel).toHaveBeenCalledTimes(1);
      expect(reviewSyllabusTour.start).not.toHaveBeenCalled();
      expect(screen.queryByText(STALENESS_TITLE)).toBeNull();
    });

    it('resets the demo section then starts the tour on confirm', async () => {
      renderComponent({demoSection: staleDemoSection});
      await flushMountEffects();

      fireEvent.click(screen.getByText('Review the syllabus'));
      fireEvent.click(await screen.findByText('Reset course assignment'));

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/sections/demo/reset',
        JSON.stringify({id: 42}),
        true,
        {'Content-Type': 'application/json'}
      );
      // The tour starts once the reset POST resolves, a microtask later.
      await waitFor(() =>
        expect(reviewSyllabusTour.start).toHaveBeenCalledTimes(1)
      );
    });

    it('surfaces an error and leaves the tour unstarted when reset fails', async () => {
      mockPost.mockImplementation((url: string) =>
        url === '/api/v1/sections/demo/reset'
          ? Promise.reject(new Error('network error'))
          : Promise.resolve(new Response())
      );
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderComponent({demoSection: staleDemoSection});
      await flushMountEffects();

      fireEvent.click(screen.getByText('Review the syllabus'));
      fireEvent.click(await screen.findByText('Reset course assignment'));

      expect(await screen.findByText(RESET_ERROR)).not.toBeNull();
      expect(reviewSyllabusTour.start).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('when there is no demo section yet', () => {
    const CREATION_ERROR =
      "Couldn't create your practice section. Please try again.";

    it('creates a demo section before starting the syllabus tour', async () => {
      renderComponent({demoSection: null, demoType: 'middle'});

      fireEvent.click(screen.getByText('Review the syllabus'));

      expect(mockCreateDemoSection).toHaveBeenCalledWith('middle');
      await waitFor(() =>
        expect(reviewSyllabusTour.start).toHaveBeenCalledTimes(1)
      );
    });

    it('creates a demo section before starting the evaluate tour', async () => {
      renderComponent({demoSection: null, demoType: 'middle'});

      fireEvent.click(screen.getByText('Learn how to evaluate'));

      expect(mockCreateDemoSection).toHaveBeenCalledWith('middle');
      await waitFor(() =>
        expect(learnHowToEvaluateTour.start).toHaveBeenCalledTimes(1)
      );
    });

    it('does not create a demo section for the create-section tour', () => {
      renderComponent({demoSection: null});

      fireEvent.click(screen.getByText('Create a class section'));

      expect(createSectionTour.start).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('shows a creation error and leaves the tour unstarted when creation rejects', async () => {
      mockDispatch.mockRejectedValue(
        new DemoSectionCreationError(
          'generic',
          "Couldn't create your practice section."
        )
      );
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderComponent({demoSection: null});

      fireEvent.click(screen.getByText('Review the syllabus'));

      expect(await screen.findByText(CREATION_ERROR)).not.toBeNull();
      expect(reviewSyllabusTour.start).not.toHaveBeenCalled();
      // The thunk already logs DemoSectionCreationError itself; the
      // component shouldn't log it a second time.
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        'Failed to create demo section:',
        expect.anything()
      );
      consoleErrorSpy.mockRestore();
    });

    it('logs and shows a creation error when creation fails unexpectedly', async () => {
      mockDispatch.mockRejectedValue(new Error('network error'));
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderComponent({demoSection: null});

      fireEvent.click(screen.getByText('Learn how to evaluate'));

      expect(await screen.findByText(CREATION_ERROR)).not.toBeNull();
      expect(learnHowToEvaluateTour.start).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create demo section:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('shows a creation error when the created section has no id', async () => {
      mockDispatch.mockResolvedValue(undefined);

      renderComponent({demoSection: null});

      fireEvent.click(screen.getByText('Review the syllabus'));

      expect(await screen.findByText(CREATION_ERROR)).not.toBeNull();
      expect(reviewSyllabusTour.start).not.toHaveBeenCalled();
    });

    it('does not create a demo section when one already exists', async () => {
      const existingSection = {id: 7} as unknown as Section;
      renderComponent({demoSection: existingSection});

      fireEvent.click(screen.getByText('Review the syllabus'));

      await waitFor(() =>
        expect(reviewSyllabusTour.start).toHaveBeenCalledTimes(1)
      );
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockCreateDemoSection).not.toHaveBeenCalled();
    });
  });
});
