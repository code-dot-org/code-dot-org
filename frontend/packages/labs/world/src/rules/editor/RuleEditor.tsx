// The Rule Editor: a rule as data (specs/RULE_EDITOR_PLAN.md, step 2).
//
// The side panel holds what has a value: the rule's own properties, then
// each trait's, under the trait's name, which opens the trait. The main area
// says what the rule declares — what it is for, the rules it uses, its
// events, blocks and steps — or, with a trait open, what the trait declares.
// Each event, block and step opens on a page of its own, where what it does
// is written: a rule is never a workspace of blocks to edit as a whole. A
// file the data cannot say whole says so, as an actor's does.

import {Button, Typography} from '@mui/material';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

import {BlocklyMarkdown} from '@code-dot-org/blockly';
import {usePrompts, type CustomEditorProps} from '@code-dot-org/codebridge';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import type {ActorMember} from '../../actors/actorData';
import {
  addMember,
  newMember,
  removeMember,
} from '../../actors/editor/memberEdits';
import {MemberPage} from '../../actors/editor/MemberPage';
import {BUILTIN_RULE_META} from '../../blockly/builtinMeta';
import {parseRuleMeta, type RuleMeta} from '../../blockly/ruleMeta';
import {requestFileAct} from '../../files/fileActs';
import {fileLabel} from '../../files/fileLabel';
import {useScriptStep} from '../../layout/TrailContext';
import {filePath, projectFiles} from '../../runtime/projectFiles';
import {type RuleData, type RuleStep, type RuleTrait} from '../ruleData';
import {
  addProperty,
  addTrait,
  addUse,
  deleteTrait,
  PROPERTY_TYPES,
  removeUse,
  renameTrait,
  ruleDataOf,
  setAbility,
  setDescription,
  setTraitDescription,
  setTraitSubject,
  traitProblem,
  traitUses,
  type Owner,
} from '../ruleEdits';
import {
  asMemberHost,
  fromMemberHost,
  memberOf,
  renameRuleMember,
  RULE_REPORTS,
  ruleMemberUses,
  rulePalette,
} from '../ruleMembers';
import {resolveRuleContents} from '../ruleReference';
import {
  addStep,
  removeStep,
  renameStep,
  stepAtOf,
  stepId,
  stepOf,
  stepsOf,
  type StepAt,
} from '../ruleSteps';

import styles from './ruleEditor.module.css';
import {RulePropertyRow} from './RulePropertyRow';
import {StepPage} from './StepPage';

/** A member as it reads: its words, its values in angle brackets. */
const reading = (member: ActorMember): string =>
  member.parts
    .map(part =>
      part.kind === 'label'
        ? part.text.trim()
        : part.kind === 'param'
          ? `⟨${part.name ?? part.type}⟩`
          : '',
    )
    .filter(Boolean)
    .join(' ');

/** The project's rules as the compiler reads them, built-in ones first. */
function projectRules(source: MultiFileSource): RuleMeta[] {
  const project = Object.entries(projectFiles(source))
    .filter(([path]) => path.endsWith('.rule'))
    .flatMap(([path, contents]) => {
      const meta = parseRuleMeta(path.replace(/\.rule$/, ''), contents);
      return meta ? [meta] : [];
    });
  return [...BUILTIN_RULE_META, ...project];
}

/** Where focus goes in a members list: an Edit by member id, or a New. */
type MemberFocus = Map<string, HTMLButtonElement>;

