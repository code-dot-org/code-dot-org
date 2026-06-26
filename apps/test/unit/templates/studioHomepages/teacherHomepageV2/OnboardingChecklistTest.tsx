import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {Tour} from 'shepherd.js';

import OnboardingChecklist from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/OnboardingChecklist';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const mockGet = HttpClient.get as jest.MockedFunction<typeof HttpClient.get>;
const mockPost = HttpClient.post as jest.MockedFunction<typeof HttpClient.post>;

const makeJsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: {'Content-Type': 'application/json'},
  });

// A Tour exposes many methods; the checklist only ever calls start(), so we
// stub just that and cast through unknown.
const fakeTour = () => ({start: jest.fn()} as unknown as Tour);

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(makeJsonResponse([]));
    mockPost.mockResolvedValue(new Response());
  });

  function renderComponent(
    overrides: Partial<React.ComponentProps<typeof OnboardingChecklist>> = {}
  ) {
    const props = {
      createSectionTour: fakeTour(),
      reviewSyllabusTour: fakeTour(),
      learnHowToEvaluateTour: fakeTour(),
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

  it('starts the matching tour when a checklist item is clicked', () => {
    const {props} = renderComponent();

    fireEvent.click(screen.getByText('Create a class section'));
    expect(props.createSectionTour?.start).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Review the syllabus'));
    expect(props.reviewSyllabusTour?.start).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Learn how to evaluate'));
    expect(props.learnHowToEvaluateTour?.start).toHaveBeenCalledTimes(1);
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

  it('starts the correct tour after recording', () => {
    const {props} = renderComponent({demoType: 'high'});

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
    expect(props.reviewSyllabusTour?.start).toHaveBeenCalled();
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

  it('does not throw when the completion fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderComponent();

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());
    consoleErrorSpy.mockRestore();
  });
});
