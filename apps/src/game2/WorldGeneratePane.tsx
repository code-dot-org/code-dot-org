import React, {useState} from 'react';

import {Game2ItemEntry} from './types';
import {generateWorld} from './worldGeneration';

import moduleStyles from './game2View.module.scss';

interface WorldGeneratePaneProps {
  items: Game2ItemEntry[];
  onWorldGenerated: (grid: string[][]) => void;
}

const WorldGeneratePane: React.FunctionComponent<WorldGeneratePaneProps> = ({
  items,
  onWorldGenerated,
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
      const grid = await generateWorld(prompt.trim(), items);
      onWorldGenerated(grid);
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
      <label className={moduleStyles.codeGenLabel} htmlFor="game2-world-gen">
        Generate world
      </label>
      <textarea
        id="game2-world-gen"
        className={moduleStyles.codeGenInput}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the world layout you want..."
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

export default WorldGeneratePane;
