import React, {useState} from 'react';

import {generateCodeFromPrompt} from './codeGeneration';
import {Game2ImageEntry} from './types';

import moduleStyles from './game2View.module.scss';

interface CodeGeneratePaneProps {
  images: Game2ImageEntry[];
  onCodeGenerated: (blocklyJson: Record<string, unknown>) => void;
}

const CodeGeneratePane: React.FunctionComponent<CodeGeneratePaneProps> = ({
  images,
  onCodeGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const blocklyJson = await generateCodeFromPrompt(prompt.trim(), images);
      onCodeGenerated(blocklyJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={moduleStyles.codeGenPane}>
      <label className={moduleStyles.codeGenLabel} htmlFor="game2-code-gen">
        Generate code
      </label>
      <textarea
        id="game2-code-gen"
        className={moduleStyles.codeGenInput}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe what your code should do..."
        rows={4}
        disabled={loading}
      />
      {error && <div className={moduleStyles.codeGenError}>{error}</div>}
      <button
        type="button"
        className={moduleStyles.codeGenSubmit}
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
};

export default CodeGeneratePane;
