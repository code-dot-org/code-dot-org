// A levelbuilder form drawn from a zod schema, for any Lab2 lab. Every
// node of the schema gets a control: a group gets a section, an optional
// group marked as a feature gets a switch, a list gets rows that can be
// added, moved and removed, and a choice between shapes gets a menu of
// them. A node whose `widget` names one the caller supplies is drawn by
// that widget instead.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {ZodType} from 'zod';

import {
  defOf,
  elementOf,
  enumValues,
  discriminatorOf,
  itemTitle,
  kindOf,
  metaOf,
  namesElementOf,
  namesTakeString,
  optionIndexFor,
  optionsOf,
  recordValueOf,
  shapeOf,
  startValue,
  tagOf,
  unwrap,
} from './schemaNodes';

import styles from './schema-form.module.scss';

export type Path = (string | number)[];

/** Problems with the value, by path joined with dots. */
export type Problems = ReadonlyMap<string, string[]>;

export interface WidgetProps {
  schema: ZodType;
  value: unknown;
  onChange: (value: unknown) => void;
  path: Path;
}

/** A control the caller supplies for nodes whose `widget` names it. */
export type Widget = React.ComponentType<WidgetProps>;

interface FormContext {
  problems: Problems;
  widgets: Record<string, Widget>;
  /** Overrides the value startValue builds from the schema for a feature
      being switched on; undefined falls back to it. The path is joined
      with dots. */
  featureStart?: (path: string) => unknown;
  /** What each removed or switched-off part held, by path joined with
      dots, so that adding it back restores it. */
  removedValues?: Map<string, unknown>;
  /** The whole value, for fields whose choices come from elsewhere in it. */
  root?: unknown;
  /** Lists of choices the page supplies, by name, for `options: "@name"`. */
  suppliedOptions?: Record<string, ReferenceOption[]>;
}

const Context = createContext<FormContext>({problems: new Map(), widgets: {}});

/** The value a part held when it was last removed, and a way to record it.
    The record is kept for as long as the form is on the page. */
function useRemovedValue(path: Path): {
  saved: () => unknown;
  save: (value: unknown) => void;
} {
  const {removedValues} = useContext(Context);
  const key = keyOf(path);
  return {
    saved: () => removedValues?.get(key),
    save: value => removedValues?.set(key, value),
  };
}

const keyOf = (path: Path) => path.join('.');

// "formatVersion" reads "Format version": a schema without titles still
// gets labels.
const humanize = (key: string | number | undefined) =>
  typeof key === 'string'
    ? key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]/g, ' ')
        .replace(/^./, first => first.toUpperCase())
        .replace(
          / ([A-Z])(?=[a-z])/g,
          (_, letter) => ` ${letter.toLowerCase()}`
        )
    : undefined;

/** A node's meta, with a title made from its key when it has none. */
function metaAt(schema: ZodType, path: Path) {
  const meta = metaOf(schema);
  return meta.title ? meta : {...meta, title: humanize(path[path.length - 1])};
}
const idOf = (path: Path) => `schema-field-${path.join('-') || 'root'}`;

// Sections start closed. A request to open or close them all bumps
// `request`, and every section follows the latest one.
const CollapseContext = createContext<{request: number; open: boolean}>({
  request: 0,
  open: false,
});

/** A section starts open when startOpen is set or the latest request was
    Open all. After that it follows only the requests made after it
    appears. */
export function useSectionOpen(
  startOpen = false
): [boolean, (open: boolean) => void] {
  const {request, open} = useContext(CollapseContext);
  const [isOpen, setOpen] = useState(startOpen || (request > 0 && open));
  const requestSeen = useRef(request);
  useEffect(() => {
    if (request !== requestSeen.current) {
      requestSeen.current = request;
      setOpen(open);
    }
  }, [request, open]);
  return [isOpen, setOpen];
}

/** How many problems are at this path or under it. */
export function useProblemCount(path: Path): number {
  const {problems} = useContext(Context);
  const key = keyOf(path);
  let count = 0;
  problems.forEach((messages, at) => {
    if (!key || at === key || at.startsWith(`${key}.`)) {
      count += messages.length;
    }
  });
  return count;
}

const SUMMARY_KEYS = [
  'title',
  'name',
  'text',
  'questionTitle',
  'heading',
  'label',
  'id',
  'key',
];

/** A short text that tells a value apart from its siblings: the first
    non-empty text among SUMMARY_KEYS, cut to 70 characters. */
export function summaryOf(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return '';
  }
  const record = value as Record<string, unknown>;
  const found = SUMMARY_KEYS.map(key => record[key]).find(
    field => typeof field === 'string' && field.trim()
  ) as string | undefined;
  if (!found) {
    return '';
  }
  return found.length > 70 ? `${found.slice(0, 69)}…` : found;
}

