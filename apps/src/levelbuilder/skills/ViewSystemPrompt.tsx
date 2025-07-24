import React, {useState} from 'react';
import './skills.css';

interface ViewSystemPromptProps {
  systemPrompt: string;
}

const ViewSystemPrompt: React.FC<ViewSystemPromptProps> = ({systemPrompt}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="view-system-prompt">
      <span
        className="view-system-prompt__toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="system-prompt-text"
      >
        {open ? '▼' : '▶'} View full system prompt
      </span>
      {open && (
        <div id="system-prompt-text" className="view-system-prompt__text">
          {systemPrompt}
        </div>
      )}
    </div>
  );
};

export default ViewSystemPrompt;
