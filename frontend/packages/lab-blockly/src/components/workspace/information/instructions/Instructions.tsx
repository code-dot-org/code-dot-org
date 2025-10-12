import React, {useState, useRef, useEffect, useContext} from 'react';

import {BlocklyMarkdown} from '@code-dot-org/blockly-workspace';
import {BlocklyContext} from '@code-dot-org/blockly-workspace/contexts';
import Button from '@code-dot-org/component-library/button';
import Image from '@code-dot-org/component-library/image';
import Typography from '@code-dot-org/component-library/typography';
import type {HintData} from '@code-dot-org/models/levels';

import {LevelContext} from '@lab-blockly/contexts';

import moduleStyles from './instructions.module.scss';

interface SpeechBubbleProps {
  text: string;
  avatar?: string;
  hintCount?: number;
  onHintClick?: () => void;
  onYes?: () => void;
  onNo?: () => void;
}

const SpeechBubble: React.FunctionComponent<SpeechBubbleProps> = ({
  text,
  avatar,
  hintCount,
  onHintClick,
  onYes,
  onNo,
}) => {
  const {blocks, renderer, theme, plugins} = useContext(BlocklyContext);
  console.log('renderer?', renderer, 'context', BlocklyContext);

  return (
    <div className={moduleStyles.speechBubble}>
      <div className={moduleStyles.avatar}>
        {avatar && (
          <>
            <Image src={avatar} className={moduleStyles.avatarImage} />
            {!!hintCount && hintCount > 0 && (
              <>
                <Button
                  className={moduleStyles.hintButton}
                  icon={{iconName: 'lightbulb', iconStyle: 'solid'}}
                  isIconOnly
                  color="black"
                  type="tertiary"
                  size="l"
                  onClick={onHintClick}
                />
                <Typography
                  semanticTag="span"
                  visualAppearance="body-four"
                  className={moduleStyles.hintCount}
                >
                  {hintCount}
                </Typography>
              </>
            )}
          </>
        )}
      </div>
      <div className={moduleStyles.textContainer}>
        {renderer && (
          <BlocklyMarkdown
            renderer={renderer}
            blocks={blocks}
            theme={theme}
            plugins={plugins}
            className={moduleStyles.text}
          >
            {text}
          </BlocklyMarkdown>
        )}
        {onYes && onNo && (
          <div className={moduleStyles.hintButtons}>
            <Button text="Yes" onClick={onYes} />
            <Button text="No" type="secondary" color="black" onClick={onNo} />
          </div>
        )}
      </div>
    </div>
  );
};

export interface InstructionsProps {
  instructions: string;
  hints?: HintData[];
  avatar?: string;
}

/**
 * Represents a set of instructions and hints and such for a level.
 */
const Instructions: React.FunctionComponent<InstructionsProps> = ({
  instructions,
  hints,
  avatar,
}) => {
  hints ||= [];

  const containerRef = useRef<HTMLDivElement | null>(null);

  const {hintsShown, setHintsShown} = useContext(LevelContext);
  const [confirmHint, setConfirmHint] = useState<boolean>(false);

  // On every render, scroll down
  useEffect(() => {
    if (containerRef.current) {
      // Find the tab panel
      let tabPanel: HTMLDivElement | null = containerRef.current;
      while (tabPanel.getAttribute('role') !== 'tabpanel') {
        tabPanel = tabPanel.parentNode as HTMLDivElement;
      }

      // The tab panel container is above the tab panel
      const tabPanels = tabPanel.parentNode as HTMLDivElement;

      // Scroll it down
      tabPanels.scrollTop = tabPanels.scrollHeight;
    }
  }, [hintsShown, instructions, confirmHint, containerRef.current]);

  return (
    <div className={moduleStyles.instructionsContainer} ref={containerRef}>
      <SpeechBubble
        text={instructions || ''}
        avatar={hintsShown === 0 && !confirmHint ? avatar : undefined}
        hintCount={hints.length - hintsShown}
        onHintClick={() => setConfirmHint(true)}
      />
      {hints.slice(0, hintsShown).map((hint, i) => (
        <SpeechBubble
          text={hint.markdown}
          avatar={i === hintsShown - 1 && !confirmHint ? avatar : undefined}
          onHintClick={() => setConfirmHint(true)}
          hintCount={hints.length - hintsShown}
          key={`hint-${i}`}
        />
      ))}
      {confirmHint && (
        <SpeechBubble
          text="Do you want a hint?"
          avatar={avatar}
          onYes={() => {
            setHintsShown(hintsShown + 1);
            setConfirmHint(false);
          }}
          onNo={() => setConfirmHint(false)}
        />
      )}
    </div>
  );
};

export default Instructions;
