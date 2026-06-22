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

const makeTour = () => ({start: jest.fn()});

const defaultProps = {
  createSectionTour: null,
  reviewSyllabusTour: null,
  learnHowToEvaluateTour: null,
  demoType: 'elementary' as const,
};

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(makeJsonResponse([]));
    mockPost.mockResolvedValue(new Response());
  });

  it('calls HttpClient.post with started_at and demo_type when a tour button is clicked', () => {
    const createSectionTour = makeTour();

    render(
      <OnboardingChecklist
        createSectionTour={createSectionTour as unknown as Tour}
        reviewSyllabusTour={null}
        learnHowToEvaluateTour={null}
        demoType="elementary"
      />
    );

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
    const reviewSyllabusTour = makeTour();

    render(
      <OnboardingChecklist
        createSectionTour={null}
        reviewSyllabusTour={reviewSyllabusTour as unknown as Tour}
        learnHowToEvaluateTour={null}
        demoType="high"
      />
    );

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
    expect(reviewSyllabusTour.start).toHaveBeenCalled();
  });

  it('sends the correct tour name for learn-to-evaluate', () => {
    const learnHowToEvaluateTour = makeTour();

    render(
      <OnboardingChecklist
        createSectionTour={null}
        reviewSyllabusTour={null}
        learnHowToEvaluateTour={learnHowToEvaluateTour as unknown as Tour}
        demoType="middle"
      />
    );

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

    render(<OnboardingChecklist {...defaultProps} />);

    fireEvent.click(screen.getByText('Create a class section'));

    await Promise.resolve();
    expect(console.error).toHaveBeenCalled();
  });

  it('shows no check icons when no tours are completed', async () => {
    mockGet.mockResolvedValue(makeJsonResponse([]));

    render(<OnboardingChecklist {...defaultProps} />);

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

    render(<OnboardingChecklist {...defaultProps} />);

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

    render(<OnboardingChecklist {...defaultProps} />);

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

    render(<OnboardingChecklist {...defaultProps} />);

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());
    consoleErrorSpy.mockRestore();
  });
});
