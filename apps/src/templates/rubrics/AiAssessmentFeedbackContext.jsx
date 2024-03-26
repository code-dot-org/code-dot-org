import {createContext} from 'react';

const AiAssessmentFeedbackContext = createContext(null);

/**
 * This represents the context used to coordinate the state of the feedback
 * buttons (thumbs up / down) for the AI assessment in the rubric.
 */
export default AiAssessmentFeedbackContext;
