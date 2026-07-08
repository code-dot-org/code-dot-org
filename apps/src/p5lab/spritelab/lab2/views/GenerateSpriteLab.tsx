import React, {useCallback, useState} from 'react';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import askSpriteLabAi from '../ai/askSpriteLabAi';
import {generateBlocklyJson} from '../blockly/generateBlocklyJson';
import {setAiGenerateState} from '../redux/spriteLab2Redux';

// Scene name (lowercased) -> id, so the parser can fill go_to_scene's SCENE
// field (which stores the id) from the name the model emits.
function getSceneIdByName(): {[lowerCaseName: string]: string} {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  const map: {[lowerCaseName: string]: string} = {};
  scenes.forEach((scene: {id?: string; name?: string}) => {
    if (scene.id && scene.name) {
      map[scene.name.toLowerCase()] = scene.id;
    }
  });
  return map;
}

import moduleStyles from './sprite-lab2-view.module.scss';

interface GenerateSpriteLabProps {
  guideMode: 'instructions' | 'aiCodeGenerate';
  instructions?: string;
  // Load AI-generated blocks into the Code workspace.
  onCodeGenerated: (source: WorkspaceSerialization) => void;
}

/**
 * The Lab2 Guide overlay for Sprite Lab 2, modeled on Music Lab's guideMode.
 * In 'instructions' mode it shows the level's instructions; in 'aiCodeGenerate'
 * mode it offers a prompt that generates Sprite Lab blocks via the AI
 * (pseudocode -> generateBlocklyJson) and loads them into the Code tab.
 */
const GenerateSpriteLab: React.FunctionComponent<GenerateSpriteLabProps> = ({
  guideMode,
  instructions,
  onCodeGenerated,
}) => {
  const dispatch = useAppDispatch();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<
    'none' | 'generating' | 'generated' | 'error'
  >('none');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setStatus('generating');
    setError(null);
    dispatch(setAiGenerateState('generating'));
    try {
      const pseudocode = await askSpriteLabAi(prompt);
      const source = generateBlocklyJson(pseudocode, {
        sceneIdByName: getSceneIdByName(),
      });
      onCodeGenerated(source);
      setStatus('generated');
      dispatch(setAiGenerateState('generated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
      dispatch(setAiGenerateState('none'));
    }
  }, [prompt, onCodeGenerated, dispatch]);

  if (guideMode === 'instructions') {
    return (
      <Guide position="bottom" width="normal">
        <div className={moduleStyles.guideBody}>
          {instructions || 'Build a program in the Code tab, then press Run.'}
        </div>
      </Guide>
    );
  }

  const generating = status === 'generating';
  return (
    <Guide position="bottom" width="normal">
      <div className={moduleStyles.guideBody}>
        <strong>Describe a program and let AI build the blocks</strong>
        <div className={moduleStyles.guideRow}>
          <input
            type="text"
            value={prompt}
            placeholder="e.g. make a platformer with a hero"
            onChange={e => setPrompt(e.target.value)}
            disabled={generating}
          />
          <button type="button" onClick={handleGenerate} disabled={generating}>
            {generating
              ? 'Generating…'
              : status === 'generated'
              ? 'Regenerate'
              : 'Generate'}
          </button>
        </div>
        {status === 'generated' && (
          <div>Blocks added to the Code tab. Edit or regenerate.</div>
        )}
        {error && <div className={moduleStyles.generateError}>{error}</div>}
      </div>
    </Guide>
  );
};

export default GenerateSpriteLab;
