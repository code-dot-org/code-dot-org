import {createContext} from 'react';

export const NO_FEEDBACK = -1;
export const THUMBS_DOWN = 0;
export const THUMBS_UP = 1;

const AiAssessmentFeedbackContext = createContext({});

/**
 * This represents the context used to coordinate the state of the feedback
 * buttons (thumbs up / down) for the AI assessment in the rubric.
 */
export default AiAssessmentFeedbackContext;