/** The button that opens and closes a section. */
export const Disclosure: React.FunctionComponent<{
  open: boolean;
  onToggle: () => void;
  label: string;
  summary?: string;
  path: Path;
}> = ({open, onToggle, label, summary, path}) => {
  const problems = useProblemCount(path);
  return (
    <button
      type="button"
      className={styles.disclosure}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className={styles.caret} aria-hidden="true">
        {open ? '▾' : '▸'}
      </span>
      <span className={styles.disclosureLabel}>{label}</span>
      {summary && <span className={styles.summary}>{summary}</span>}
      {problems > 0 && (
        <span className={styles.badge}>
          {problems === 1 ? '1 problem' : `${problems} problems`}
        </span>
      )}
    </button>
  );
};

/** Collects a zod error's issues by path, for the form. */
export function problemsFrom(
  issues: {
    path: PropertyKey[];
    message: string;
    code?: string;
    origin?: string;
    minimum?: unknown;
    input?: unknown;
  }[]
): Problems {
  const problems = new Map<string, string[]>();
  issues.forEach(issue => {
    const key = issue.path.map(String).join('.');
    problems.set(key, [...(problems.get(key) ?? []), plainMessage(issue)]);
  });
  return problems;
}

// Plain words for zod's default messages about a missing value, an empty
// string and a too-short list. A message the schema sets itself is kept.
function plainMessage(issue: {
  message: string;
  code?: string;
  origin?: string;
  minimum?: unknown;
  input?: unknown;
}): string {
  if (
    issue.code === 'invalid_type' &&
    issue.input === undefined &&
    issue.message.startsWith('Invalid input')
  ) {
    return 'Required.';
  }
  if (issue.code === 'too_small' && issue.message.startsWith('Too small')) {
    if (issue.origin === 'string' && Number(issue.minimum) === 1) {
      return 'Required.';
    }
    if (issue.origin === 'array') {
      return `Add at least ${issue.minimum}.`;
    }
  }
  return issue.message;
}

interface SchemaFormProps {
  schema: ZodType;
  value: unknown;
  onChange: (value: unknown) => void;
  problems?: Problems;
  widgets?: Record<string, Widget>;
  featureStart?: (path: string) => unknown;
  /** Lists of choices for `options: "@name"`, by name. */
  suppliedOptions?: Record<string, ReferenceOption[]>;
}

const SchemaForm: React.FunctionComponent<SchemaFormProps> = ({
  schema,
  value,
  onChange,
  problems = new Map(),
  widgets = {},
  featureStart,
  suppliedOptions,
}) => (
  <SchemaFormScope
    problems={problems}
    widgets={widgets}
    featureStart={featureStart}
    root={value}
    suppliedOptions={suppliedOptions}
  >
    <CollapseAll>
      <SchemaField
        schema={schema}
        value={value}
        onChange={onChange}
        path={[]}
        bare
      />
    </CollapseAll>
  </SchemaFormScope>
);

export default SchemaForm;

const CollapseAll: React.FunctionComponent<{children: React.ReactNode}> = ({
  children,
}) => {
  const [state, setState] = useState({request: 0, open: false});
  return (
    <CollapseContext.Provider value={state}>
      <div className={styles.form}>
        <div className={styles.toolbar}>
          <MuiButton
            size="small"
            onClick={() => setState({request: state.request + 1, open: true})}
          >
            Open all
          </MuiButton>
          <MuiButton
            size="small"
            onClick={() => setState({request: state.request + 1, open: false})}
          >
            Close all
          </MuiButton>
        </div>
        {children}
      </div>
    </CollapseContext.Provider>
  );
};

/** The problems and widgets that SchemaFields inside it read: for a widget
    used on its own, outside a SchemaForm. */
export const SchemaFormScope: React.FunctionComponent<
  Partial<FormContext> & {children: React.ReactNode}
> = ({
  problems = new Map(),
  widgets = {},
  featureStart,
  root,
  suppliedOptions,
  children,
}) => {
  const removedValues = useRef(new Map<string, unknown>()).current;
  return (
    <Context.Provider
      value={{
        problems,
        widgets,
        featureStart,
        removedValues,
        root,
        suppliedOptions,
      }}
    >
      {children}
    </Context.Provider>
  );
};

/** Whether a value is unset. An optional field that is unset is left out
    of the saved value. */
const isUnset = (value: unknown) => value === undefined;

interface FieldProps extends WidgetProps {
  /** Draw the node's controls without its title, for the form's root and
      for the items of a list, which carry their own heading. */
  bare?: boolean;
}

/** One node of the schema and its value. Exported for widgets that draw
    part of a value themselves and the rest from the schema. */
export const SchemaField: React.FunctionComponent<FieldProps> = props => {
  const {schema, path} = props;
  const {widgets} = useContext(Context);
  const meta = metaAt(schema, path);
  if (meta.widget === 'reference' && meta.options) {
    return <ReferenceField {...props} />;
  }
  const custom = meta.widget && widgets[meta.widget];
  if (custom) {
    const Custom = custom;
    if (unwrap(schema).optional && meta.feature) {
      return (
        <FeatureSwitch
          schema={schema}
          value={props.value}
          onChange={props.onChange}
          path={path}
        >
          <Custom {...props} />
        </FeatureSwitch>
      );
    }
    return (
      <FieldFrame schema={schema} path={path} bare={props.bare}>
        <Custom {...props} />
      </FieldFrame>
    );
  }
  switch (kindOf(schema)) {
    case 'object':
      return <ObjectField {...props} />;
    case 'array':
      return <ArrayField {...props} />;
    case 'record':
      return <RecordField {...props} />;
    case 'choice':
      return <ChoiceField {...props} />;
    case 'boolean':
      return <BooleanField {...props} />;
    case 'enum':
      return <EnumField {...props} />;
    case 'names':
      return <NamesField {...props} />;
    case 'number':
      return <NumberField {...props} />;
    case 'literal':
      return <LiteralField {...props} />;
    case 'string':
      return meta.widget === 'lines' ? (
        <LinesField {...props} />
      ) : meta.widget === 'markdown' ? (
        <TextAreaField {...props} />
      ) : (
        <StringField {...props} />
      );
    default:
      return <JsonField {...props} />;
  }
};

