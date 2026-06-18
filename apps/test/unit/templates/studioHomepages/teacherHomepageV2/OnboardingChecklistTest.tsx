import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import OnboardingChecklist from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/OnboardingChecklist';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

const mockPost = HttpClient.post as jest.MockedFunction<typeof HttpClient.post>;

const makeTour = () => ({start: jest.fn()});

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue(new Response());
  });

  it('calls HttpClient.post with started_at and demo_type when a tour button is clicked', () => {
    const createSectionTour = makeTour();

    render(
      <OnboardingChecklist
        createSectionTour={createSectionTour as never}
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
        reviewSyllabusTour={reviewSyllabusTour as never}
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
        learnHowToEvaluateTour={learnHowToEvaluateTour as never}
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

  it('does not throw when the backend call fails', async () => {
    mockPost.mockRejectedValue(new Error('network error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <OnboardingChecklist
        createSectionTour={null}
        reviewSyllabusTour={null}
        learnHowToEvaluateTour={null}
        demoType="elementary"
      />
    );

    fireEvent.click(screen.getByText('Create a class section'));

    await Promise.resolve();
    expect(console.error).toHaveBeenCalled();
  });
});
