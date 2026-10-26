// The parts of a designed block, as chips (specs/ACTOR_BLOCKS_PLAN.md,
// step 3): a palette to take them from, a surface laid out as the block will
// be, and the chosen chip's details.
//
// MOVING IS BY PLACE, NOT BY GEOMETRY. The surface wraps, so "the chip to the
// left" is sometimes the end of the line above; the keys move a chip one
// place earlier or later in the list, which is what the block reads as.
// Dragging with a pointer is dnd-kit's, and is never the only way.

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Button, IconButton, Typography} from '@mui/material';
import {useLayoutEffect, useRef, useState, type KeyboardEvent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import {endsNothing} from '../../blockly/designParts';
import type {ActorMemberPart} from '../actorData';

import {
  insertAt,
  linesOf,
  moveTo,
  newPart,
  partKindLabel,
  VALUE_TYPES,
  without,
  type DesignProblems,
} from './memberEdits';
import styles from './memberParts.module.css';

/** A part as it is arranged, with a key that outlives its place. */
export interface Arranged {
  key: string;
  part: ActorMemberPart;
}

/** Where focus goes once a change has drawn. */
export type FocusTarget = {key: string; on: 'field' | 'grip'} | {on: 'palette'};

export interface MemberPartsProps {
  arranged: readonly Arranged[];
  /** A new key, for a chip just made. */
  mintKey: () => string;
  /** The arrangement changed: what to say aloud, and where focus goes. */
  onArrange: (next: Arranged[], said: string, focus?: FocusTarget) => void;
  problems: DesignProblems;
  /** The design's name, which the list is named for. */
  name: string;
  /** The types a value may be: the designer's, enums included. */
  typeOptions: ReadonlyArray<[string, string]>;
  isReadOnly: boolean;
}

const PALETTE: ReadonlyArray<{what: string; label: string}> = [
  {what: 'label', label: 'Word'},
  ...VALUE_TYPES.map(one => ({what: one.type, label: one.label})),
  {what: 'row', label: 'Line break'},
];

/** The starting value a value of this type may say, if any. */
const DEFAULT_KIND: Readonly<Record<string, 'number' | 'text' | 'boolean'>> = {
  number: 'number',
  string: 'text',
  boolean: 'boolean',
};

const SURFACE = 'surface';
const PALETTE_PREFIX = 'palette:';

export const MemberParts = ({
  arranged,
  mintKey,
  onArrange,
  problems,
  name,
  typeOptions,
  isReadOnly,
}: MemberPartsProps) => {
  const parts = arranged.map(one => one.part);
  const lines = linesOf(parts);
  const [chosen, setChosen] = useState<string | null>(null);
  /** The chip being moved from the keys, and the arrangement before it was lifted. */
  const [lifted, setLifted] = useState<{
    key: string;
    before: Arranged[];
  } | null>(null);
  const [focus, setFocus] = useState<FocusTarget | null>(null);
  const fields = useRef(new Map<string, HTMLInputElement>());
  const grips = useRef(new Map<string, HTMLButtonElement>());
  const palette = useRef<HTMLDivElement>(null);
  const [paletteAt, setPaletteAt] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 4}}),
  );

  // Focus where the last change said, once it has drawn.
  useLayoutEffect(() => {
    if (!focus) {
      return;
    }
    if (focus.on === 'palette') {
      palette.current
        ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
        ?.focus();
    } else {
      (focus.on === 'field'
        ? (fields.current.get(focus.key) ?? grips.current.get(focus.key))
        : grips.current.get(focus.key)
      )?.focus();
    }
    setFocus(null);
  }, [focus, arranged]);

  const describe = (key: string, list: readonly Arranged[] = arranged) => {
    const at = list.findIndex(one => one.key === key);
    const part = list[at].part;
    const own =
      part.kind === 'label'
        ? part.text.trim() || 'empty word'
        : part.kind === 'row'
          ? 'line break'
          : String(part.name ?? partKindLabel(part));
    return {
      own,
      place: `part ${at + 1} of ${list.length}, line ${
        linesOf(list.map(one => one.part))[at]
      }`,
    };
  };

  const arrange = (next: Arranged[], said: string, target?: FocusTarget) => {
    onArrange(next, said);
    if (target) {
      setFocus(target);
    }
  };

  const add = (what: string, at = insertionPoint()) => {
    if (isReadOnly) {
      return;
    }
    const made = {key: mintKey(), part: newPart(what, parts)};
    const next = insertAt(arranged, at, made);
    const label = PALETTE.find(one => one.what === what)?.label ?? 'Part';
    arrange(next, `${label} added, ${describe(made.key, next).place}.`, {
      key: made.key,
      on: what === 'row' ? 'grip' : 'field',
    });
    if (what !== 'label' && what !== 'row') {
      setChosen(made.key);
    }
  };

  /** After the chip with focus, else at the end. */
  const insertionPoint = (): number => {
    const active = document.activeElement;
    const at = arranged.findIndex(
      one =>
        grips.current.get(one.key) === active ||
        fields.current.get(one.key) === active,
    );
    return at < 0 ? arranged.length : at + 1;
  };

  const remove = (key: string) => {
    const at = arranged.findIndex(one => one.key === key);
    const {own} = describe(key);
    const next = arranged.filter(one => one.key !== key);
    const neighbour = next[at] ?? next[at - 1];
    if (chosen === key) {
      setChosen(null);
    }
    arrange(
      next,
      `${own} removed.`,
      neighbour ? {key: neighbour.key, on: 'grip'} : {on: 'palette'},
    );
  };

  const moveBy = (key: string, by: number) => {
    const from = arranged.findIndex(one => one.key === key);
    const to = from + by;
    if (to < 0 || to >= arranged.length) {
      return;
    }
    const next = moveTo(arranged, from, to);
    const {own, place} = describe(key, next);
    arrange(next, `${own} moved to ${place}.`, {key, on: 'grip'});
  };

  const onGripKey = (event: KeyboardEvent, key: string) => {
    if (isReadOnly) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      const {own, place} = describe(key);
      if (lifted?.key === key) {
        setLifted(null);
        onArrange([...arranged], `${own} dropped, ${place}.`);
      } else {
        setLifted({key, before: [...arranged]});
        onArrange(
          [...arranged],
          `${own} picked up, ${place}. The arrow keys move it, Space drops ` +
            'it, and Escape puts it back.',
        );
      }
      return;
    }
    if (lifted?.key === key) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveBy(key, -1);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        moveBy(key, 1);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        const before = lifted.before;
        setLifted(null);
        arrange(
          before,
          `${describe(key, before).own} put back, ${
            describe(key, before).place
          }.`,
          {key, on: 'grip'},
        );
      }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      remove(key);
    }
  };

  const onDragEnd = ({active, over}: DragEndEvent) => {
    if (!over || isReadOnly) {
      return;
    }
    const activeId = String(active.id);
    const overAt = arranged.findIndex(one => one.key === over.id);
    if (activeId.startsWith(PALETTE_PREFIX)) {
      add(
        activeId.slice(PALETTE_PREFIX.length),
        overAt < 0 ? arranged.length : overAt,
      );
      return;
    }
    const from = arranged.findIndex(one => one.key === activeId);
    const to = overAt < 0 ? arranged.length - 1 : overAt;
    if (from < 0 || from === to) {
      return;
    }
    const next = moveTo(arranged, from, to);
    const {own, place} = describe(activeId, next);
    arrange(next, `${own} moved to ${place}.`);
  };

  const onPaletteKey = (event: KeyboardEvent) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    const to =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? PALETTE.length - 1
          : step
            ? (paletteAt + step + PALETTE.length) % PALETTE.length
            : -1;
    if (to < 0) {
      return;
    }
    event.preventDefault();
    setPaletteAt(to);
    palette.current?.querySelectorAll<HTMLButtonElement>('button')[to]?.focus();
  };

  const chosenAt = arranged.findIndex(one => one.key === chosen);
  const chosenPart = chosenAt < 0 ? undefined : arranged[chosenAt].part;

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      accessibility={{
        // The keys are ours (`onGripKey`), and say their own; a pointer drag
        // says where it landed through `onArrange`.
        announcements: {
          onDragStart: () => undefined,
          onDragOver: () => undefined,
          onDragEnd: () => undefined,
          onDragCancel: () => undefined,
        },
        screenReaderInstructions: {draggable: ''},
      }}
    >
      <div className={styles.parts}>
        <div
          ref={palette}
          role="toolbar"
          aria-label="Parts to add"
          className={styles.palette}
          onKeyDown={onPaletteKey}
        >
          {PALETTE.map((one, at) => (
            <PaletteChip
              key={one.what}
              what={one.what}
              label={one.label}
              tabIndex={at === paletteAt ? 0 : -1}
              disabled={isReadOnly}
              onAdd={() => {
                setPaletteAt(at);
                add(one.what);
              }}
            />
          ))}
        </div>
        <Surface name={name}>
          <SortableContext
            items={arranged.map(one => one.key)}
            strategy={rectSortingStrategy}
          >
            {arranged.map(({key, part}, at) => (
              <PartChip
                key={key}
                id={key}
                part={part}
                line={lines[at]}
                at={at}
                count={arranged.length}
                idle={endsNothing(parts, at)}
                lifted={lifted?.key === key}
                chosen={chosen === key}
                problem={problems.values.get(at)}
                isReadOnly={isReadOnly}
                lineEnds={part.kind === 'row'}
                fieldRef={element => {
                  if (element) {
                    fields.current.set(key, element);
                  } else {
                    fields.current.delete(key);
                  }
                }}
                gripRef={element => {
                  if (element) {
                    grips.current.set(key, element);
                  } else {
                    grips.current.delete(key);
                  }
                }}
                onChoose={() => setChosen(key)}
                onGripKey={event => onGripKey(event, key)}
                onText={text =>
                  onArrange(
                    arranged.map(one =>
                      one.key === key
                        ? {
                            key,
                            part: {
                              ...part,
                              ...(part.kind === 'label'
                                ? {text}
                                : {name: text}),
                            } as ActorMemberPart,
                          }
                        : one,
                    ),
                    '',
                  )
                }
              />
            ))}
          </SortableContext>
        </Surface>
        {problems.design && (
          <Typography
            variant="body3"
            component="p"
            role="alert"
            className={styles.problem}
          >
            {problems.design}
          </Typography>
        )}
        {chosenPart?.kind === 'param' && (
          <ValueDetails
            part={chosenPart}
            typeOptions={typeOptions}
            isReadOnly={isReadOnly}
            onChange={next =>
              onArrange(
                arranged.map(one =>
                  one.key === chosen ? {...one, part: next} : one,
                ),
                '',
              )
            }
            onRemove={() => remove(chosen!)}
          />
        )}
      </div>
    </DndContext>
  );
};

