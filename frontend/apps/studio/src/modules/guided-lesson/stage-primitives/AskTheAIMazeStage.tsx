import {useCallback, useState} from 'react';

import type * as BlocklyTypes from 'blockly/core';

import MazeLabStage from '../MazeLabStage';
import type {MazeStageConfig} from '../MazeLabStage';

import styles from './stagePrimitives.module.scss';

/**
 * "Ask the AI to write it" — the deterministic-hallucination hook.
 *
 * The student presses a friendly button. We pretend the AI generates a
 * solution. In reality, `plantedBlocks` is an authored XML string for this
 * step's bug — off-by-one, swapped direction, inverted condition, etc. The
 * blocks fade into the workspace; the student now has to *read* what
 * arrived and decide whether to trust it.
 *
 * Why authored, not LLM: pedagogical reliability (the bug needs to be the
 * one the lesson can teach), demo stability, and token cost. The chat-side
 * tutor is still the real LLM for hints when the student asks.
 *
 * Injection path: grab `Blockly.getMainWorkspace()` and call
 * `Blockly.Xml.clearWorkspaceAndLoadFromXml`. The lazy import keeps Blockly
 * out of the studio's main chunk; by the time this button is clickable the
 * maze lab has already pulled it in.
 */

interface Props {
  config: MazeStageConfig;
  /**
   * XML string of the buggy program the "AI" plants. Same shape as the
   * maze lab's `startBlocks`. Should always include `when_run` as the
   * root since we replace the whole workspace.
   */
  plantedBlocks: string;
  /** Optional kid-facing description of what the AI "says" it did. */
  aiClaim?: string;
}

const AskTheAIMazeStage = ({config, plantedBlocks, aiClaim}: Props) => {
  const [asked, setAsked] = useState(false);
  const [thinking, setThinking] = useState(false);

  const handleAskAI = useCallback(async () => {
    if (asked || thinking) return;
    setThinking(true);
    // 900ms "thinking" beat — long enough to read the spinner copy, short
    // enough that it doesn't feel like a real network round-trip.
    await new Promise(r => setTimeout(r, 900));
    try {
      const BlocklyMod = await import('blockly/core');
      const Blockly =
        (BlocklyMod as unknown as {default?: typeof BlocklyMod}).default ??
        BlocklyMod;
      // `getMainWorkspace()` returns `Workspace`, but the maze lab always
      // injects a `WorkspaceSvg`. The XML loader only accepts the SVG
      // flavor; the cast is safe because the maze is on screen by the
      // time this button is clickable.
      const workspace = Blockly.getMainWorkspace() as BlocklyTypes.WorkspaceSvg;
      if (!workspace) {
        console.warn('[AskTheAIMazeStage] no main workspace');
        return;
      }
      const xmlDom = Blockly.utils.xml.textToDom(plantedBlocks);
      Blockly.Xml.clearWorkspaceAndLoadFromXml(xmlDom, workspace);
      setAsked(true);
    } catch (err) {
      console.warn('[AskTheAIMazeStage] failed to inject planted blocks', err);
    } finally {
      setThinking(false);
    }
  }, [asked, thinking, plantedBlocks]);

  return (
    <div className={styles.askAiHost}>
      <div className={styles.askAiBanner}>
        {!asked ? (
          <>
            <span className={styles.askAiCopy}>
              <span className={styles.askAiRobot}>🤖</span>
              <span>
                {thinking
                  ? 'AI is writing…'
                  : 'Want the AI to take a shot at this maze?'}
              </span>
            </span>
            <button
              type="button"
              className={styles.askAiButton}
              onClick={handleAskAI}
              disabled={thinking}
            >
              {thinking ? 'Thinking…' : 'Ask the AI to write it'}
            </button>
          </>
        ) : (
          <span className={styles.askAiCopy}>
            <span className={styles.askAiRobot}>🤖</span>
            <span>
              <strong>AI says:</strong>{' '}
              {aiClaim ?? '“This will solve the maze. Press Run!”'}{' '}
              <em>Read it first — does it actually work?</em>
            </span>
          </span>
        )}
      </div>
      <div className={styles.askAiMaze}>
        <MazeLabStage config={config} />
      </div>
    </div>
  );
};

export default AskTheAIMazeStage;