/** The problems at exactly this path. */
function useProblems(path: Path): string[] {
  return useContext(Context).problems.get(keyOf(path)) ?? [];
}

const ProblemList: React.FunctionComponent<{problems: string[]}> = ({
  problems,
}) =>
  problems.length ? (
    <ul className={styles.problems} role="alert">
      {problems.map(problem => (
        <li key={problem}>{problem}</li>
      ))}
    </ul>
  ) : null;

const ProblemsAt: React.FunctionComponent<{path: Path}> = ({path}) => (
  <ProblemList problems={useProblems(path)} />
);

const FieldFrame: React.FunctionComponent<{
  schema: ZodType;
  path: Path;
  bare?: boolean;
  children: React.ReactNode;
}> = ({schema, path, bare, children}) => {
  const meta = metaAt(schema, path);
  const problems = useProblems(path);
  return (
    <div className={styles.field}>
      {!bare && meta.title && (
        <label className={styles.label} htmlFor={idOf(path)}>
          {meta.title}
        </label>
      )}
      {!bare && meta.description && (
        <p className={styles.help}>{meta.description}</p>
      )}
      {children}
      <ProblemList problems={problems} />
    </div>
  );
};

// ---- Groups --------------------------------------------------------------

/**
 * The heading of an optional group: a switch when the schema names it a
 * feature, else Add and Remove buttons. Removing a group leaves it out of
 * the value; adding it back restores what it held.
 */
const OptionalGroupHeader: React.FunctionComponent<
  WidgetProps & {open: boolean; setOpen: (open: boolean) => void}
> = ({schema, value, onChange, path, open, setOpen}) => {
  const {featureStart} = useContext(Context);
  const meta = metaAt(schema, path);
  const on = !isUnset(value);
  const removed = useRemovedValue(path);
  const add = () => {
    setOpen(true);
    onChange(
      removed.saved() ?? featureStart?.(keyOf(path)) ?? startValue(schema)
    );
  };
  const remove = () => {
    removed.save(value);
    onChange(undefined);
  };
  if (meta.feature) {
    return (
      <>
        <Checkbox
          name={idOf(path)}
          checked={on}
          size="s"
          label={meta.feature}
          onChange={event => (event.target.checked ? add() : remove())}
        />
        {on && (
          <Disclosure
            open={open}
            onToggle={() => setOpen(!open)}
            label="Settings"
            path={path}
          />
        )}
      </>
    );
  }
  return (
    <>
      {on ? (
        <Disclosure
          open={open}
          onToggle={() => setOpen(!open)}
          label={meta.title ?? ''}
          summary={open ? undefined : summaryOf(value)}
          path={path}
        />
      ) : (
        <span className={styles.absentTitle}>{meta.title}</span>
      )}
      {on ? (
        <MuiButton
          className={styles.headerAction}
          size="small"
          color="error"
          onClick={remove}
          aria-label={`Remove ${meta.title}`}
        >
          Remove
        </MuiButton>
      ) : (
        <MuiButton
          className={styles.headerAction}
          size="small"
          variant="outlined"
          onClick={add}
          aria-label={`Add ${meta.title}`}
        >
          Add
        </MuiButton>
      )}
    </>
  );
};

/** A feature's switch, and its settings once it is on. */
const FeatureSwitch: React.FunctionComponent<
  WidgetProps & {children: React.ReactNode}
> = ({schema, value, onChange, path, children}) => {
  const meta = metaAt(schema, path);
  const on = !isUnset(value);
  const [open, setOpen] = useSectionOpen();
  return (
    <section
      className={classNames(styles.group, on && styles.groupOn)}
      aria-label={meta.title}
    >
      <div className={styles.groupHeader}>
        <OptionalGroupHeader
          schema={schema}
          value={value}
          onChange={onChange}
          path={path}
          open={open}
          setOpen={setOpen}
        />
      </div>
      {meta.description && <p className={styles.help}>{meta.description}</p>}
      <ProblemsAt path={path} />
      {on && open && <div className={styles.children}>{children}</div>}
    </section>
  );
};