/** The list the chips are laid out in, and where a palette chip may land. */
const Surface = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => {
  const {setNodeRef, isOver} = useDroppable({id: SURFACE});
  return (
    <ol
      ref={setNodeRef}
      aria-label={`Parts of ${name || 'this design'}`}
      className={`${styles.surface} ${isOver ? styles.surfaceOver : ''}`}
    >
      {children}
    </ol>
  );
};

const PaletteChip = ({
  what,
  label,
  tabIndex,
  disabled,
  onAdd,
}: {
  what: string;
  label: string;
  tabIndex: number;
  disabled: boolean;
  onAdd: () => void;
}) => {
  const {attributes, listeners, setNodeRef} = useDraggable({
    id: `${PALETTE_PREFIX}${what}`,
    disabled,
  });
  const names: Record<string, string> = {
    label: 'Add a word',
    row: 'Add a line break',
  };
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      tabIndex={tabIndex}
      aria-disabled={attributes['aria-disabled']}
      disabled={disabled}
      aria-label={names[what] ?? `Add a ${label.toLowerCase()} value`}
      className={`${styles.chip} ${styles[`chip-${kindOf(what)}`]}`}
      onClick={onAdd}
    >
      {what === 'row' ? (
        <FontAwesomeV6Icon iconName="turn-down-left" iconStyle="solid" />
      ) : (
        label
      )}
    </button>
  );
};

