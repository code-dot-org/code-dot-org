// One of an actor's events or blocks, designed (specs/ACTOR_BLOCKS_PLAN.md,
// steps 3 and 6): a step on the trail, "Hero › push".
//
// A BLOCK'S PAGE IS WHAT IT DOES: a workspace, as any code is written, with
// the block itself at its head (`memberHead`) and its implementation below.
// Its design — the parts as chips, what it is for, whether other files see
// it — opens above that, from "Edit design" in the breadcrumb bar, and the
// head just below redraws as the chips are moved. An event does nothing of its own, so
// its page is its design.
//
// THE ARRANGEMENT IS THE PAGE'S, THE DESIGN IS THE DATA'S. A break that ends
// nothing may sit where it is while the parts are moved about, and is left
// out of what is written (`setMember`); a design with a problem is not
// written at all until the problem is fixed.

import {Button, IconButton, Typography} from '@mui/material';
import {useEffect, useMemo, useRef, useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import {settledParts} from '../../blockly/designParts';
import {argumentTypeOptions} from '../../blockly/domainBlocks';
import {designedName} from '../../blockly/ruleMeta';
import {TrailActions} from '../../layout/TrailContext';
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
import {
  memberPalette,
  memberReading,
  type MemberPalette,
} from './memberPalette';
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
  /** Just made: its design is open, since that is what there is to do. */
  isNew: boolean;
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
  /**
   * The blocks the member's picture is drawn from; an actor's own by
   * default. A rule's page hands its own (`rules/ruleMembers`).
   */
  palette?: MemberPalette;
  /** The kind of file its implementation is written in, for its drawers. */
  language?: 'actor' | 'rule';
  /**
   * What a block may report, offered in its design; absent, it does
   * something and reports nothing, as an actor's blocks do.
   */
  reports?: readonly string[];
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
  isNew,
  isReadOnly,
  onUpdate,
  onLeave,
  palette: given,
  language = 'actor',
  reports,
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

  const own = useMemo(
    () => (given ? undefined : memberPalette(modulePath, contents)),
    [given, modulePath, contents],
  );
  const palette = given ?? own!;
  const type = palette.typeOf(member);

  const isBlock = member.kind === 'block';
  const heading = useRef<HTMLHeadingElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  // A new block opens on its design, and so does one whose design is wrong;
  // any other opens on what it does. An event is only its design.
  const [designOpen, setDesignOpen] = useState(
    () =>
      !isBlock || isNew || Boolean(problems.design) || problems.values.size > 0,
  );
  // Opening, the design's heading has focus, or the toggle when it is shut;
  // shut, focus goes back to the toggle.
  const focusDesign = useRef(designOpen);
  useEffect(() => {
    (focusDesign.current ? heading : toggle).current?.focus();
  }, [designOpen]);
  const showDesign = (open: boolean) => {
    focusDesign.current = open;
    setDesignOpen(open);
  };

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
    isBlock ? memberDocument(data, member) : '',
  );
  const headParts = useMemo(() => settledParts(member.parts), [member.parts]);

  const picture = type ? (
    // Drawn anew for each design: a value added leaves the block's name, and
    // so its type, as they were.
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
  );

  const chips = (
    <>
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
    </>
  );
  const purpose = (
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
  );

  const title = `${isBlock ? 'Block' : 'Event'}: ${name || 'no words yet'}`;

  if (!isBlock) {
    return (
      <div className={styles.memberPage}>
        <Typography
          ref={heading}
          tabIndex={-1}
          variant="h4"
          component="h2"
          className={styles.memberHeading}
        >
          {title}
        </Typography>
        <div className={styles.memberShown}>{picture}</div>
        {chips}
        {purpose}
        <div className={styles.announcer} aria-live="polite" role="status">
          {said}
        </div>
      </div>
    );
  }

  const designId = `${member.id}-design`;
  return (
    <div className={styles.memberSplit}>
      <TrailActions
        fallback={button => <div className={styles.codeHeader}>{button}</div>}
      >
        <Button
          ref={toggle}
          variant="text"
          size="extraSmall"
          startIcon={
            <FontAwesomeV6Icon iconName="pen-ruler" iconStyle="solid" />
          }
          aria-expanded={designOpen}
          aria-controls={designId}
          onClick={() => showDesign(!designOpen)}
        >
          Edit design
        </Button>
      </TrailActions>
      {/* Above what it does, and before it in the tab order: the head the
          chips arrange is just below them. */}
      <section
        id={designId}
        hidden={!designOpen}
        aria-labelledby={`${designId}-heading`}
        className={styles.memberDesign}
      >
        <div className={styles.memberDesignHeader}>
          <Typography
            ref={heading}
            id={`${designId}-heading`}
            tabIndex={-1}
            variant="h5"
            component="h2"
            className={styles.memberHeading}
          >
            Design
          </Typography>
          <IconButton
            size="small"
            aria-label="Close design"
            onClick={() => showDesign(false)}
          >
            <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
          </IconButton>
        </div>
        <div className={styles.memberDesignBody}>
          <div className={styles.memberDesignParts}>{chips}</div>
          <div className={styles.memberDesignSettings}>
            {purpose}
            {reports && (
              <SimpleDropdown
                name="member-reports"
                labelText="Reports"
                size="s"
                disabled={isReadOnly}
                selectedValue={member.returns ?? ''}
                items={[
                  {value: '', text: 'nothing: it does something'},
                  ...reports.map(type => ({value: type, text: `a ${type}`})),
                ]}
                onChange={event => {
                  const rest = without(member, 'returns');
                  write(
                    event.target.value
                      ? {...rest, returns: event.target.value}
                      : rest,
                  );
                }}
              />
            )}
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
          </div>
        </div>
      </section>
      <div className={styles.memberCode}>
        <Typography component="h2" className={styles.announcer}>
          {title}
        </Typography>
        <BlocklyFileEditor
          key={member.id}
          fileId={fileId}
          language={language}
          isReadOnly={isReadOnly}
          initialContents={bodyDocument}
          memberHead={{parts: headParts}}
          onChange={saved =>
            onUpdate(now => withMemberDocument(now, member.id, saved))
          }
        />
      </div>
      <div className={styles.announcer} aria-live="polite" role="status">
        {said}
      </div>
    </div>
  );
};