/** One kind of member, each with Edit and Delete, and a way to make one. */
const MemberList = ({
  kind,
  owner,
  members,
  isReadOnly,
  buttons,
  onEdit,
  onDelete,
  onNew,
}: {
  kind: 'event' | 'block';
  owner: Owner;
  members: readonly ActorMember[];
  isReadOnly: boolean;
  buttons: MemberFocus;
  onEdit: (member: ActorMember) => void;
  onDelete: (member: ActorMember) => void;
  onNew: () => void;
}) => {
  const title = kind === 'event' ? 'Events' : 'Blocks';
  const keep = (key: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      buttons.set(key, element);
    } else {
      buttons.delete(key);
    }
  };
  return (
    <section aria-label={title}>
      <Typography variant="h5" component="h3">
        {title}
      </Typography>
      {members.length ? (
        <ul className={styles.list}>
          {members.map(member => {
            const said = memberSays(member);
            return (
              <li key={member.id} className={styles.item}>
                <Typography variant="body3" component="span">
                  {said}
                </Typography>
                <div className={styles.acts}>
                  <Button
                    ref={keep(member.id)}
                    variant="text"
                    size="extraSmall"
                    aria-label={`Edit ${said}`}
                    onClick={() => onEdit(member)}
                  >
                    Edit
                  </Button>
                  {!isReadOnly && (
                    <Button
                      variant="text"
                      size="extraSmall"
                      aria-label={`Delete ${said}`}
                      onClick={() => onDelete(member)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Typography variant="body3" component="p" className={styles.note}>
          {kind === 'event' ? 'No events.' : 'No blocks.'}
        </Typography>
      )}
      {!isReadOnly && (
        <div className={styles.acts}>
          <Button
            ref={keep(`new-${kind}:${owner ?? ''}`)}
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onNew}
          >
            {kind === 'event' ? 'New event' : 'New block'}
          </Button>
        </div>
      )}
    </section>
  );
};

/** A member as its row says it: an event after `when`, a block and what it reports. */
const memberSays = (member: ActorMember): string =>
  member.kind === 'event'
    ? `when ${reading(member)}`
    : `${reading(member)}${member.returns ? `, reports a ${member.returns}` : ''}`;

/** A step as its row says it: its name and when it runs. */
const stepSays = (step: RuleStep): string =>
  step.phase
    ? `${step.name}, during ${step.phase}`
    : `${step.name}, every tick`;

/** A definition's steps, each with Edit and Delete, and a way to make one. */
const StepList = ({
  owner,
  steps,
  isReadOnly,
  buttons,
  onEdit,
  onDelete,
  onNew,
}: {
  owner: Owner;
  steps: readonly RuleStep[];
  isReadOnly: boolean;
  buttons: MemberFocus;
  onEdit: (at: number) => void;
  onDelete: (at: number) => void;
  onNew: () => void;
}) => {
  const keep = (key: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      buttons.set(key, element);
    } else {
      buttons.delete(key);
    }
  };
  return (
    <section aria-label="Steps">
      <Typography variant="h5" component="h3">
        Steps
      </Typography>
      {steps.length ? (
        <ul className={styles.list}>
          {steps.map((step, at) => {
            const said = stepSays(step);
            return (
              <li key={`${step.name}-${at}`} className={styles.item}>
                <Typography variant="body3" component="span">
                  {said}
                </Typography>
                <div className={styles.acts}>
                  <Button
                    ref={keep(stepId({owner, at}))}
                    variant="text"
                    size="extraSmall"
                    aria-label={`Edit ${said}`}
                    onClick={() => onEdit(at)}
                  >
                    Edit
                  </Button>
                  {!isReadOnly && (
                    <Button
                      variant="text"
                      size="extraSmall"
                      aria-label={`Delete ${said}`}
                      onClick={() => onDelete(at)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Typography variant="body3" component="p" className={styles.note}>
          No steps.
        </Typography>
      )}
      {!isReadOnly && (
        <div className={styles.acts}>
          <Button
            ref={keep(`new-step:${owner ?? ''}`)}
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onNew}
          >
            New step
          </Button>
        </div>
      )}
    </section>
  );
};

/**
 * What a definition uses: the rules a rule needs, or the traits a trait
 * does, each with a way to stop, and a way to add one.
 */
const Uses = ({
  title,
  uses,
  options,
  nameOf,
  isReadOnly,
  onAdd,
  onRemove,
}: {
  title: string;
  uses: readonly string[];
  options: ReadonlyArray<{value: string; text: string}>;
  nameOf: (used: string) => string;
  isReadOnly: boolean;
  onAdd: (used: string) => void;
  onRemove: (used: string) => void;
}) => {
  const offered = options.filter(option => !uses.includes(option.value));
  const [chosen, setChosen] = useState('');
  return (
    <section aria-label={title}>
      <Typography variant="h5" component="h3">
        {title}
      </Typography>
      {uses.length ? (
        <ul className={styles.list}>
          {uses.map(used => (
            <li key={used} className={styles.item}>
              <Typography variant="body3" component="span">
                {nameOf(used)}
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="text"
                  size="extraSmall"
                  aria-label={`Stop using ${nameOf(used)}`}
                  onClick={() => onRemove(used)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Typography variant="body3" component="p" className={styles.note}>
          None.
        </Typography>
      )}
      {!isReadOnly && offered.length > 0 && (
        <div className={styles.acts}>
          <SimpleDropdown
            name={`${title}-add`}
            labelText={`Add to ${title.toLowerCase()}`}
            size="s"
            selectedValue={chosen}
            items={[{value: '', text: '(choose)'}, ...offered]}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setChosen(event.target.value)
            }
          />
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            disabled={!chosen}
            onClick={() => {
              onAdd(chosen);
              setChosen('');
            }}
          >
            Add
          </Button>
        </div>
      )}
    </section>
  );
};

/**
 * What a rule is for: markdown, drawn, and edited as plain text on Edit.
 * Done, or Escape, draws it again and puts focus back on Edit.
 */
const Prose = ({
  id,
  label,
  value,
  isReadOnly,
  onValue,
}: {
  id: string;
  label: string;
  value: string;
  isReadOnly: boolean;
  onValue: (text: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const editRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const backToEdit = useRef(false);
  useEffect(() => {
    if (editing) {
      boxRef.current?.focus();
    } else if (backToEdit.current) {
      backToEdit.current = false;
      editRef.current?.focus();
    }
  }, [editing]);
  const done = () => {
    backToEdit.current = true;
    setEditing(false);
  };
  if (editing && !isReadOnly) {
    return (
      <div className={styles.field}>
        <label htmlFor={id}>
          <Typography variant="body4" component="span">
            {label}
          </Typography>
        </label>
        <textarea
          id={id}
          className={styles.prose}
          ref={boxRef}
          value={value}
          aria-describedby={`${id}-hint`}
          onChange={event => onValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              done();
            }
          }}
        />
        <Typography variant="body4" id={`${id}-hint`}>
          Markdown: **bold**, *italic*, `code`, a blank line between paragraphs.
        </Typography>
        <Button
          variant="text"
          size="extraSmall"
          className={styles.proseToggle}
          onClick={done}
        >
          Done
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.field} role="group" aria-labelledby={`${id}-label`}>
      <Typography variant="body4" component="span" id={`${id}-label`}>
        {label}
      </Typography>
      {value.trim() ? (
        <div className={styles.proseDrawn}>
          <BlocklyMarkdown content={value} />
        </div>
      ) : (
        <Typography variant="body3" className={styles.proseEmpty}>
          Nothing written yet.
        </Typography>
      )}
      {!isReadOnly && (
        <Button
          ref={editRef}
          variant="text"
          size="extraSmall"
          className={styles.proseToggle}
          aria-label={`Edit ${label.toLowerCase()}`}
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      )}
    </div>
  );
};

/** A trait's rename, said in place, and its delete. */
const TraitActions = ({
  name,
  problemOf,
  onRename,
  onDelete,
}: {
  name: string;
  problemOf: (name: string) => string | undefined;
  onRename: (name: string) => void;
  onDelete: () => void;
}) => {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);
  const problem = draft.trim() === name ? undefined : problemOf(draft);
  if (!renaming) {
    return (
      <div className={styles.acts}>
        <Button
          variant="text"
          size="small"
          aria-label={`Rename ${name}`}
          onClick={() => {
            setDraft(name);
            setRenaming(true);
          }}
        >
          Rename
        </Button>
        <Button
          variant="text"
          size="small"
          aria-label={`Delete ${name}`}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    );
  }
  const save = () => {
    if (!problem) {
      setRenaming(false);
      if (draft.trim() !== name) {
        onRename(draft);
      }
    }
  };
  return (
    <div className={styles.add} role="group" aria-label={`Rename ${name}`}>
      <TextField
        name={`trait-${name}-rename`}
        label="Name"
        size="s"
        value={draft}
        errorMessage={problem}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setDraft(event.target.value)
        }
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            save();
          } else if (event.key === 'Escape') {
            setRenaming(false);
          }
        }}
      />
      <div className={styles.acts}>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          disabled={Boolean(problem)}
          onClick={save}
        >
          Save name
        </Button>
        <Button variant="text" size="small" onClick={() => setRenaming(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

/** A way to add a property to a definition: a button, then a short form. */
const AddProperty = ({
  owner,
  data,
  onEdit,
}: {
  owner: Owner;
  data: RuleData;
  onEdit: (data: RuleData) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('number');
  const id = `rule-${owner ?? 'own'}-new`;
  if (!open) {
    return (
      <Button
        variant="text"
        size="small"
        aria-label={`Add a property to ${owner ?? data.name}`}
        onClick={() => setOpen(true)}
      >
        Add property
      </Button>
    );
  }
  const add = () => {
    const next = addProperty(data, owner, name, type);
    if (next !== data) {
      onEdit(next);
      setName('');
      setOpen(false);
    }
  };
  return (
    <div
      className={styles.add}
      role="group"
      aria-label={`New property for ${owner ?? data.name}`}
    >
      <TextField
        name={`${id}-name`}
        label="Name"
        size="s"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setName(event.target.value)
        }
      />
      <SimpleDropdown
        name={`${id}-kind`}
        labelText="Kind"
        size="s"
        selectedValue={type}
        items={PROPERTY_TYPES.map(one => ({value: one, text: one}))}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setType(event.target.value)
        }
      />
      <div className={styles.acts}>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          disabled={!name.trim()}
          onClick={add}
        >
          Add
        </Button>
        <Button variant="text" size="small" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export const RuleEditor = (props: CustomEditorProps) => {
  const {fileId, initialContents, isReadOnly, onChange} = props;
  const {currentSources, replaceSources} = useSources<MultiFileSource>();
  const [script, setScript, onTrail] = useScriptStep(fileId);

  // The file as last written here, and as the project holds it: a change
  // from outside (a rename elsewhere) is taken up, and an echo of a write
  // made here is not a change.
  const [contents, setContents] = useState(initialContents);
  const written = useRef(initialContents);
  useEffect(() => {
    if (initialContents !== written.current) {
      written.current = initialContents;
      setContents(initialContents);
    }
  }, [initialContents]);
  const write = (next: string) => {
    if (next === written.current) {
      return;
    }
    written.current = next;
    setContents(next);
    onChange(next);
  };
  const data = ruleDataOf(contents);
  const edit = (next: RuleData) => {
    if (data && next !== data) {
      write(JSON.stringify(next, null, 2));
    }
  };

  const rules = useMemo(
    () => projectRules(currentSources.source),
    [currentSources],
  );
  const [newTrait, setNewTrait] = useState('');

  // Focus follows the trait: its view's heading on opening, and its name in
  // the panel on the way back.
  const heading = useRef<HTMLHeadingElement>(null);
  const traitButtons = useRef(new Map<string, HTMLButtonElement>());
  const returnTo = useRef<string | null>(null);
  const openTrait = script?.kind === 'trait' ? script.id : null;
  useEffect(() => {
    if (openTrait) {
      returnTo.current = openTrait;
      heading.current?.focus();
    } else if (returnTo.current !== null) {
      // '' is the rule's own name, where a deleted trait's focus goes.
      traitButtons.current.get(returnTo.current)?.focus();
      returnTo.current = null;
    }
  }, [openTrait]);

  /** A change made to the data as the file now holds it, not as last drawn. */
  const update = (change: (now: RuleData) => RuleData) => {
    const now = ruleDataOf(written.current);
    const next = now && change(now);
    if (now && next !== now) {
      write(JSON.stringify(next, null, 2));
    }
  };
  // The project as it is when a page is left, which is after its last render.
  const sources = useRef(currentSources);
  sources.current = currentSources;
  const {confirm} = usePrompts();
  /** The member just made, whose page opens on its design. */
  const [fresh, setFresh] = useState<string | null>(null);
  // Focus comes back to the member's Edit, or to a New where it has gone.
  const memberButtons = useRef<MemberFocus>(new Map());
  const [returnToMember, setReturnToMember] = useState<string | null>(null);
  const openId =
    script?.kind === 'member' || script?.kind === 'step' ? script.id : null;
  const modulePath = (filePath(currentSources.source, fileId) ?? '').replace(
    /\.rule$/,
    '',
  );
  // Minted only while a member's page is open: it builds a whole palette.
  const palette = useMemo(
    () =>
      openId
        ? rulePalette(modulePath, resolveRuleContents(contents))
        : undefined,
    [openId, modulePath, contents],
  );
  useEffect(() => {
    if (!openId && returnToMember) {
      memberButtons.current.get(returnToMember)?.focus();
      setReturnToMember(null);
    }
  }, [openId, returnToMember]);

  if (!data) {
    return (
      <div className={styles.editor}>
        <Typography variant="body3" className={styles.note}>
          This rule’s file cannot be read.
        </Typography>
      </div>
    );
  }

  const openMember = (member: ActorMember, owner: Owner) => {
    setReturnToMember(member.id);
    setScript({
      kind: 'member',
      id: member.id,
      ...(owner ? {trait: owner} : {}),
    });
  };
  const makeMember = (kind: 'event' | 'block', owner: Owner) => {
    const host = asMemberHost(data, owner);
    const member = newMember(host, kind);
    edit(fromMemberHost(data, addMember(host, member), owner));
    setFresh(member.id);
    openMember(member, owner);
  };
  const deleteMember = async (member: ActorMember, owner: Owner) => {
    const said = memberSays(member);
    const uses = ruleMemberUses(currentSources.source, data.name, member)
      .filter(id => id !== fileId)
      .map(id => fileLabel(currentSources.source.files[id]));
    if (
      !(await confirm({
        title: `Delete ${member.kind === 'event' ? 'event' : 'block'}`,
        message: uses.length
          ? `Delete “${said}”? The code in ${uses.join(', ')} uses it, ` +
            'and will stop working where it does.'
          : `Delete “${said}”? No other file uses it.`,
      }))
    ) {
      return;
    }
    const definition =
      owner === null
        ? data
        : (data.traits ?? []).find(one => one.name === owner);
    const mine = (definition?.members ?? []).filter(
      one => one.kind === member.kind,
    );
    const at = mine.findIndex(one => one.id === member.id);
    const next = mine[at + 1] ?? mine[at - 1];
    const host = asMemberHost(data, owner);
    edit(fromMemberHost(data, removeMember(host, member.id), owner));
    setReturnToMember(next?.id ?? `new-${member.kind}:${owner ?? ''}`);
  };

  const openStep = (place: StepAt) => {
    setReturnToMember(stepId(place));
    setScript({
      kind: 'step',
      id: stepId(place),
      ...(place.owner ? {trait: place.owner} : {}),
    });
  };
  const makeStep = (owner: Owner) => {
    const made = addStep(data, owner);
    edit(made.data);
    openStep(made.place);
  };
  /** Deleted from its own page, the page closes onto what holds it. */
  const deleteStep = async (place: StepAt, fromPage = false) => {
    const step = stepOf(data, place);
    if (
      !step ||
      !(await confirm({
        title: 'Delete step',
        message: `Delete “${stepSays(step)}”? What it does goes with it.`,
      }))
    ) {
      return;
    }
    if (fromPage) {
      setScript(place.owner ? {kind: 'trait', id: place.owner} : null);
    }
    const left = stepsOf(data, place.owner).length - 1;
    edit(removeStep(data, place));
    setReturnToMember(
      left > 0
        ? stepId({owner: place.owner, at: Math.min(place.at, left - 1)})
        : `new-step:${place.owner ?? ''}`,
    );
  };

  const openedStep =
    script?.kind === 'step' ? stepAtOf(data, script.id) : undefined;
  if (openedStep) {
    return (
      <div className={styles.code}>
        {!onTrail && (
          <div className={styles.codeHeader}>
            <Button
              variant="text"
              size="extraSmall"
              startIcon={
                <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
              }
              onClick={() =>
                setScript(
                  openedStep.owner
                    ? {kind: 'trait', id: openedStep.owner}
                    : null,
                )
              }
            >
              {openedStep.owner ?? data.name}
            </Button>
          </div>
        )}
        <StepPage
          key={stepId(openedStep)}
          data={data}
          place={openedStep}
          fileId={fileId}
          isReadOnly={isReadOnly}
          onUpdate={update}
          onDelete={() => void deleteStep(openedStep, true)}
          onLeave={(from, to) => {
            const now = sources.current;
            const source = renameStep(now.source, data.name, from, to);
            if (source !== now.source) {
              replaceSources({...now, source});
            }
          }}
        />
      </div>
    );
  }

  const deleteTraitHere = async (name: string) => {
    const uses = traitUses(currentSources.source, fileId, data.name, name).map(
      id => fileLabel(currentSources.source.files[id]),
    );
    if (
      !(await confirm({
        title: 'Delete trait',
        message:
          `Delete ${name}, with its properties, events, blocks and steps? ` +
          (uses.length
            ? `${uses.join(', ')} name it, and will stop working where they do.`
            : 'Nothing else names it.'),
      }))
    ) {
      return;
    }
    edit(deleteTrait(data, name));
    // Back to the rule, with focus on its name.
    returnTo.current = '';
    setScript(null);
  };

  const opened =
    script?.kind === 'member' && openId ? memberOf(data, openId) : undefined;
  if (opened) {
    const {member, owner} = opened;
    return (
      <div className={styles.code}>
        {!onTrail && (
          <div className={styles.codeHeader}>
            <Button
              variant="text"
              size="extraSmall"
              startIcon={
                <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
              }
              onClick={() =>
                setScript(owner ? {kind: 'trait', id: owner} : null)
              }
            >
              {owner ?? data.name}
            </Button>
          </div>
        )}
        <MemberPage
          key={member.id}
          data={asMemberHost(data, owner)}
          member={member}
          contents=""
          modulePath={modulePath}
          fileId={fileId}
          isNew={member.id === fresh}
          isReadOnly={isReadOnly}
          language="rule"
          palette={palette}
          reports={member.kind === 'block' ? RULE_REPORTS : undefined}
          onUpdate={change =>
            update(now =>
              fromMemberHost(now, change(asMemberHost(now, owner)), owner),
            )
          }
          onLeave={(before, after) => {
            const now = sources.current;
            const source = renameRuleMember(
              now.source,
              data.name,
              before,
              after,
            );
            if (source !== now.source) {
              replaceSources({...now, source});
            }
          }}
        />
      </div>
    );
  }

  const trait = openTrait
    ? (data.traits ?? []).find(one => one.name === openTrait)
    : undefined;
  const pictures = Object.values(currentSources.source.files)
    .filter(file => file.url)
    .map(file => file.name);

  const ruleOptions = rules
    .filter(rule => rule.name !== data.name)
    .map(rule => ({value: rule.name, text: rule.name}));
  const traitNames = new Map<string, string>(
    rules.flatMap(rule =>
      rule.traits.map(
        one => [`${rule.name}#${one.ref.exportName}`, one.name] as const,
      ),
    ),
  );
  const traitOptions = [...traitNames]
    .filter(([, name]) => !(trait && name === trait.name))
    .map(([value, text]) => ({value, text}));

  const propertyRows = (owner: Owner, definition: RuleData | RuleTrait) =>
    (definition.properties ?? []).map(property => (
      <RulePropertyRow
        key={property.name}
        property={property}
        owner={owner}
        data={data}
        fileId={fileId}
        source={currentSources.source}
        onEdit={edit}
        // A rename reaches other files, so the project is replaced, and the
        // editors open on them read it again.
        onProject={source => replaceSources({...currentSources, source})}
        isReadOnly={isReadOnly}
        pictures={pictures}
      />
    ));

  const problem = newTrait.trim() ? traitProblem(data, newTrait) : undefined;

  return (
    <div className={styles.editor} data-testid="rule-editor">
      <div className={styles.head}>
        <Typography variant="h4" component="h2" className={styles.name}>
          {data.name}
        </Typography>
        {!isReadOnly && (
          <Button
            variant="text"
            size="small"
            onClick={() => void requestFileAct({act: 'rename', fileId})}
          >
            Rename
          </Button>
        )}
      </div>
      <div className={styles.body}>
        <div
          className={styles.panel}
          aria-label="Properties and traits"
          role="region"
        >
          <section
            className={`${styles.group} ${trait ? '' : styles.open}`}
            aria-labelledby={`${fileId}-own`}
          >
            <h3 className={styles.groupHead} id={`${fileId}-own`}>
              <Button
                ref={element => {
                  if (element) {
                    traitButtons.current.set('', element);
                  } else {
                    traitButtons.current.delete('');
                  }
                }}
                variant="text"
                size="small"
                aria-current={trait ? undefined : 'true'}
                onClick={() => setScript(null)}
              >
                {data.name}
              </Button>
            </h3>
            {propertyRows(null, data)}
            {!isReadOnly && (
              <AddProperty owner={null} data={data} onEdit={edit} />
            )}
          </section>
          {(data.traits ?? []).map(one => (
            <section
              key={one.name}
              className={`${styles.group} ${trait === one ? styles.open : ''}`}
              aria-labelledby={`${fileId}-trait-${one.name}`}
            >
              <h3
                className={styles.groupHead}
                id={`${fileId}-trait-${one.name}`}
              >
                <Button
                  ref={element => {
                    if (element) {
                      traitButtons.current.set(one.name, element);
                    } else {
                      traitButtons.current.delete(one.name);
                    }
                  }}
                  variant="text"
                  size="small"
                  aria-current={trait === one ? 'true' : undefined}
                  onClick={() => setScript({kind: 'trait', id: one.name})}
                >
                  {one.name}
                </Button>
              </h3>
              {(one.properties ?? []).length === 0 && (
                <Typography
                  variant="body3"
                  component="p"
                  className={styles.note}
                >
                  No properties.
                </Typography>
              )}
              {propertyRows(one.name, one)}
              {!isReadOnly && (
                <AddProperty owner={one.name} data={data} onEdit={edit} />
              )}
            </section>
          ))}
          {!isReadOnly && (
            <div className={`${styles.group} ${styles.add}`}>
              <TextField
                name={`${fileId}-new-trait`}
                label="New trait"
                size="s"
                value={newTrait}
                errorMessage={problem}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setNewTrait(event.target.value)
                }
              />
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                disabled={!newTrait.trim() || Boolean(problem)}
                onClick={() => {
                  const next = addTrait(data, newTrait);
                  if (next !== data) {
                    edit(next);
                    setScript({kind: 'trait', id: newTrait.trim()});
                    setNewTrait('');
                  }
                }}
              >
                Add trait
              </Button>
            </div>
          )}
        </div>
        <div className={styles.main}>
          {trait ? (
            <div className={styles.view}>
              <Typography
                ref={heading}
                tabIndex={-1}
                variant="h4"
                component="h2"
                className={styles.heading}
              >
                Trait: {trait.name}
              </Typography>
              {!isReadOnly && (
                <TraitActions
                  key={trait.name}
                  name={trait.name}
                  problemOf={name => traitProblem(data, name, trait.name)}
                  onRename={name => {
                    const source = renameTrait(
                      currentSources.source,
                      fileId,
                      trait.name,
                      name,
                    );
                    if (source !== currentSources.source) {
                      replaceSources({...currentSources, source});
                      setScript({kind: 'trait', id: name.trim()});
                    }
                  }}
                  onDelete={() => void deleteTraitHere(trait.name)}
                />
              )}
              <TextField
                name={`${fileId}-trait-description`}
                label="What it is for"
                size="s"
                readOnly={isReadOnly}
                value={trait.description ?? ''}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  edit(
                    setTraitDescription(data, trait.name, event.target.value),
                  )
                }
              />
              <SimpleDropdown
                name={`${fileId}-trait-subject`}
                labelText="Taken by"
                size="s"
                disabled={isReadOnly}
                selectedValue={trait.subject ?? 'actor'}
                items={[
                  {value: 'actor', text: 'an actor'},
                  {value: 'camera', text: 'a camera'},
                ]}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  edit(
                    setTraitSubject(
                      data,
                      trait.name,
                      event.target.value as 'actor' | 'camera',
                    ),
                  )
                }
              />
              <Uses
                title="Traits it needs"
                uses={trait.uses ?? []}
                options={traitOptions}
                nameOf={used => traitNames.get(used) ?? used}
                isReadOnly={isReadOnly}
                onAdd={used => edit(addUse(data, trait.name, used))}
                onRemove={used => edit(removeUse(data, trait.name, used))}
              />
              <MemberList
                kind="event"
                owner={trait.name}
                members={(trait.members ?? []).filter(
                  one => one.kind === 'event',
                )}
                isReadOnly={isReadOnly}
                buttons={memberButtons.current}
                onEdit={member => openMember(member, trait.name)}
                onDelete={member => void deleteMember(member, trait.name)}
                onNew={() => makeMember('event', trait.name)}
              />
              <MemberList
                kind="block"
                owner={trait.name}
                members={(trait.members ?? []).filter(
                  one => one.kind === 'block',
                )}
                isReadOnly={isReadOnly}
                buttons={memberButtons.current}
                onEdit={member => openMember(member, trait.name)}
                onDelete={member => void deleteMember(member, trait.name)}
                onNew={() => makeMember('block', trait.name)}
              />
              <StepList
                owner={trait.name}
                steps={trait.steps ?? []}
                isReadOnly={isReadOnly}
                buttons={memberButtons.current}
                onEdit={at => openStep({owner: trait.name, at})}
                onDelete={at => void deleteStep({owner: trait.name, at})}
                onNew={() => makeStep(trait.name)}
              />
            </div>
          ) : (
            <div className={styles.view}>
              <Typography
                ref={heading}
                tabIndex={-1}
                variant="h4"
                component="h2"
                className={styles.heading}
              >
                Rule: {data.name}
              </Typography>
              <TextField
                name={`${fileId}-ability`}
                label="What using it gives"
                size="s"
                readOnly={isReadOnly}
                value={data.ability}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  edit(setAbility(data, event.target.value))
                }
              />
              <Prose
                id={`${fileId}-description`}
                label="What it is for"
                value={data.description ?? ''}
                isReadOnly={isReadOnly}
                onValue={text => edit(setDescription(data, text))}
              />
              <Uses
                title="Rules it uses"
                uses={data.uses ?? []}
                options={ruleOptions}
                nameOf={used => used}
                isReadOnly={isReadOnly}
                onAdd={used => edit(addUse(data, null, used))}
                onRemove={used => edit(removeUse(data, null, used))}
              />
              <MemberList
                kind="event"
                owner={null}
                members={(data.members ?? []).filter(
                  one => one.kind === 'event',
                )}
                isReadOnly={isReadOnly}
                buttons={memberButtons.current}
                onEdit={member => openMember(member, null)}
                onDelete={member => void deleteMember(member, null)}
                onNew={() => makeMember('event', null)}
              />
              <MemberList
                kind="block"
                owner={null}
                members={(data.members ?? []).filter(
                  one => one.kind === 'block',
                )}
                isReadOnly={isReadOnly}
                buttons={memberButtons.current}
                onEdit={member => openMember(member, null)}
                onDelete={member => void deleteMember(member, null)}
                onNew={() => makeMember('block', null)}
              />
              <StepList
                owner={null}
                steps={data.steps ?? []}
                isReadOnly={isReadOnly}
                buttons={memberButtons.current}
                onEdit={at => openStep({owner: null, at})}
                onDelete={at => void deleteStep({owner: null, at})}
                onNew={() => makeStep(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RuleFileEditor = RuleEditor;
