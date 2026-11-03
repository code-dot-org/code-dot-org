// The Actor Editor's Blocks tab: the events and blocks an actor adds to the
// language, each drawn as the block it makes (specs/ACTOR_BLOCKS_PLAN.md,
// step 2), what it does every frame (specs/DRAWING_PAGE_PLAN.md), and the
// movements it can be given (specs/TWEENS_AS_DATA_PLAN.md).

import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useRef} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {ActorData, ActorMember, ActorTween} from '../actorData';
import {actorMoment} from '../actorSteps';

import styles from './actorEditor.module.css';
import {
  memberPalette,
  memberReading,
  type MemberPalette,
} from './memberPalette';
import {MemberPicture} from './MemberPicture';

export interface MembersTabProps {
  data: ActorData;
  /** The actor's file as it is, which the palette is minted from. */
  contents: string;
  modulePath: string;
  isReadOnly: boolean;
  onEdit?: (member: ActorMember) => void;
  onDelete?: (member: ActorMember) => void;
  onNew?: (kind: ActorMember['kind']) => void;
  onEditStep?: (at: number) => void;
  onDeleteStep?: (at: number) => void;
  onNewStep?: () => void;
  onEditTween?: (id: string) => void;
  onDeleteTween?: (id: string) => void;
  onNewTween?: () => void;
  /**
   * The member whose Edit takes focus, coming back from its page or after
   * the one before it was deleted; `new-event` or `new-block` for that
   * button; `step-⟨at⟩` or `new-step` for a step's, `tween-⟨id⟩` or
   * `new-tween` for a tween's.
   */
  focusEdit?: string | null;
  onFocused?: () => void;
}

const GROUPS: ReadonlyArray<{
  kind: ActorMember['kind'];
  heading: string;
  empty: (name: string) => string;
  add: string;
}> = [
  {
    kind: 'event',
    heading: 'Events',
    empty: name =>
      `No events yet. An event is something that happens to a ${name}, ` +
      'which any file can hear and handle.',
    add: 'New event',
  },
  {
    kind: 'block',
    heading: 'Blocks',
    empty: name =>
      `No blocks yet. A block is something a ${name} does, written once ` +
      'and used anywhere.',
    add: 'New block',
  },
];

export const MembersTab = ({
  data,
  contents,
  modulePath,
  isReadOnly,
  onEdit,
  onDelete,
  onNew,
  onEditStep,
  onDeleteStep,
  onNewStep,
  onEditTween,
  onDeleteTween,
  onNewTween,
  focusEdit,
  onFocused,
}: MembersTabProps) => {
  const edits = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    const button = focusEdit ? edits.current.get(focusEdit) : undefined;
    if (button) {
      button.focus();
      onFocused?.();
    }
  }, [focusEdit, onFocused]);
  const members = data.members ?? [];
  const steps = data.steps ?? [];
  const tweens = data.tweens ?? [];
  // By the file's text: the data is parsed afresh on every render, and
  // minting a palette is not cheap.
  const palette = useMemo(
    () => memberPalette(modulePath, contents),
    [modulePath, contents],
  );
  return (
    <div className={styles.members}>
      {GROUPS.map(group => {
        const mine = members.filter(member => member.kind === group.kind);
        const headingId = `${modulePath}-${group.kind}-heading`;
        return (
          <section
            key={group.kind}
            className={styles.memberGroup}
            aria-labelledby={headingId}
          >
            <Typography variant="h5" component="h3" id={headingId}>
              {group.heading}
            </Typography>
            {mine.length === 0 ? (
              <Typography variant="body3" component="p" className={styles.note}>
                {group.empty(data.name)}
              </Typography>
            ) : (
              <ul className={styles.memberList}>
                {mine.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    actorName={data.name}
                    palette={palette}
                    isReadOnly={isReadOnly}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    editRef={element => {
                      if (element) {
                        edits.current.set(member.id, element);
                      } else {
                        edits.current.delete(member.id);
                      }
                    }}
                  />
                ))}
              </ul>
            )}
            {onNew && !isReadOnly && (
              <Button
                ref={element => {
                  if (element) {
                    edits.current.set(`new-${group.kind}`, element);
                  }
                }}
                variant="text"
                size="small"
                className={styles.memberNew}
                startIcon={
                  <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
                }
                onClick={() => onNew(group.kind)}
              >
                {group.add}
              </Button>
            )}
          </section>
        );
      })}
      <NamedList
        heading="Every frame"
        headingId={`${modulePath}-steps-heading`}
        empty={`Nothing yet. A step is work every ${data.name} does once a frame, in the moment it names.`}
        rows={steps.map((step, at) => ({
          key: `${at}:${step.name}`,
          name: step.name,
          detail: actorMoment(step),
          focus: `step-${at}`,
          edit: onEditStep && (() => onEditStep(at)),
          remove: onDeleteStep && (() => onDeleteStep(at)),
        }))}
        add={
          onNewStep && {label: 'New step', focus: 'new-step', act: onNewStep}
        }
        isReadOnly={isReadOnly}
        refs={edits.current}
      />
      <NamedList
        heading="Tweens"
        headingId={`${modulePath}-tweens-heading`}
        empty={`No tweens yet. A tween is a movement over time — a fade, a slide — that code anywhere can play on a ${data.name}, or on anything else.`}
        rows={tweens.map(tween => ({
          key: tween.id,
          name: tween.name,
          detail: `over ${secondsOf(tween)}`,
          focus: `tween-${tween.id}`,
          edit: onEditTween && (() => onEditTween(tween.id)),
          remove: onDeleteTween && (() => onDeleteTween(tween.id)),
        }))}
        add={
          onNewTween && {
            label: 'New tween',
            focus: 'new-tween',
            act: onNewTween,
          }
        }
        isReadOnly={isReadOnly}
        refs={edits.current}
      />
    </div>
  );
};

