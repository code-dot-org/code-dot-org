// The Actor Editor's Blocks tab: the events and blocks an actor adds to the
// language, each drawn as the block it makes (specs/ACTOR_BLOCKS_PLAN.md,
// step 2), and what it does every frame (specs/DRAWING_PAGE_PLAN.md).

import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useRef} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {ActorData, ActorMember} from '../actorData';
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
  /**
   * The member whose Edit takes focus, coming back from its page or after
   * the one before it was deleted; `new-event` or `new-block` for that
   * button; `step-⟨at⟩` or `new-step` for a step's.
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
  const stepsHeading = `${modulePath}-steps-heading`;
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
      <section className={styles.memberGroup} aria-labelledby={stepsHeading}>
        <Typography variant="h5" component="h3" id={stepsHeading}>
          Every frame
        </Typography>
        {steps.length === 0 ? (
          <Typography variant="body3" component="p" className={styles.note}>
            Nothing yet. A step is work every {data.name} does once a frame, in
            the moment it names.
          </Typography>
        ) : (
          <ul className={styles.memberList}>
            {steps.map((step, at) => (
              <li key={`${at}:${step.name}`} className={styles.memberRow}>
                <Typography variant="body2" component="p">
                  {step.name}
                </Typography>
                <Typography
                  variant="body3"
                  component="p"
                  className={styles.note}
                >
                  {actorMoment(step)}
                </Typography>
                {!isReadOnly && (onEditStep || onDeleteStep) && (
                  <div className={styles.memberActions}>
                    {onEditStep && (
                      <Button
                        ref={element => {
                          if (element) {
                            edits.current.set(`step-${at}`, element);
                          } else {
                            edits.current.delete(`step-${at}`);
                          }
                        }}
                        variant="text"
                        size="small"
                        aria-label={`Edit ${step.name}`}
                        onClick={() => onEditStep(at)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDeleteStep && (
                      <Button
                        variant="text"
                        size="small"
                        aria-label={`Delete ${step.name}`}
                        onClick={() => onDeleteStep(at)}
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
        {onNewStep && !isReadOnly && (
          <Button
            ref={element => {
              if (element) {
                edits.current.set('new-step', element);
              }
            }}
            variant="text"
            size="small"
            className={styles.memberNew}
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            onClick={onNewStep}
          >
            New step
          </Button>
        )}
      </section>
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
