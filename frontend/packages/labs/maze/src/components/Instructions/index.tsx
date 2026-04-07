import {BlocklyMarkdown} from '@code-dot-org/blockly-workspace';
import Button from '@code-dot-org/component-library/button';

import {useRef, useEffect, useState} from 'react';

import type {Skin} from '../../skin';
import type {AuthoredHint} from '../../types';

import moduleStyles from './instructions.module.scss';

export interface InstructionsProps {
  skin: Skin;
  longInstructions: string;
  authoredHints?: AuthoredHint[];
}

const Instructions = ({
  skin,
  longInstructions,
  authoredHints,
}: InstructionsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  console.log('hm', authoredHints);
  const [confirmingHint, setConfirmingHint] = useState<boolean>(false);
  const [hintsShown, setHintsShown] = useState<number>(0);

  // On every render, scroll down
  useEffect(() => {
    if (containerRef.current) {
      // Scroll it down
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [confirmingHint, hintsShown, containerRef]);

  return (
    <div className={moduleStyles.instructions} ref={containerRef}>
      <div className={moduleStyles.instructionsEntry}>
        <span>
          <img src={skin.smallStaticAvatar} />
        </span>
        <BlocklyMarkdown className={moduleStyles.instructionsContent}>
          {longInstructions}
        </BlocklyMarkdown>
      </div>
      {(authoredHints || []).slice(0, hintsShown).map((hint, i) => (
        <div
          className={moduleStyles.instructionsEntry}
          key={`markdown-hint-${i}`}
        >
          <span>
            <img src={skin.smallStaticAvatar} />
          </span>
          <BlocklyMarkdown className={moduleStyles.instructionsContent}>
            {hint.hintMarkdown}
          </BlocklyMarkdown>
        </div>
      ))}
      {(authoredHints?.length || 0) > hintsShown &&
        (confirmingHint ? (
          <>
            <div className={moduleStyles.instructionsEntry}>
              <span>
                <img src={skin.smallStaticAvatar} />
              </span>
              <BlocklyMarkdown className={moduleStyles.instructionsContent}>
                Would you like a hint?
              </BlocklyMarkdown>
            </div>
            <div className={moduleStyles.instructionsEntry}>
              <Button
                size="xs"
                type="secondary"
                color="gray"
                onClick={() => {
                  setHintsShown(hintsShown + 1);
                  setConfirmingHint(false);
                }}
                text="Yes"
                iconLeft={{iconName: 'thumbs-up', iconStyle: 'solid'}}
              />
              <Button
                size="xs"
                type="secondary"
                color="gray"
                onClick={() => setConfirmingHint(false)}
                text="No"
                iconLeft={{iconName: 'thumbs-down', iconStyle: 'solid'}}
              />
            </div>
          </>
        ) : (
          <Button
            size="xs"
            type="secondary"
            color="gray"
            onClick={() => setConfirmingHint(true)}
            text="Hint"
            iconLeft={{iconName: 'lightbulb', iconStyle: 'solid'}}
          />
        ))}
    </div>
  );
};

export default Instructions;
