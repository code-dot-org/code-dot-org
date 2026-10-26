// The Rule Editor: a rule as data (specs/RULE_EDITOR_PLAN.md, step 2).
//
// The side panel holds what has a value: the rule's own properties, then
// each trait's, under the trait's name, which opens the trait. The main area
// says what the rule declares — what it is for, the rules it uses, its
// events, blocks and steps — or, with a trait open, what the trait declares.
// Code opens the whole rule in blocks, folded back into data as it is saved,
// which is how a body is written until it has a page of its own.
//
// A rule the data cannot say whole opens in blocks, as every rule used to.

import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react';

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
import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import {BUILTIN_RULE_META} from '../../blockly/builtinMeta';
import {parseRuleMeta, type RuleMeta} from '../../blockly/ruleMeta';
import {requestFileAct} from '../../files/fileActs';
import {fileLabel} from '../../files/fileLabel';
import {useScriptStep} from '../../layout/TrailContext';
import {filePath, projectFiles} from '../../runtime/projectFiles';
import {
  asRuleData,
  ruleView,
  type RuleData,
  type RuleStep,
  type RuleTrait,
} from '../ruleData';
import {
  addProperty,
  addTrait,
  addUse,
  PROPERTY_TYPES,
  removeUse,
  ruleDataOf,
  setAbility,
  setDescription,
  setTraitDescription,
  setTraitSubject,
  traitProblem,
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

import styles from './ruleEditor.module.css';
import {RulePropertyRow} from './RulePropertyRow';

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

/** A section of headed list items, or a line saying there are none. */
const Listed = ({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: string[];
}) => (
  <section aria-label={title}>
    <Typography variant="h5" component="h3">
      {title}
    </Typography>
    {items.length ? (
      <ul className={styles.list}>
        {items.map((item, at) => (
          <li key={`${item}-${at}`} className={styles.item}>
            <Typography variant="body3" component="span">
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    ) : (
      <Typography variant="body3" component="p" className={styles.note}>
        {empty}
      </Typography>
    )}
  </section>
);

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

/** A definition's steps, as they read: what each body does is in Code. */
const Steps = ({steps}: {steps: readonly RuleStep[]}) => (
  <Listed
    title="Steps"
    empty="No steps."
    items={steps.map(step =>
      step.phase
        ? `${step.name} — during ${step.phase}`
        : `${step.name} — every tick`,
    )}
  />
);

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

/** A labelled box for prose: what a rule or a trait is for. */
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
}) => (
  <div className={styles.field}>
    <label htmlFor={id}>
      <Typography variant="body4" component="span">
        {label}
      </Typography>
    </label>
    <textarea
      id={id}
      className={styles.prose}
      value={value}
      readOnly={isReadOnly}
      onChange={event => onValue(event.target.value)}
    />
  </div>
);

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
    } else if (returnTo.current) {
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
  const openId = script?.kind === 'member' ? script.id : null;
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
    // A rule the data cannot say whole is written in blocks, as it was.
    return <BlocklyFileEditor {...props} />;
  }

  if (script?.kind === 'code') {
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
              onClick={() => setScript(null)}
            >
              Rule
            </Button>
          </div>
        )}
        <div className={styles.codeBlocks}>
          <BlocklyFileEditor
            {...props}
            initialContents={JSON.stringify(ruleView(data), null, 2)}
            // Kept as data when the blocks still say what data can.
            onChange={next => write(asRuleData(next))}
          />
        </div>
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

  const opened = openId ? memberOf(data, openId) : undefined;
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
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          className={styles.codeButton}
          startIcon={
            <FontAwesomeV6Icon iconName="puzzle-piece" iconStyle="solid" />
          }
          onClick={() => setScript({kind: 'code'})}
        >
          Code
        </Button>
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
              <Steps steps={trait.steps ?? []} />
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
              <Steps steps={data.steps ?? []} />
              <Typography variant="body3" component="p" className={styles.note}>
                What each block and step does is written in Code.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RuleFileEditor = RuleEditor;
