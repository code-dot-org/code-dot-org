import {MetricEvent} from '@cdo/apps/lib/metrics/events';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {AITutorInteraction} from './types';

// TODO: Pagination options can be added here
interface FetchAITutorInteractionsOptions {
  sectionId?: number;
  userId?: number;
}

export async function savePromptAndResponse(
  interactionData: AITutorInteraction
) {
  try {
    const response = await fetch('/ai_tutor_interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(interactionData),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_SAVE_FAIL,
      errorMessage:
        (error as Error).message || 'Failed to save AI Tutor interaction',
    });
  }
}

// Fetch AI Tutor chat messages based on context: for all students, a specific section, or a specific student
export const fetchAITutorInteractions = async (
  options: FetchAITutorInteractionsOptions
) => {
  const baseUrl = `/ai_tutor_interactions`;
  const queryParams = [];

  if (options.sectionId) {
    queryParams.push(`sectionId=${options.sectionId}`);
  }
  if (options.userId) {
    queryParams.push(`userId=${options.userId}`);
  }

  const queryString = queryParams.join('&');
  const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_FETCH_FAIL,
      errorMessage:
        (error as Error).message || 'Failed to fetch AI Tutor chat messages',
    });
    return null;
  }
};

export interface FeedbackData {
  thumbsUp?: boolean | null;
  thumbsDown?: boolean | null;
  details?: string | null;
}

export async function saveFeedback(
  aiTutorInteractionId: number,
  feedbackData: FeedbackData
) {
  try {
    await fetch(`/ai_tutor_interactions/${aiTutorInteractionId}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(feedbackData),
    });
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_FEEDBACK_SAVE_FAIL,
      errorMessage:
        (error as Error).message || 'Failed to save AI Tutor feedback',
    });
  }
}
