import React, {useState} from 'react';

import moduleStyles from './game2View.module.scss';

interface ImageGenerateDialogProps {
  onSubmit: (
    name: string,
    prompt: string,
    isSprite: boolean
  ) => void | Promise<void>;
  onClose: () => void;
}

const ImageGenerateDialog: React.FunctionComponent<
  ImageGenerateDialogProps
> = ({onSubmit, onClose}) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSprite, setIsSprite] = useState(true);

  const canSubmit = name.trim() && prompt.trim();

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(name.trim(), prompt.trim(), isSprite);
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
          placeholder="Name (e.g. cat, tree, hero)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <input
          className={moduleStyles.dialogInput}
          type="text"
          placeholder="Describe the image you want..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <label className={moduleStyles.dialogCheckbox}>
          <input
            type="checkbox"
            checked={isSprite}
            onChange={e => setIsSprite(e.target.checked)}
          />
          Sprite (with transparency)
        </label>
        <div className={moduleStyles.dialogActions}>
          <button
            type="button"
            className={moduleStyles.dialogCancel}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={moduleStyles.dialogSubmit}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerateDialog;