const ObjectField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const problems = useProblems(path);
  const [open, setOpen] = useSectionOpen();
  const on = !isUnset(value);
  const object = (on ? value : {}) as Record<string, unknown>;
  const fields = (
    <div className={classNames(styles.children, path.length && styles.nested)}>
      {Object.entries(shapeOf(schema)).map(([key, child]) => (
        <SchemaField
          key={key}
          schema={child}
          value={object[key]}
          path={[...path, key]}
          onChange={next => {
            const updated = {...object};
            if (isUnset(next)) {
              delete updated[key];
            } else {
              updated[key] = next;
            }
            onChange(updated);
          }}
        />
      ))}
    </div>
  );
  if (bare) {
    return (
      <>
        <ProblemList problems={problems} />
        {fields}
      </>
    );
  }
  return (
    <section
      className={classNames(styles.group, on && styles.groupOn)}
      aria-label={meta.title}
    >
      <div className={styles.groupHeader}>
        {optional ? (
          <OptionalGroupHeader
            schema={schema}
            value={value}
            onChange={onChange}
            path={path}
            open={open}
            setOpen={setOpen}
          />
        ) : (
          <Disclosure
            open={open}
            onToggle={() => setOpen(!open)}
            label={meta.title ?? ''}
            summary={open ? undefined : summaryOf(value)}
            path={path}
          />
        )}
      </div>
      {meta.description && <p className={styles.help}>{meta.description}</p>}
      <ProblemList problems={problems} />
      {on && open && fields}
    </section>
  );
};

const ArrayField: React.FunctionComponent<FieldProps> = props => {
  const {schema, value, onChange, path} = props;
  const element = elementOf(schema);
  const meta = metaAt(schema, path);
  const {featureStart} = useContext(Context);
  const {optional} = unwrap(schema);
  const removed = useRemovedValue(path);
  const [lastAddedIndex, setLastAddedIndex] = useState<number>();
  if (kindOf(element) === 'enum') {
    return <EnumListField {...props} />;
  }
  if (kindOf(element) === 'number') {
    return <NumberListField {...props} />;
  }
  if (kindOf(element) === 'string') {
    return <NamesField {...props} />;
  }
  const items = Array.isArray(value) ? value : [];
  const on = !isUnset(value);
  const title = itemTitle(schema, meta.title);
  const move = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };
  const rows = (
    <ol className={styles.rows}>
      {items.map((item, index) => (
        <ListRow
          key={index}
          title={`${title} ${index + 1}`}
          path={[...path, index]}
          value={item}
          startOpen={index === lastAddedIndex}
          first={index === 0}
          last={index === items.length - 1}
          onMove={step => move(index, index + step)}
          onRemove={() => onChange(items.filter((_, i) => i !== index))}
        >
          <SchemaField
            schema={element}
            value={item}
            path={[...path, index]}
            bare
            onChange={next =>
              onChange(items.map((old, i) => (i === index ? next : old)))
            }
          />
        </ListRow>
      ))}
    </ol>
  );
  const add = (
    <MuiButton
      variant="outlined"
      size="small"
      onClick={() => {
        setLastAddedIndex(items.length);
        onChange([...items, startValue(element)]);
      }}
    >
      Add {title.toLowerCase()}
    </MuiButton>
  );
  if (optional && meta.feature) {
    return (
      <section className={classNames(styles.group, on && styles.groupOn)}>
        <Checkbox
          name={idOf(path)}
          checked={on}
          size="s"
          label={meta.feature}
          onChange={event => {
            if (!event.target.checked) {
              removed.save(value);
            }
            onChange(
              event.target.checked
                ? removed.saved() ?? featureStart?.(keyOf(path)) ?? []
                : undefined
            );
          }}
        />
        {meta.description && <p className={styles.help}>{meta.description}</p>}
        <ProblemsAt path={path} />
        {on && (
          <div className={styles.children}>
            {rows}
            {add}
          </div>
        )}
      </section>
    );
  }
  return (
    <FieldFrame schema={schema} path={path}>
      {rows}
      {add}
    </FieldFrame>
  );
};

export const ListRow: React.FunctionComponent<{
  title: string;
  path: Path;
  value: unknown;
  startOpen?: boolean;
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}> = ({
  title,
  path,
  value,
  startOpen,
  first,
  last,
  onMove,
  onRemove,
  children,
}) => {
  const [open, setOpen] = useSectionOpen(startOpen);
  return (
    <li className={styles.row}>
      <div className={styles.rowHeader}>
        <Disclosure
          open={open}
          onToggle={() => setOpen(!open)}
          label={title}
          summary={summaryOf(value)}
          path={path}
        />
        <span className={styles.rowButtons}>
          <MuiButton
            size="small"
            disabled={first}
            onClick={() => onMove(-1)}
            aria-label={`Move ${title} up`}
          >
            Up
          </MuiButton>
          <MuiButton
            size="small"
            disabled={last}
            onClick={() => onMove(1)}
            aria-label={`Move ${title} down`}
          >
            Down
          </MuiButton>
          <MuiButton
            size="small"
            color="error"
            onClick={onRemove}
            aria-label={`Remove ${title}`}
          >
            Remove
          </MuiButton>
        </span>
      </div>
      {open && children}
    </li>
  );
};

