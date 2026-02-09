import React, {useState, useEffect, ChangeEvent} from 'react';

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

  useEffect(() => {
    setText(feedbackText);
  }, [feedbackText]);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    onFeedbackChange?.(newText);
  };

  return (
    <textarea
      value={text}
      onChange={handleTextChange}
      placeholder="Enter your feedback here..."
      rows={5}
      className={styles.feedbackInputBox}
    />
  );
};

export default FeedbackTextbox;