interface MemberRowProps {
  member: ActorMember;
  actorName: string;
  palette: MemberPalette;
  isReadOnly: boolean;
  onEdit?: (member: ActorMember) => void;
  onDelete?: (member: ActorMember) => void;
  editRef: (element: HTMLButtonElement | null) => void;
}

const MemberRow = ({
  member,
  actorName,
  palette,
  isReadOnly,
  onEdit,
  onDelete,
  editRef,
}: MemberRowProps) => {
  const reading = memberReading(member, actorName);
  const type = palette.typeOf(member);
  return (
    <li className={styles.memberRow}>
      {type ? (
        <MemberPicture
          key={JSON.stringify(member.parts)}
          palette={palette}
          type={type}
          label={reading}
        />
      ) : (
        <Typography variant="body3" component="p" className={styles.note}>
          {reading
            ? `${reading}: reads the same as another, so it makes no block.`
            : 'A design with no words in it makes no block.'}
        </Typography>
      )}
      {member.description && (
        <Typography variant="body3" component="p">
          {member.description}
        </Typography>
      )}
      {!isReadOnly && (onEdit || onDelete) && (
        <div className={styles.memberActions}>
          {onEdit && (
            <Button
              ref={editRef}
              variant="text"
              size="small"
              aria-label={`Edit ${reading}`}
              onClick={() => onEdit(member)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="text"
              size="small"
              aria-label={`Delete ${reading}`}
              onClick={() => onDelete(member)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </li>
  );
};

/** How long a tween takes, as its socket holds a number; "a while" otherwise. */
function secondsOf(tween: ActorTween): string {
  const held = (tween.seconds.block ?? tween.seconds.shadow) as
    | {type?: string; fields?: {NUM?: unknown}}
    | undefined;
  const n = held?.type === 'math_number' ? Number(held.fields?.NUM) : NaN;
  return Number.isFinite(n)
    ? `${n} ${n === 1 ? 'second' : 'seconds'}`
    : 'a time it works out';
}

interface NamedRow {
  key: string;
  name: string;
  detail: string;
  /** The key its Edit is focused by (`focusEdit`). */
  focus: string;
  edit?: () => void;
  remove?: () => void;
}

/** A heading and the named things under it — steps, tweens — each opened by Edit. */
const NamedList = ({
  heading,
  headingId,
  empty,
  rows,
  add,
  isReadOnly,
  refs,
}: {
  heading: string;
  headingId: string;
  empty: string;
  rows: readonly NamedRow[];
  add?: {label: string; focus: string; act: () => void};
  isReadOnly: boolean;
  refs: Map<string, HTMLButtonElement>;
}) => (
  <section className={styles.memberGroup} aria-labelledby={headingId}>
    <Typography variant="h5" component="h3" id={headingId}>
      {heading}
    </Typography>
    {rows.length === 0 ? (
      <Typography variant="body3" component="p" className={styles.note}>
        {empty}
      </Typography>
    ) : (
      <ul className={styles.memberList}>
        {rows.map(row => (
          <li key={row.key} className={styles.memberRow}>
            <Typography variant="body2" component="p">
              {row.name}
            </Typography>
            <Typography variant="body3" component="p" className={styles.note}>
              {row.detail}
            </Typography>
            {!isReadOnly && (row.edit || row.remove) && (
              <div className={styles.memberActions}>
                {row.edit && (
                  <Button
                    ref={element => {
                      if (element) {
                        refs.set(row.focus, element);
                      } else {
                        refs.delete(row.focus);
                      }
                    }}
                    variant="text"
                    size="small"
                    aria-label={`Edit ${row.name}`}
                    onClick={row.edit}
                  >
                    Edit
                  </Button>
                )}
                {row.remove && (
                  <Button
                    variant="text"
                    size="small"
                    aria-label={`Delete ${row.name}`}
                    onClick={row.remove}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
    {add && !isReadOnly && (
      <Button
        ref={element => {
          if (element) {
            refs.set(add.focus, element);
          }
        }}
        variant="text"
        size="small"
        className={styles.memberNew}
        startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
        onClick={add.act}
      >
        {add.label}
      </Button>
    )}
  </section>
);