/** One map entry whose value is a group. */
const RecordGroupRow: React.FunctionComponent<{
  name: string;
  path: Path;
  value: unknown;
  children: React.ReactNode;
}> = ({name, path, value, children}) => {
  const [open, setOpen] = useSectionOpen();
  return (
    <div className={styles.row}>
      <Disclosure
        open={open}
        onToggle={() => setOpen(!open)}
        label={name || '(no name)'}
        summary={summaryOf(value)}
        path={path}
      />
      {open && children}
    </div>
  );
};

const RecordField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const entries = Object.entries((value ?? {}) as Record<string, unknown>);
  const valueSchema = recordValueOf(schema);
  const keyOptions = useReferenceOptions(metaAt(schema, path).keyOptions, path);
  const {optional} = unwrap(schema);
  const write = (next: [string, unknown][]) =>
    onChange(next.length || !optional ? Object.fromEntries(next) : undefined);
  return (
    <FieldFrame schema={schema} path={path}>
      <div className={styles.recordRows}>
        {entries.map(([key, entry], index) => (
          <div key={index} className={styles.recordRow}>
            {keyOptions.length ? (
              <SimpleDropdown
                name={`${idOf(path)}-key-${index}`}
                labelText="Name"
                isLabelVisible={false}
                size="s"
                items={[
                  ...(key ? [] : [{value: '', text: '(choose)'}]),
                  ...(keyOptions.some(option => option.value === key) || !key
                    ? []
                    : [{value: key, text: `${key} (not found)`}]),
                  ...keyOptions
                    .filter(
                      option =>
                        option.value === key ||
                        !entries.some(([k]) => k === option.value)
                    )
                    .map(option => ({value: option.value, text: option.label})),
                ]}
                selectedValue={key}
                onChange={event =>
                  write(
                    entries.map(([k, v], i) =>
                      i === index ? [event.target.value, v] : [k, v]
                    )
                  )
                }
              />
            ) : (
              <input
                className={styles.input}
                aria-label="Name"
                value={key}
                onChange={event =>
                  write(
                    entries.map(([k, v], i) =>
                      i === index ? [event.target.value, v] : [k, v]
                    )
                  )
                }
              />
            )}
            <div className={styles.recordValue}>
              {kindOf(valueSchema) === 'object' ? (
                <RecordGroupRow name={key} path={[...path, key]} value={entry}>
                  <SchemaField
                    schema={valueSchema}
                    value={entry}
                    path={[...path, key]}
                    bare
                    onChange={next =>
                      write(
                        entries.map(([k, v], i) =>
                          i === index ? [k, next ?? ''] : [k, v]
                        )
                      )
                    }
                  />
                </RecordGroupRow>
              ) : (
                <SchemaField
                  schema={valueSchema}
                  value={entry}
                  path={[...path, key]}
                  bare
                  onChange={next =>
                    write(
                      entries.map(([k, v], i) =>
                        i === index ? [k, next ?? ''] : [k, v]
                      )
                    )
                  }
                />
              )}
            </div>
            <MuiButton
              size="small"
              color="error"
              aria-label={`Remove ${key || 'entry'}`}
              onClick={() => write(entries.filter((_, i) => i !== index))}
            >
              Remove
            </MuiButton>
          </div>
        ))}
      </div>
      <MuiButton
        variant="outlined"
        size="small"
        onClick={() => write([...entries, ['', startValue(valueSchema)]])}
      >
        Add entry
      </MuiButton>
    </FieldFrame>
  );
};

/** A choice between shapes: a menu of them, then the chosen one's fields. */
const ChoiceField: React.FunctionComponent<FieldProps> = props => {
  const {schema, value, onChange, path, bare} = props;
  const {featureStart} = useContext(Context);
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const removed = useRemovedValue(path);
  if (meta.widget === 'names' || namesTakeString(schema)) {
    return <NamesField {...props} />;
  }
  const options = optionsOf(schema);
  const discriminator = discriminatorOf(schema);
  const on = !isUnset(value);
  const index = optionIndexFor(schema, value);
  const option = options[index];
  const optionTitle = (o: ZodType, i: number) =>
    metaOf(o).title ??
    (discriminator ? String(tagOf(o, discriminator)) : `Shape ${i + 1}`);
  const menu = (
    <SimpleDropdown
      name={idOf(path)}
      id={idOf(path)}
      labelText={meta.title ?? 'Kind'}
      isLabelVisible={false}
      size="s"
      items={options.map((o, i) => ({
        value: String(i),
        text: optionTitle(o, i),
      }))}
      selectedValue={String(index)}
      onChange={event =>
        onChange(startValue(options[Number(event.target.value)]))
      }
    />
  );
  // The chosen shape's own fields, less the tag the menu already shows.
  const shapeFields =
    option && kindOf(option) === 'object' ? (
      <div className={classNames(styles.children, styles.nested)}>
        {Object.entries(shapeOf(option))
          .filter(([key]) => key !== discriminator)
          .map(([key, child]) => {
            const object = (value ?? {}) as Record<string, unknown>;
            return (
              <SchemaField
                key={key}
                schema={child}
                value={object[key]}
                path={[...path, key]}
                onChange={next => {
                  const updated = {...object};
                  if (isUnset(next)) {
                    delete updated[key];
                  } else {
                    updated[key] = next;
                  }
                  onChange(updated);
                }}
              />
            );
          })}
      </div>
    ) : option ? (
      <SchemaField
        schema={option}
        value={value}
        onChange={onChange}
        path={path}
        bare
      />
    ) : null;
  if (optional && meta.feature) {
    return (
      <section className={classNames(styles.group, on && styles.groupOn)}>
        <Checkbox
          name={`${idOf(path)}-on`}
          checked={on}
          size="s"
          label={meta.feature}
          onChange={event => {
            if (!event.target.checked) {
              removed.save(value);
            }
            onChange(
              event.target.checked
                ? removed.saved() ??
                    featureStart?.(keyOf(path)) ??
                    startValue(options[0])
                : undefined
            );
          }}
        />
        {on && (
          <div className={styles.children}>
            {menu}
            {shapeFields}
          </div>
        )}
        <ProblemsAt path={path} />
      </section>
    );
  }
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      {menu}
      {shapeFields}
    </FieldFrame>
  );
};

