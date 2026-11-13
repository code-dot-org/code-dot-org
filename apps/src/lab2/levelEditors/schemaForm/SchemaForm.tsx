// Draws a form from a list of fields (describeSchema.ts). Each field edits
// one key of `value`. A field left empty removes its key, so a saved value
// holds only what the author set.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {FieldInfo} from './describeSchema';

import moduleStyles from './schema-form.module.scss';

export type FormValue = Record<string, unknown>;

interface SchemaFormProps {
  fields: FieldInfo[];
  value: FormValue;
  onChange: (value: FormValue) => void;
  /** What is wrong, by the path of the option: {"images.makes.type": "…"}. */
  problems: Record<string, string>;
  /** The path of the group these fields are in, "" at the top. */
  path?: string;
}

const NOT_SET = '';

function withKey(value: FormValue, key: string, next: unknown): FormValue {
  const rest = Object.fromEntries(
    Object.entries(value).filter(([name]) => name !== key)
  );
  return next === undefined ? rest : {...rest, [key]: next};
}

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

// A typed field keeps the author's own text while it still means the saved
// value, so a comma or a space being typed is not tidied away mid-word.
function useTypedText<T>(
  saved: T | undefined,
  toText: (saved: T | undefined) => string,
  fromText: (text: string) => unknown
) {
  const [text, setText] = useState(() => toText(saved));
  const savedText = toText(saved);
  if (JSON.stringify(fromText(text)) !== JSON.stringify(fromText(savedText))) {
    setText(savedText);
  }
  return [text, setText] as const;
}

const namesFromText = (text: string): string[] =>
  text
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

const linesFromText = (text: string): string[] =>
  text.split('\n').filter(line => line !== '');

interface FieldProps {
  field: FieldInfo;
  saved: unknown;
  name: string;
  problem?: string;
  onChange: (next: unknown) => void;
}

const Help: React.FunctionComponent<{field: FieldInfo; problem?: string}> = ({
  field,
  problem,
}) => (
  <>
    {field.description && (
      <Typography variant="body4" className={moduleStyles.help}>
        {field.description}
      </Typography>
    )}
    {problem && (
      <Typography variant="body4" className={moduleStyles.problem} role="alert">
        {problem}
      </Typography>
    )}
  </>
);

const NamesField: React.FunctionComponent<FieldProps> = ({
  field,
  saved,
  name,
  problem,
  onChange,
}) => {
  const [text, setText] = useTypedText<string[]>(
    saved as string[] | undefined,
    names => (names ?? []).join(', '),
    namesFromText
  );
  return (
    <TextField
      label={field.title}
      name={name}
      value={text}
      onChange={event => {
        setText(event.target.value);
        const names = namesFromText(event.target.value);
        onChange(names.length ? names : undefined);
      }}
      helperMessage={
        field.choices
          ? `${field.description ?? ''} One or more of: ${field.choices.join(
              ', '
            )}.`.trim()
          : `${field.description ?? ''} Separate with commas.`.trim()
      }
      errorMessage={problem}
      size="s"
    />
  );
};

// A box of text: one item to a line, or JSON.
const TextareaField: React.FunctionComponent<
  FieldProps & {
    toText: (saved: unknown) => string;
    fromText: (text: string) => unknown;
  }
> = ({field, saved, name, problem, onChange, toText, fromText}) => {
  const [text, setText] = useTypedText<unknown>(saved, toText, fromText);
  const [unreadable, setUnreadable] = useState(false);
  const id = `${name}-box`;
  return (
    <div>
      <label htmlFor={id} className={moduleStyles.label}>
        {field.title}
      </label>
      <textarea
        id={id}
        name={name}
        className={moduleStyles.textarea}
        rows={Math.max(3, text.split('\n').length)}
        value={text}
        onChange={event => {
          setText(event.target.value);
          try {
            const next = fromText(event.target.value);
            setUnreadable(false);
            onChange(isEmpty(next) ? undefined : next);
          } catch {
            setUnreadable(true);
          }
        }}
      />
      <Help
        field={field}
        problem={unreadable ? 'This is not valid JSON yet.' : problem}
      />
    </div>
  );
};

const jsonToText = (saved: unknown): string =>
  saved === undefined ? '' : JSON.stringify(saved, null, 2);
const jsonFromText = (text: string): unknown =>
  text.trim() === '' ? undefined : JSON.parse(text);

const Field: React.FunctionComponent<FieldProps> = props => {
  const {field, saved, name, problem, onChange} = props;
  switch (field.kind) {
    case 'flag':
      return (
        <div>
          <Checkbox
            name={name}
            label={field.title}
            checked={saved === true}
            // A flag that is off is the same as one not set, so only "on"
            // is stored.
            onChange={event => onChange(event.target.checked || undefined)}
            size="s"
          />
          <Help field={field} problem={problem} />
        </div>
      );
    case 'choice':
      return (
        <SimpleDropdown
          labelText={field.title}
          name={name}
          items={[
            {
              value: NOT_SET,
              text: field.optional ? 'Not set' : 'Choose one',
            },
            ...(field.choices ?? []).map(choice => ({
              value: choice,
              text: choice,
            })),
          ]}
          selectedValue={typeof saved === 'string' ? saved : NOT_SET}
          onChange={event =>
            onChange(
              event.target.value === NOT_SET ? undefined : event.target.value
            )
          }
          helperMessage={field.description}
          errorMessage={problem}
          size="s"
        />
      );
    case 'text':
      return (
        <TextField
          label={field.title}
          name={name}
          value={typeof saved === 'string' ? saved : ''}
          onChange={event => onChange(event.target.value || undefined)}
          helperMessage={field.description}
          errorMessage={problem}
          size="s"
        />
      );
    case 'number':
      return (
        <TextField
          label={field.title}
          name={name}
          inputType="number"
          value={typeof saved === 'number' ? saved : ''}
          onChange={event =>
            onChange(
              event.target.value === '' ? undefined : Number(event.target.value)
            )
          }
          helperMessage={field.description}
          errorMessage={problem}
          size="s"
        />
      );
    case 'names':
      return <NamesField {...props} />;
    case 'lines':
      return (
        <TextareaField
          {...props}
          toText={lines => ((lines as string[] | undefined) ?? []).join('\n')}
          fromText={linesFromText}
        />
      );
    default:
      return (
        <TextareaField {...props} toText={jsonToText} fromText={jsonFromText} />
      );
  }
};

const SchemaForm: React.FunctionComponent<SchemaFormProps> = ({
  fields,
  value,
  onChange,
  problems,
  path = '',
}) => (
  <>
    {fields.map(field => {
      const fieldPath = path ? `${path}.${field.key}` : field.key;
      const saved = value[field.key];
      const setField = (next: unknown) =>
        onChange(withKey(value, field.key, isEmpty(next) ? undefined : next));
      if (field.kind === 'group') {
        return (
          <fieldset key={field.key} className={moduleStyles.group}>
            <legend className={moduleStyles.groupTitle}>{field.title}</legend>
            <Help field={field} problem={problems[fieldPath]} />
            <SchemaForm
              fields={field.fields ?? []}
              value={(saved as FormValue | undefined) ?? {}}
              onChange={setField}
              problems={problems}
              path={fieldPath}
            />
          </fieldset>
        );
      }
      return (
        <div key={field.key} className={moduleStyles.field}>
          <Field
            field={field}
            saved={saved}
            name={`schema_form_${fieldPath.replace(/\./g, '_')}`}
            problem={problems[fieldPath]}
            onChange={setField}
          />
        </div>
      );
    })}
  </>
);

export default SchemaForm;
