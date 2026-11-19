import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import TutorFeedback from '@cdo/apps/aiTutor/views/lessonDeepDive/SkillsCheck/TutorFeedback';

jest.mock('@cdo/apps/aichat/aichatApi', () => ({
  postAichatCompletionMessage: jest.fn(),
}));

const postCompletion = postAichatCompletionMessage as jest.Mock;

describe('TutorFeedback', () => {
  beforeEach(() => {
    postCompletion.mockReset();
  });

  it('asks the tutor once and shows its feedback', async () => {
    postCompletion.mockResolvedValue([{chatMessageText: 'Well done.'}]);
    const onFeedback = jest.fn();

    render(
      <TutorFeedback
        systemPrompt="You are a tutor."
        userMessage="The student got this practice problem RIGHT."
        lessonId={42}
        onFeedback={onFeedback}
      />
    );

    expect(await screen.findByText('Well done.')).toBeInTheDocument();
    expect(onFeedback).toHaveBeenCalledWith('Well done.');
    expect(postCompletion).toHaveBeenCalledTimes(1);
    expect(postCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        chatMessageText: 'The student got this practice problem RIGHT.',
      }),
      [],
      expect.objectContaining({systemPrompt: 'You are a tutor.'}),
      {
        clientType: 'lesson-deep-dive',
        currentLevelId: null,
        scriptId: null,
        channelId: undefined,
        lessonId: 42,
      }
    );
  });

  it('shows nothing when the tutor request fails', async () => {
    postCompletion.mockRejectedValue(new Error('network'));
    const onFeedback = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const {container} = render(
      <TutorFeedback
        systemPrompt="You are a tutor."
        userMessage="The student got this practice problem WRONG."
        lessonId={42}
        onFeedback={onFeedback}
      />
    );

    await waitFor(() => expect(postCompletion).toHaveBeenCalled());
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(onFeedback).not.toHaveBeenCalled();
  });
});