// ---- Single values -------------------------------------------------------

const BooleanField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const meta = metaAt(schema, path);
  const fallback = meta.defaultValue === true;
  const checked = typeof value === 'boolean' ? value : fallback;
  return (
    <div className={styles.field}>
      <Checkbox
        name={idOf(path)}
        checked={checked}
        size="s"
        label={meta.title ?? ''}
        onChange={event => {
          const next = event.target.checked;
          // The default is written as no value at all.
          onChange(next === fallback ? undefined : next);
        }}
      />
      {meta.description && <p className={styles.help}>{meta.description}</p>}
      <ProblemsAt path={path} />
    </div>
  );
};

const NOT_SET = '';

const EnumField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const values = enumValues(schema);
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      <SimpleDropdown
        name={idOf(path)}
        id={idOf(path)}
        labelText={meta.title ?? ''}
        isLabelVisible={false}
        size="s"
        items={[
          ...(optional ? [{value: NOT_SET, text: '(not set)'}] : []),
          ...values.map(v => ({value: v, text: v})),
        ]}
        selectedValue={typeof value === 'string' ? value : NOT_SET}
        onChange={event =>
          onChange(
            event.target.value === NOT_SET ? undefined : event.target.value
          )
        }
      />
    </FieldFrame>
  );
};

const EnumListField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const {featureStart} = useContext(Context);
  const removed = useRemovedValue(path);
  const chosen = Array.isArray(value) ? (value as string[]) : [];
  const values = enumValues(elementOf(schema));
  const on = !isUnset(value);
  const boxes = (
    <div className={styles.inline}>
      {values.map(v => (
        <Checkbox
          key={v}
          name={`${idOf(path)}-${v}`}
          checked={chosen.includes(v)}
          size="s"
          label={v}
          onChange={event => {
            const set = new Set(chosen);
            if (event.target.checked) {
              set.add(v);
            } else {
              set.delete(v);
            }
            const next = values.filter(x => set.has(x));
            onChange(next.length || meta.feature ? next : undefined);
          }}
        />
      ))}
    </div>
  );
  if (optional && meta.feature) {
    return (
      <section className={classNames(styles.group, on && styles.groupOn)}>
        <Checkbox
          name={`${idOf(path)}-on`}
          checked={on}
          size="s"
          label={meta.feature}
          onChange={event => {
            if (!event.target.checked) {
              removed.save(value);
            }
            onChange(
              event.target.checked
                ? removed.saved() ?? featureStart?.(keyOf(path)) ?? []
                : undefined
            );
          }}
        />
        {meta.description && <p className={styles.help}>{meta.description}</p>}
        {on && <div className={styles.children}>{boxes}</div>}
        <ProblemsAt path={path} />
      </section>
    );
  }
  return (
    <FieldFrame schema={schema} path={path}>
      {boxes}
    </FieldFrame>
  );
};

const StringField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const problems = useProblems(path);
  return (
    <div className={styles.field}>
      <TextField
        className={styles.fillWidth}
        name={idOf(path)}
        id={idOf(path)}
        size="s"
        label={bare ? undefined : meta.title}
        helperMessage={bare ? undefined : meta.description}
        placeholder={meta.placeholder}
        value={typeof value === 'string' ? value : ''}
        errorMessage={problems.join(' ') || undefined}
        onChange={event =>
          onChange(
            optional && event.target.value === ''
              ? undefined
              : event.target.value
          )
        }
      />
    </div>
  );
};

const NumberField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const problems = useProblems(path);
  return (
    <div className={styles.field}>
      <TextField
        className={styles.fillWidth}
        name={idOf(path)}
        id={idOf(path)}
        size="s"
        inputType="number"
        label={meta.title}
        helperMessage={meta.description}
        value={typeof value === 'number' ? value : ''}
        errorMessage={problems.join(' ') || undefined}
        onChange={event => {
          const text = event.target.value;
          onChange(text === '' && optional ? undefined : Number(text));
        }}
      />
    </div>
  );
};

/** The text a field shows while it is edited. It is replaced only when the
    value from outside formats differently, so a partly typed value is not
    overwritten. */
