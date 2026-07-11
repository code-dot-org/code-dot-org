import React, {useCallback, useEffect, useRef, useState} from 'react';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import {getStore} from '@cdo/apps/redux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import askSpriteLabAi, {getAvailableImageNames} from '../ai/askSpriteLabAi';
import {generateBlocklyJson} from '../blockly/generateBlocklyJson';
import {setAiGenerateState} from '../redux/spriteLab2Redux';

import GenerateImageForm from './GenerateImageForm';

import moduleStyles from './sprite-lab2-view.module.scss';

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

interface GenerateSpriteLabProps {
  guideMode: 'instructions' | 'aiCodeGenerate' | 'aiImageGenerate';
  instructions?: string;
  // Load AI-generated blocks into the Code workspace.
  onCodeGenerated: (source: WorkspaceSerialization) => void;
}

/**
 * The Lab2 Guide overlay, modeled on Music Lab's guideMode. 'instructions'
 * shows the level's instructions; 'aiCodeGenerate' adds the AI prompt that
 * generates blocks (pseudocode -> generateBlocklyJson) into the Code tab;
 * 'aiImageGenerate' hosts the Images tab's generation form instead.
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

  // Animate the Guide's height: the outer wrapper gets an explicit height
  // (which CSS can transition) tracking the natural height of the inner body.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>();
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }
    const observer = new ResizeObserver(() => setBodyHeight(body.offsetHeight));
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  const handleGenerate = useCallback(async () => {
    // Almost every command needs a costume, and with an empty list the model
    // invents names that can't validate. Guide instead of half-loading.
    const {costumes, backgrounds} = getAvailableImageNames();
    if (costumes.length === 0) {
      setError(
        'Your project has no images yet. Make some in the Images tab first, then generate.'
      );
      setStatus('error');
      return;
    }
    setStatus('generating');
    setError(null);
    dispatch(setAiGenerateState('generating'));
    let pseudocode: string | null = null;
    try {
      pseudocode = await askSpriteLabAi(prompt);
      // Diagnosis breadcrumb: what the model actually said, collapsed so it
      // doesn't spam the console.
      console.groupCollapsed('SpriteLab2 AI codegen: pseudocode');
      console.log('prompt: %s', prompt);
      console.log(pseudocode);
      console.groupEnd();
      // Validating names here means a bad program throws cleanly instead of
      // replacing the scene's blocks with a half-loaded one.
      const source = generateBlocklyJson(pseudocode, {
        sceneIdByName: getSceneIdByName(),
        costumeNames: costumes,
        backgroundNames: backgrounds,
      });
      onCodeGenerated(source);
      setStatus('generated');
      dispatch(setAiGenerateState('generated'));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.groupCollapsed('SpriteLab2 AI codegen: failed — %s', message);
      console.log('prompt: %s', prompt);
      console.log(
        pseudocode ?? '(no pseudocode — the AI request itself failed)'
      );
      console.groupEnd();
      setError(message);
      setStatus('error');
      dispatch(setAiGenerateState('none'));
    }
  }, [prompt, onCodeGenerated, dispatch]);

  const generating = status === 'generating';
  const instructionsBlock = instructions && (
    <div className={moduleStyles.guideInstructions}>
      <SafeMarkdown markdown={instructions} />
    </div>
  );

  return (
    <Guide position="bottom" width="normal">
      <div
        className={moduleStyles.guideAnimator}
        style={bodyHeight === undefined ? undefined : {height: bodyHeight}}
      >
        <div ref={bodyRef} className={moduleStyles.guideBody}>
          {guideMode === 'instructions' ? (
            instructionsBlock ||
            'Build a program in the Code tab, then press Run.'
          ) : guideMode === 'aiImageGenerate' ? (
            <>
              {instructionsBlock && (
                <>
                  {instructionsBlock}
                  <hr className={moduleStyles.guideDivider} />
                </>
              )}
              <GenerateImageForm />
            </>
          ) : (
            <>
              {instructionsBlock && (
                <>
                  {instructionsBlock}
                  <hr className={moduleStyles.guideDivider} />
                </>
              )}
              <strong>Describe a program and let AI build the blocks</strong>
              <div className={moduleStyles.guideRow}>
                <input
                  type="text"
                  value={prompt}
                  placeholder="e.g. make a platformer with a hero"
                  onChange={e => setPrompt(e.target.value)}
                  disabled={generating}
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                >
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
              {error && (
                <div className={moduleStyles.generateError}>{error}</div>
              )}
            </>
          )}
        </div>
      </div>
    </Guide>
  );
};

export default GenerateSpriteLab;
