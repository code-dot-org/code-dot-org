// One of an actor's tweens, on a page of its own
// (specs/TWEENS_AS_DATA_PLAN.md): a step on the trail, "Pad › fade out". Its
// name is the page's; how long and on what curve are on its head, and each
// `set` below the head is where a property ends up.

import {Typography} from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

import TextField from '@code-dot-org/component-library/textField';

import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import stepStyles from '../../rules/editor/ruleEditor.module.css';
import type {ActorData, ActorTween} from '../actorData';
import {
  actorTweenDocument,
  actorTweenProblem,
  setActorTween,
  withActorTweenDocument,
} from '../actorTweens';

export interface TweenPageProps {
  data: ActorData;
  tween: ActorTween;
  fileId: string;
  isReadOnly: boolean;
  /** Change the actor's data as the file now holds it. */
  onUpdate: (change: (data: ActorData) => ActorData) => void;
}

export const TweenPage = ({
  data,
  tween,
  fileId,
  isReadOnly,
  onUpdate,
}: TweenPageProps) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  const [draft, setDraft] = useState(tween.name);
  useEffect(() => setDraft(tween.name), [tween.name]);
  const problem =
    draft.trim() === tween.name
      ? undefined
      : actorTweenProblem(data, tween.id, draft);
  const commit = () => {
    if (!problem && draft.trim() !== tween.name) {
      onUpdate(now =>
        setActorTween(now, tween.id, one => ({...one, name: draft.trim()})),
      );
    }
  };
  const id = `${fileId}-tween`;

  return (
    <div className={stepStyles.stepPage}>
      <div
        className={stepStyles.stepBar}
        role="group"
        aria-labelledby={`${id}-heading`}
      >
        <Typography
          ref={heading}
          id={`${id}-heading`}
          tabIndex={-1}
          variant="h5"
          component="h2"
          className={stepStyles.heading}
        >
          Tween: {tween.name}
        </Typography>
        <TextField
          name={`${id}-name`}
          label="Name"
          size="s"
          readOnly={isReadOnly}
          value={draft}
          errorMessage={problem}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value)
          }
          onBlur={commit}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              commit();
            } else if (event.key === 'Escape') {
              setDraft(tween.name);
            }
          }}
        />
        <Typography variant="body3" component="p" className={stepStyles.note}>
          Each set below the head is where that property ends up, from wherever
          it is when the tween is played.
        </Typography>
      </div>
      <div className={stepStyles.codeBlocks}>
        <BlocklyFileEditor
          // The head shows the name, so a new name is a new head.
          key={tween.name}
          fileId={fileId}
          language="actor"
          isReadOnly={isReadOnly}
          initialContents={actorTweenDocument(data, tween.id)}
          memberHead={{}}
          onChange={saved =>
            onUpdate(now => withActorTweenDocument(now, tween.id, saved))
          }
        />
      </div>
    </div>
  );
};
