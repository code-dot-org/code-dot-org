import React, {useState, useEffect, ChangeEvent} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import styles from './lessonFeeedback.module.scss';

interface FeedbackTextboxProps {
  feedbackText: string;
  onFeedbackChange?: (newFeedbackText: string) => void;
}

const FeedbackTextbox: React.FC<FeedbackTextboxProps> = ({
  feedbackText,
  onFeedbackChange,
}) => {
  const [text, setText] = useState(feedbackText);
  const [originalText, setOriginalText] = useState<string>('');

  useEffect(() => {
    setText(feedbackText);
  }, [feedbackText]);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    onFeedbackChange?.(newText);
  };

  // Capture the original text when user clicks into the textbox for event tracking
  const handleFocus = () => {
    setOriginalText(text);
  };

  const handleBlur = () => {
    analyticsReporter.sendEvent(
      EVENTS.LESSON_SNAPSHOT_AI_FEEDBACK_EDITED,
      {
        originalTextLength: originalText.length,
        endingTextLength: text.length,
        textChanged: originalText !== text,
      },
      PLATFORMS.STATSIG
    );
  };

  return (
    <textarea
      value={text}
      onChange={handleTextChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="Enter your feedback here..."
      rows={5}
      className={styles.feedbackInputBox}
    />
  );
};

export default FeedbackTextbox;
