import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

export interface FeedbackData {
  aiInteractionType: string;
  aiInteractionId: number;
  thumbsUp?: boolean;
  levelId?: number;
  scriptId?: number;
  metadata?: Record<string, string | boolean>;
}

export async function logAiInteractionFeedback(feedbackData: FeedbackData) {
  try {
    const response = await fetch('/ai_interaction_feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({
        aiInteractionType: feedbackData.aiInteractionType,
        aiInteractionId: feedbackData.aiInteractionId,
        thumbsUp: feedbackData.thumbsUp,
        levelId: feedbackData.levelId,
        scriptId: feedbackData.scriptId,
        metadata: feedbackData.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending feedback:', error);
  }
}