function useDraft<T>(
  value: T,
  format: (value: T) => string
): [string, (text: string) => void] {
  const [draft, setDraft] = useState(() => format(value));
  const formatted = format(value);
  const [last, setLast] = useState(formatted);
  useEffect(() => {
    if (formatted !== last) {
      setLast(formatted);
      setDraft(formatted);
    }
  }, [formatted, last]);
  return [draft, setDraft];
}

const splitNames = (text: string) =>
  text
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

/** A list of names typed with commas between them. A node that takes one
    name or several keeps a lone name as a string. */
const NamesField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const {optional} = unwrap(schema);
  const takesString = namesTakeString(schema);
  const [draft, setDraft] = useDraft(value, v =>
    Array.isArray(v) ? v.join(', ') : typeof v === 'string' ? v : ''
  );
  const placeholder = metaOf(namesElementOf(schema)).placeholder;
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      <input
        id={idOf(path)}
        className={styles.input}
        value={draft}
        placeholder={placeholder ? `${placeholder}, …` : 'one, two'}
        onChange={event => {
          setDraft(event.target.value);
          const names = splitNames(event.target.value);
          if (!names.length) {
            onChange(optional ? undefined : takesString ? '' : []);
          } else if (
            takesString &&
            names.length === 1 &&
            !Array.isArray(value)
          ) {
            onChange(names[0]);
          } else {
            onChange(names);
          }
        }}
      />
      {!bare && <p className={styles.help}>Separate names with commas.</p>}
    </FieldFrame>
  );
};

const NumberListField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const {optional} = unwrap(schema);
  const [draft, setDraft] = useDraft(value, v =>
    Array.isArray(v) ? v.join(', ') : ''
  );
  return (
    <FieldFrame schema={schema} path={path}>
      <input
        id={idOf(path)}
        className={styles.input}
        value={draft}
        placeholder="0, 1"
        onChange={event => {
          setDraft(event.target.value);
          const numbers = splitNames(event.target.value).map(Number);
          onChange(numbers.length || !optional ? numbers : undefined);
        }}
      />
    </FieldFrame>
  );
};

const LinesField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const [draft, setDraft] = useDraft(value, v =>
    Array.isArray(v) ? v.join('\n') : ''
  );
  return (
    <FieldFrame schema={schema} path={path}>
      <textarea
        id={idOf(path)}
        className={classNames(styles.textarea, styles.mono)}
        rows={Math.max(3, draft.split('\n').length)}
        value={draft}
        onChange={event => {
          setDraft(event.target.value);
          onChange(event.target.value.split('\n'));
        }}
      />
    </FieldFrame>
  );
};

const TextAreaField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      <textarea
        id={idOf(path)}
        className={styles.textarea}
        rows={2}
        placeholder={meta.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={event =>
          onChange(
            optional && event.target.value === ''
              ? undefined
              : event.target.value
          )
        }
      />
      <p className={styles.help}>Markdown.</p>
    </FieldFrame>
  );
};

/** A choice for a reference field: the value written, and what is shown. */
export interface ReferenceOption {
  value: string;
  label: string;
}

/** The choices a reference field's `options` names (schemaMeta.ts), from
    the whole value or, after `..`, from near the field at `path`. Each
    choice is labeled with its item's title when it has one. */
export function referenceOptions(
  root: unknown,
  pattern: string,
  path: Path = [],
  supplied: Record<string, ReferenceOption[]> = {}
): ReferenceOption[] {
  if (pattern.startsWith('@')) {
    return supplied[pattern.slice(1)] ?? [];
  }
  // Each leading "../" climbs one step from the field; without one the
  // place is in the whole value.
  let rest = pattern;
  let base: Path = rest.startsWith('../') ? path : [];
  while (rest.startsWith('../')) {
    base = base.slice(0, -1);
    rest = rest.slice(3);
  }
  const parts = rest.split('.').filter(part => part !== '');
  let start: unknown = root;
  base.forEach(step => {
    start =
      start && typeof start === 'object'
        ? (start as Record<string, unknown>)[step]
        : undefined;
  });
  const children = (value: unknown, part: string): [string, unknown][] => {
    if (!value || typeof value !== 'object') {
      return [];
    }
    return part === '*'
      ? Object.entries(value as object)
      : [[part, (value as Record<string, unknown>)[part]]];
  };
  // Each step keeps the node reached and the item it belongs to, so a
  // choice can be labeled with that item's title.
  let nodes: {key: string; value: unknown; item: unknown}[] = [
    {key: '', value: start, item: undefined},
  ];
  parts.forEach(part => {
    nodes = nodes.flatMap(node =>
      children(node.value, part).map(([key, value]) => ({
        key,
        value,
        item: part === '*' ? value : node.item,
      }))
    );
  });
  const lastIsStar = parts[parts.length - 1] === '*';
  return nodes
    .map(node => {
      // A list of names gives its names; a map or a list of items gives
      // its keys or indexes.
      const name =
        lastIsStar &&
        (typeof node.value === 'object' || node.value === undefined)
          ? node.key
          : String(node.value ?? '');
      const title = summaryOf(node.item);
      return {
        value: name,
        label: title && title !== name ? `${name}: ${title}` : name,
      };
    })
    .filter(option => option.value);
}

