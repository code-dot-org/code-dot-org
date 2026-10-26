// One of an actor's events or blocks, designed (specs/ACTOR_BLOCKS_PLAN.md,
// step 3): a step on the trail, "Hero › push".
//
// The block at the top, drawn from the parts as they are arranged; the parts
// as chips; what it is for; and, for a block, what it does — the editor's
// own surface for its implementation, below the design rather than behind a
// pencil.
//
// THE ARRANGEMENT IS THE PAGE'S, THE DESIGN IS THE DATA'S. A break that ends
// nothing may sit where it is while the parts are moved about, and is left
// out of what is written (`setMember`); a design with a problem is not
// written at all until the problem is fixed.

import {Typography} from '@mui/material';
import {useEffect, useMemo, useRef, useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';

import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import {settledParts} from '../../blockly/designParts';
import {argumentTypeOptions} from '../../blockly/domainBlocks';
import {designedName} from '../../blockly/ruleMeta';
import type {ActorData, ActorMember, ActorMemberPart} from '../actorData';

import styles from './actorEditor.module.css';
import {
  designProblems,
  memberDocument,
  without,
  setMember,
  withMemberDocument,
  withValueNames,
} from './memberEdits';
import {memberPalette, memberReading} from './memberPalette';
import {
  MemberParts,
  MoveHelp,
  useAnnouncer,
  type Arranged,
} from './MemberParts';
import {MemberPicture} from './MemberPicture';

export interface MemberPageProps {
  data: ActorData;
  member: ActorMember;
  /** The actor's file as it is, which the picture is minted from. */
  contents: string;
  modulePath: string;
  fileId: string;
  boxed: boolean;
  isReadOnly: boolean;
  /** Change the actor's data as the file now holds it. */
  onUpdate: (change: (data: ActorData) => ActorData) => void;
  /**
   * The page is left: the member as it was opened and as it is now, so its
   * uses elsewhere can follow (`renameMember`). Once, on leaving, because a
   * rename rewrites the project, and the implementation open here would be
   * loaded again under the learner on every keystroke.
   */
  onLeave: (before: ActorMember, after: ActorMember) => void;
}

/** The arranged parts with what the data has bound since: a new value's variable. */
function withBound(
  arranged: readonly Arranged[],
  parts: readonly ActorMemberPart[],
): readonly Arranged[] {
  const bound = parts.filter(part => part.kind === 'param');
  let at = 0;
  let changed = false;
  const next = arranged.map(one => {
    if (one.part.kind !== 'param') {
      return one;
    }
    const from = bound[at];
    at += 1;
    if (
      from?.kind !== 'param' ||
      !from.var ||
      (one.part.var && one.part.var !== from.var) ||
      (one.part.var === from.var && one.part.name === from.name)
    ) {
      return one;
    }
    changed = true;
    return {...one, part: {...one.part, var: from.var, name: from.name}};
  });
  return changed ? next : arranged;
}

export const MemberPage = ({
  data,
  member,
  contents,
  modulePath,
  fileId,
  boxed,
  isReadOnly,
  onUpdate,
  onLeave,
}: MemberPageProps) => {
  const opened = useRef(member);
  const latest = useRef(member);
  latest.current = member;
  const leave = useRef(onLeave);
  leave.current = onLeave;
  useEffect(
    () => () => {
      if (latest.current !== opened.current) {
        leave.current(opened.current, latest.current);
      }
    },
    [],
  );
  const keys = useRef(0);
  const mintKey = () => `part-${(keys.current += 1)}`;
  const [arranged, setArranged] = useState<readonly Arranged[]>(() =>
    member.parts.map(part => ({key: mintKey(), part})),
  );
  useEffect(() => {
    setArranged(current => withBound(current, member.parts));
  }, [member.parts]);
  const {said, say} = useAnnouncer();

  const parts = arranged.map(one => one.part);
  const problems = designProblems(parts, member, data.members ?? []);
  const name = designedName(parts);
  const reading = memberReading({...member, parts}, data.name);

  const palette = useMemo(
    () => memberPalette(modulePath, contents),
    [modulePath, contents],
  );
  const type = palette.typeOf(member);

  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  const write = (next: ActorMember) =>
    onUpdate(now => withValueNames(setMember(now, next)));

  const onArrange = (next: Arranged[], announcement: string) => {
    setArranged(next);
    say(announcement);
    const nextParts = next.map(one => one.part);
    const found = designProblems(nextParts, member, data.members ?? []);
    if (!found.design && found.values.size === 0) {
      write({...member, parts: nextParts});
    }
  };

  // Read once: the editor takes its contents when it mounts.
  const [bodyDocument] = useState(() =>
    member.kind === 'block' ? memberDocument(data, member) : '',
  );
  const bodyParts = useMemo(() => settledParts(member.parts), [member.parts]);

  return (
    <div className={styles.memberPage}>
      <Typography
        ref={heading}
        tabIndex={-1}
        variant="h4"
        component="h2"
        className={styles.memberHeading}
      >
        {member.kind === 'event' ? 'Event' : 'Block'}: {name || 'no words yet'}
      </Typography>
      <div className={styles.memberShown}>
        {type ? (
          // Drawn anew for each design: a value added leaves the block's
          // name, and so its type, as they were.
          <MemberPicture
            key={JSON.stringify(member.parts)}
            palette={palette}
            type={type}
            label={reading}
          />
        ) : (
          <Typography variant="body3" component="p" className={styles.note}>
            Nothing to draw until the design is fixed.
          </Typography>
        )}
      </div>
      <MoveHelp />
      <MemberParts
        arranged={arranged}
        mintKey={mintKey}
        onArrange={onArrange}
        problems={problems}
        name={name}
        typeOptions={argumentTypeOptions()}
        isReadOnly={isReadOnly}
      />
      <TextField
        name="member-description"
        label="What it is for"
        size="s"
        readOnly={isReadOnly}
        value={member.description ?? ''}
        className={styles.memberDescription}
        onChange={event => {
          const text = event.target.value;
          const rest = without(member, 'description');
          write(text ? {...rest, description: text} : rest);
        }}
      />
      {member.kind === 'block' && (
        <Checkbox
          name="member-shown"
          label="Shown to other files"
          size="s"
          disabled={isReadOnly}
          checked={!member.hidden}
          onChange={event => {
            const rest = without(member, 'hidden');
            write(event.target.checked ? rest : {...rest, hidden: true});
          }}
        />
      )}
      {member.kind === 'block' && (
        <section
          className={styles.memberBody}
          aria-labelledby={`${member.id}-does`}
        >
          <Typography variant="h5" component="h3" id={`${member.id}-does`}>
            What it does
          </Typography>
          <div className={styles.codeBlocks}>
            <BlocklyFileEditor
              key={member.id}
              fileId={fileId}
              language="actor"
              isReadOnly={isReadOnly}
              actorCode
              boxed={boxed}
              initialContents={bodyDocument}
              memberBody={{id: member.id, parts: bodyParts}}
              onChange={saved =>
                onUpdate(now => withMemberDocument(now, member.id, saved))
              }
            />
          </div>
        </section>
      )}
      <div className={styles.announcer} aria-live="polite" role="status">
        {said}
      </div>
    </div>
  );
};
