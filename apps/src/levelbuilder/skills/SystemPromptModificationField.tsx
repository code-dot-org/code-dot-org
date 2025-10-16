import React, {useState} from 'react';
import './skills.css';

interface SystemPromptModificationFieldProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

const SystemPromptModificationField: React.FC<
  SystemPromptModificationFieldProps
> = ({initialValue = '', onChange}) => {
  const [open, setOpen] = useState(false);
  const [addedAiInstructions, setAddedAiInstructions] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddedAiInstructions(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div>
      <span
        className="system-prompt-modification-field__toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="system-prompt-modification-textarea"
      >
        {open ? '▼' : '▶'} Add to the AI prompt
      </span>
      {open && (
        <div>
          <em>
            This text will be added to the AI prompt right after "Your task is
            to review the student's work." It should be a short instruction or
            context that helps the AI understand how to evaluate student work.
            <br />
            <br />
            Note: You will need to save this level for the changes to take
            effect or for you to be able to test the changes on this page.
          </em>

          <div className="system-prompt-modification-field__textarea">
            <textarea
              id="level_additional_ai_evaluation_instructions"
              className="edit-box"
              value={addedAiInstructions}
              onChange={handleChange}
              rows={4}
              placeholder="Enter your text here..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPromptModificationField;