/** The choices a field's `options` or `keyOptions` names, where it is. */
function useReferenceOptions(
  pattern: string | undefined,
  path: Path
): ReferenceOption[] {
  const {root, suppliedOptions} = useContext(Context);
  return pattern ? referenceOptions(root, pattern, path, suppliedOptions) : [];
}

/** A field whose choices come from elsewhere in the value (`options`):
    checkboxes for a list, a menu for a single value. A value that is not
    among the choices is kept and shown as not found. With no choices at
    all it is a text field. */
const ReferenceField: React.FunctionComponent<FieldProps> = props => {
  const {schema, value, onChange, path, bare} = props;
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const options = useReferenceOptions(meta.options, path);
  // A field that takes one name or several (namesTakeString) is ticked like
  // a list, and keeps a lone name as a string.
  const takesString = namesTakeString(schema);
  const many = takesString || defOf(unwrap(schema).inner).type === 'array';
  // Choices are names; a field of numbers (such as step numbers) stores
  // them as numbers.
  const element = takesString
    ? namesElementOf(schema)
    : many
    ? elementOf(schema)
    : schema;
  const numeric = defOf(unwrap(element).inner).type === 'number';
  const stored = (name: string) => (numeric ? Number(name) : name);
  if (!options.length) {
    return many ? <NamesField {...props} /> : <StringField {...props} />;
  }
  if (many) {
    const chosen = (
      Array.isArray(value)
        ? value
        : typeof value === 'string' && value
        ? [value]
        : []
    ).map(String);
    const missing = chosen.filter(
      name => !options.some(option => option.value === name)
    );
    return (
      <FieldFrame schema={schema} path={path} bare={bare}>
        <div className={styles.inline}>
          {options.map(option => (
            <Checkbox
              key={option.value}
              name={`${idOf(path)}-${option.value}`}
              checked={chosen.includes(option.value)}
              size="s"
              label={option.label}
              onChange={event => {
                const next = event.target.checked
                  ? [...chosen, option.value]
                  : chosen.filter(name => name !== option.value);
                if (!next.length) {
                  onChange(optional ? undefined : takesString ? '' : []);
                } else if (
                  takesString &&
                  next.length === 1 &&
                  !Array.isArray(value)
                ) {
                  onChange(next[0]);
                } else {
                  onChange(next.map(stored));
                }
              }}
            />
          ))}
        </div>
        {missing.length > 0 && (
          <ProblemList
            problems={[`Not found, kept as it is: ${missing.join(', ')}`]}
          />
        )}
      </FieldFrame>
    );
  }
  const current = value === undefined || value === null ? '' : String(value);
  const known = !current || options.some(option => option.value === current);
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      <SimpleDropdown
        name={idOf(path)}
        id={idOf(path)}
        labelText={meta.title ?? ''}
        isLabelVisible={false}
        size="s"
        items={[
          ...(optional || !current
            ? [{value: NOT_SET, text: '(not set)'}]
            : []),
          ...(known ? [] : [{value: current, text: `${current} (not found)`}]),
          ...options.map(option => ({value: option.value, text: option.label})),
        ]}
        selectedValue={current}
        onChange={event =>
          onChange(
            event.target.value === NOT_SET
              ? undefined
              : stored(event.target.value)
          )
        }
      />
    </FieldFrame>
  );
};

/** A value the schema fixes: shown, or a box to tick when it is optional. */
const LiteralField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const meta = metaAt(schema, path);
  if (unwrap(schema).optional) {
    return (
      <div className={styles.field}>
        <Checkbox
          name={idOf(path)}
          checked={!isUnset(value)}
          size="s"
          label={meta.title ?? ''}
          onChange={event =>
            onChange(event.target.checked ? startValue(schema) : undefined)
          }
        />
        {meta.description && <p className={styles.help}>{meta.description}</p>}
        <ProblemsAt path={path} />
      </div>
    );
  }
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      <code id={idOf(path)}>{JSON.stringify(value)}</code>
    </FieldFrame>
  );
};

/** Blockly's own forms and anything else the schema cannot describe. */
const JsonField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
  bare,
}) => {
  const {optional} = unwrap(schema);
  const [draft, setDraft] = useDraft(value, v =>
    v === undefined ? '' : JSON.stringify(v, null, 2)
  );
  const [error, setError] = useState<string>();
  return (
    <FieldFrame schema={schema} path={path} bare={bare}>
      <textarea
        id={idOf(path)}
        className={classNames(styles.textarea, styles.mono)}
        rows={Math.min(16, Math.max(3, draft.split('\n').length))}
        value={draft}
        placeholder="JSON"
        onChange={event => {
          const text = event.target.value;
          setDraft(text);
          if (text.trim() === '' && optional) {
            setError(undefined);
            onChange(undefined);
            return;
          }
          try {
            onChange(JSON.parse(text));
            setError(undefined);
          } catch (e) {
            setError(`Not JSON yet: ${(e as Error).message}`);
          }
        }}
      />
      {error && <ProblemList problems={[error]} />}
    </FieldFrame>
  );
};
