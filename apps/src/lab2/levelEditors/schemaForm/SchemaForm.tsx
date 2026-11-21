// A levelbuilder form drawn from a zod schema, for any Lab2 lab. Every
// node of the schema gets a control: a group gets a section, an optional
// group marked as a feature gets a switch, a list gets rows that can be
// added, moved and removed, and a choice between shapes gets a menu of
// them. A node whose `widget` names one the caller supplies is drawn by
// that widget instead.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {createContext, useContext, useEffect, useState} from 'react';
import type {ZodType} from 'zod';

import {
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
  /** The value a feature starts with when it is switched on, when the
      caller knows better than the schema; the path is joined with dots. */
  featureStart?: (path: string) => unknown;
}

const Context = createContext<FormContext>({problems: new Map(), widgets: {}});

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

/** A node's words, with a title made from its key when it has none. */
function metaAt(schema: ZodType, path: Path) {
  const meta = metaOf(schema);
  return meta.title ? meta : {...meta, title: humanize(path[path.length - 1])};
}
const idOf = (path: Path) => `schema-field-${path.join('-') || 'root'}`;

/** Collects a zod error's issues by path, for the form. */
export function problemsFrom(
  issues: {path: PropertyKey[]; message: string}[]
): Problems {
  const problems = new Map<string, string[]>();
  issues.forEach(issue => {
    const key = issue.path.map(String).join('.');
    problems.set(key, [...(problems.get(key) ?? []), issue.message]);
  });
  return problems;
}

interface SchemaFormProps {
  schema: ZodType;
  value: unknown;
  onChange: (value: unknown) => void;
  problems?: Problems;
  widgets?: Record<string, Widget>;
  featureStart?: (path: string) => unknown;
}

const SchemaForm: React.FunctionComponent<SchemaFormProps> = ({
  schema,
  value,
  onChange,
  problems = new Map(),
  widgets = {},
  featureStart,
}) => (
  <SchemaFormScope
    problems={problems}
    widgets={widgets}
    featureStart={featureStart}
  >
    <div className={styles.form}>
      <SchemaField
        schema={schema}
        value={value}
        onChange={onChange}
        path={[]}
        bare
      />
    </div>
  </SchemaFormScope>
);

export default SchemaForm;

/** The problems and widgets that SchemaFields inside it read: for a widget
    used on its own, outside a SchemaForm. */
export const SchemaFormScope: React.FunctionComponent<
  Partial<FormContext> & {children: React.ReactNode}
> = ({problems = new Map(), widgets = {}, featureStart, children}) => (
  <Context.Provider value={{problems, widgets, featureStart}}>
    {children}
  </Context.Provider>
);

/** Whether a value counts as set: an optional field holding this is
    written as absent. */
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

/** A feature's switch, and its settings once it is on. */
const FeatureSwitch: React.FunctionComponent<
  WidgetProps & {children: React.ReactNode}
> = ({schema, value, onChange, path, children}) => {
  const {featureStart} = useContext(Context);
  const meta = metaAt(schema, path);
  const on = !isUnset(value);
  return (
    <section
      className={classNames(styles.group, on && styles.groupOn)}
      aria-label={meta.title}
    >
      <Checkbox
        name={idOf(path)}
        checked={on}
        size="s"
        label={meta.feature ?? meta.title}
        onChange={event =>
          onChange(
            event.target.checked
              ? featureStart?.(keyOf(path)) ?? startValue(schema)
              : undefined
          )
        }
      />
      {meta.description && <p className={styles.help}>{meta.description}</p>}
      <ProblemsAt path={path} />
      {on && <div className={styles.children}>{children}</div>}
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
  const {featureStart} = useContext(Context);
  const meta = metaAt(schema, path);
  const {optional} = unwrap(schema);
  const problems = useProblems(path);
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
  const heading = path.length === 1 ? 'h3' : 'h4';
  return (
    <section
      className={classNames(styles.group, on && styles.groupOn)}
      aria-label={meta.title}
    >
      {optional ? (
        <Checkbox
          name={idOf(path)}
          checked={on}
          size="s"
          label={meta.feature ?? meta.title}
          onChange={event =>
            onChange(
              event.target.checked
                ? featureStart?.(keyOf(path)) ?? startValue(schema)
                : undefined
            )
          }
        />
      ) : (
        <MuiTypography
          variant={heading === 'h3' ? 'h5' : 'h6'}
          component={heading}
        >
          {meta.title}
        </MuiTypography>
      )}
      {meta.description && <p className={styles.help}>{meta.description}</p>}
      <ProblemList problems={problems} />
      {on && fields}
    </section>
  );
};

const ArrayField: React.FunctionComponent<FieldProps> = props => {
  const {schema, value, onChange, path} = props;
  const element = elementOf(schema);
  const meta = metaAt(schema, path);
  const {featureStart} = useContext(Context);
  const {optional} = unwrap(schema);
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
        <li key={index} className={styles.row}>
          <div className={styles.rowHeader}>
            <span className={styles.rowTitle}>
              {title} {index + 1}
            </span>
            <span className={styles.rowButtons}>
              <MuiButton
                size="small"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label={`Move ${title} ${index + 1} up`}
              >
                Up
              </MuiButton>
              <MuiButton
                size="small"
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={`Move ${title} ${index + 1} down`}
              >
                Down
              </MuiButton>
              <MuiButton
                size="small"
                color="error"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Remove ${title} ${index + 1}`}
              >
                Remove
              </MuiButton>
            </span>
          </div>
          <SchemaField
            schema={element}
            value={item}
            path={[...path, index]}
            bare
            onChange={next =>
              onChange(items.map((old, i) => (i === index ? next : old)))
            }
          />
        </li>
      ))}
    </ol>
  );
  const add = (
    <MuiButton
      variant="outlined"
      size="small"
      onClick={() => onChange([...items, startValue(element)])}
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
          onChange={event =>
            onChange(
              event.target.checked
                ? featureStart?.(keyOf(path)) ?? []
                : undefined
            )
          }
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

const RecordField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const entries = Object.entries((value ?? {}) as Record<string, unknown>);
  const valueSchema = recordValueOf(schema);
  const {optional} = unwrap(schema);
  const write = (next: [string, unknown][]) =>
    onChange(next.length || !optional ? Object.fromEntries(next) : undefined);
  return (
    <FieldFrame schema={schema} path={path}>
      <div className={styles.recordRows}>
        {entries.map(([key, entry], index) => (
          <div key={index} className={styles.recordRow}>
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
            <div className={styles.recordValue}>
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
          onChange={event =>
            onChange(
              event.target.checked
                ? featureStart?.(keyOf(path)) ?? startValue(options[0])
                : undefined
            )
          }
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
          onChange={event =>
            onChange(
              event.target.checked
                ? featureStart?.(keyOf(path)) ?? []
                : undefined
            )
          }
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

/** Text that is kept as typed while it is edited, and handed on whenever it
    reads as a value. */
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

/** A value the schema fixes: shown, not edited. */
const LiteralField: React.FunctionComponent<FieldProps> = ({
  schema,
  value,
  path,
  bare,
}) => (
  <FieldFrame schema={schema} path={path} bare={bare}>
    <code id={idOf(path)}>{JSON.stringify(value)}</code>
  </FieldFrame>
);

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