const kindOf = (what: string): string =>
  what === 'label' || what === 'row' ? what : 'value';

interface PartChipProps {
  id: string;
  part: ActorMemberPart;
  at: number;
  count: number;
  line: number;
  /** A break that ends nothing where it is. */
  idle: boolean;
  lifted: boolean;
  chosen: boolean;
  problem?: string;
  isReadOnly: boolean;
  /** A break: what follows starts the next line. */
  lineEnds: boolean;
  fieldRef: (element: HTMLInputElement | null) => void;
  gripRef: (element: HTMLButtonElement | null) => void;
  onChoose: () => void;
  onGripKey: (event: KeyboardEvent) => void;
  onText: (text: string) => void;
}

const PartChip = ({
  id,
  part,
  at,
  count,
  line,
  idle,
  lifted,
  chosen,
  problem,
  isReadOnly,
  lineEnds,
  fieldRef,
  gripRef,
  onChoose,
  onGripKey,
  onText,
}: PartChipProps) => {
  const {
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id, disabled: isReadOnly});
  const own =
    part.kind === 'label'
      ? part.text.trim() || 'empty word'
      : part.kind === 'row'
        ? 'Line break'
        : String(part.name ?? '');
  const kind =
    part.kind === 'param'
      ? `, ${partKindLabel(part)}`
      : part.kind === 'label'
        ? ', word'
        : '';
  const gripName =
    `${own}${kind}, part ${at + 1} of ${count}, line ${line}` +
    (idle ? ', does nothing here' : '');
  const fieldName =
    part.kind === 'label'
      ? `Word, part ${at + 1}`
      : `Name of ${partKindLabel(part)}, part ${at + 1}`;
  const typeLabel =
    part.kind === 'param'
      ? (VALUE_TYPES.find(one => one.type === part.type)?.label ?? 'Choice')
      : '';
  return (
    <>
      <li
        ref={setNodeRef}
        className={[
          styles.chip,
          styles[`chip-${part.kind === 'param' ? 'value' : part.kind}`],
          idle ? styles.idle : '',
          lifted ? styles.lifted : '',
          chosen ? styles.chosen : '',
          isDragging ? styles.dragging : '',
        ].join(' ')}
        style={{transform: CSS.Translate.toString(transform), transition}}
      >
        <IconButton
          ref={element => {
            setActivatorNodeRef(element);
            gripRef(element);
          }}
          size="small"
          className={styles.grip}
          aria-label={gripName}
          aria-pressed={lifted}
          aria-describedby={MOVE_HELP}
          disabled={isReadOnly}
          {...listeners}
          onKeyDown={onGripKey}
          onClick={onChoose}
          onFocus={onChoose}
        >
          <FontAwesomeV6Icon
            iconName={part.kind === 'row' ? 'turn-down-left' : 'grip-vertical'}
            iconStyle="solid"
          />
        </IconButton>
        {part.kind !== 'row' && (
          <TextField
            ref={fieldRef}
            name={`${id}-text`}
            size="s"
            aria-label={fieldName}
            value={part.kind === 'label' ? part.text : String(part.name ?? '')}
            readOnly={isReadOnly}
            errorMessage={problem}
            className={styles.chipField}
            onFocus={onChoose}
            onChange={event => onText(event.target.value)}
          />
        )}
        {part.kind === 'param' && (
          <span className={styles.chipType}>
            <FontAwesomeV6Icon
              iconName={TYPE_ICONS[part.type] ?? 'list-ul'}
              iconStyle="solid"
            />
            {typeLabel}
          </span>
        )}
      </li>
      {lineEnds && <li aria-hidden="true" className={styles.lineEnd} />}
    </>
  );
};

