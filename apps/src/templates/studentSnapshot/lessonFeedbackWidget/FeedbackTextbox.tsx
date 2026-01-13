import React, {useState, ChangeEvent} from 'react';

interface FeedbackTextboxProps {
  feedbackText: string;
  onFeedbackChange?: (newFeedbackText: string) => void;
}

const FeedbackTextbox: React.FC<FeedbackTextboxProps> = ({
  feedbackText,
  onFeedbackChange,
}) => {
  const [text, setText] = useState(feedbackText);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    onFeedbackChange?.(newText);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter your feedback here..."
        rows={5}
        cols={50}
      />
    </div>
  );
};

export default FeedbackTextbox;
