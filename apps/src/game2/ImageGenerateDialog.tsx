import React, {useState} from 'react';

import moduleStyles from './game2View.module.scss';

interface ImageGenerateDialogProps {
  onSubmit: (prompt: string) => void;
  onClose: () => void;
}

const ImageGenerateDialog: React.FunctionComponent<ImageGenerateDialogProps> = ({
  onSubmit,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={moduleStyles.dialogOverlay} onClick={onClose}>
      <div
        className={moduleStyles.dialogBox}
        onClick={e => e.stopPropagation()}
      >
        <h3 className={moduleStyles.dialogTitle}>Generate Image</h3>
        <input
          className={moduleStyles.dialogInput}
          type="text"
          placeholder="Describe the image you want..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className={moduleStyles.dialogActions}>
          <button className={moduleStyles.dialogCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={moduleStyles.dialogSubmit}
            onClick={handleSubmit}
            disabled={!prompt.trim()}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerateDialog;