const TYPE_ICONS: Readonly<Record<string, string>> = {
  number: 'hashtag',
  string: 'font',
  boolean: 'toggle-on',
  vector: 'up-down-left-right',
  actor: 'user',
  list: 'list',
  kind: 'shapes',
  map: 'map',
};

/** The instruction every grip points at. */
export const MOVE_HELP = 'member-parts-move-help';

const ValueDetails = ({
  part,
  typeOptions,
  isReadOnly,
  onChange,
  onRemove,
}: {
  part: Extract<ActorMemberPart, {kind: 'param'}>;
  typeOptions: ReadonlyArray<[string, string]>;
  isReadOnly: boolean;
  onChange: (part: ActorMemberPart) => void;
  onRemove: () => void;
}) => {
  const starts = DEFAULT_KIND[part.type];
  const fallback = part.default;
  return (
    <section
      className={styles.details}
      aria-label={`Value ${String(part.name ?? '')}`}
    >
      <SimpleDropdown
        name="member-value-type"
        labelText="Type"
        size="s"
        disabled={isReadOnly}
        selectedValue={part.type}
        items={typeOptions.map(([text, value]) => ({text, value}))}
        onChange={event => {
          // A new type starts with no starting value: the old one may not be
          // one of these.
          const rest = without(part, 'default');
          onChange({...rest, type: event.target.value} as ActorMemberPart);
        }}
      />
      {starts === 'boolean' ? (
        <Checkbox
          name="member-value-default"
          label="Starts true"
          size="s"
          disabled={isReadOnly}
          checked={fallback === true || fallback === 'TRUE'}
          onChange={event => onChange({...part, default: event.target.checked})}
        />
      ) : starts ? (
        <TextField
          name="member-value-default"
          label="Starts as"
          size="s"
          inputType={starts === 'number' ? 'number' : 'text'}
          readOnly={isReadOnly}
          value={fallback === undefined ? '' : String(fallback)}
          onChange={event => {
            const text = event.target.value;
            const rest = without(part, 'default');
            onChange(
              text === ''
                ? (rest as ActorMemberPart)
                : {
                    ...part,
                    default: starts === 'number' ? Number(text) : text,
                  },
            );
          }}
        />
      ) : null}
      {!isReadOnly && (
        <Button variant="text" size="small" onClick={onRemove}>
          Remove {String(part.name ?? 'this value')}
        </Button>
      )}
    </section>
  );
};

/** The sentence every grip is described by: how to move a chip. */
export const MoveHelp = () => (
  <span id={MOVE_HELP} hidden>
    Space picks it up and the arrow keys move it; Delete removes it.
  </span>
);

export const useAnnouncer = () => {
  const [said, setSaid] = useState('');
  // Cleared first, so saying the same thing twice is heard twice. Nothing to
  // say leaves what was said: typing in a chip says nothing.
  const say = (what: string) => {
    if (!what) {
      return;
    }
    setSaid('');
    requestAnimationFrame(() => setSaid(what));
  };
  return {said, say};
};
