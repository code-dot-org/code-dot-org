import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import LessonDeepDiveTutorChat from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveTutorChat';
import {ReflectionData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';

jest.mock('@cdo/apps/lab2/views/components/AiTutorChat', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@cdo/static/ai-bot-outline.png', () => 'bot-icon.png');

const BASE_PROPS = {
  lessonId: 1,
  lessonName: 'Test Lesson',
  lessonSummary: 'A summary',
  vocabulary: [],
  assessmentAnalysis: [],
  objectives: [],
};

const REFLECTION: ReflectionData = {
  objectiveReflections: {},
  success: 'It went well',
  struggle: 'Loops were hard',
};

function renderChat(
  overrides: {
    reflectionData?: ReflectionData | null;
    welcomeMessage?: string | null;
    welcomeLoading?: boolean;
  } = {}
) {
  render(
    <LessonDeepDiveTutorChat
      {...BASE_PROPS}
      reflectionData={overrides.reflectionData ?? null}
      welcomeMessage={overrides.welcomeMessage ?? null}
      welcomeLoading={overrides.welcomeLoading ?? false}
    />
  );
}

describe('LessonDeepDiveTutorChat welcome area', () => {
  it('shows prompt to complete reflection when reflectionData is null', () => {
    renderChat();
    expect(
      screen.getByText(/head back and share your reflection/i)
    ).toBeInTheDocument();
  });

  it('shows a spinner while welcomeLoading is true', () => {
    renderChat({reflectionData: REFLECTION, welcomeLoading: true});
    expect(screen.getByTitle('Loading...')).toBeInTheDocument();
  });

  it('shows the welcome message when loaded', () => {
    renderChat({
      reflectionData: REFLECTION,
      welcomeMessage: 'Great work today!',
    });
    expect(screen.getByText('Great work today!')).toBeInTheDocument();
  });

  it('renders nothing in the message area when welcomeMessage is null and not loading', () => {
    renderChat({reflectionData: REFLECTION});
    expect(screen.queryByText(/head back/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle('Loading...')).not.toBeInTheDocument();
  });
});
