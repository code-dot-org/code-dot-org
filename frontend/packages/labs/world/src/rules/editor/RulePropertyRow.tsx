// One of a rule's properties in the Rule Editor's side panel: where it
// starts, whether only the rule may set it, and a change of name or kind, or
// a delete (specs/RULE_EDITOR_PLAN.md, step 2).
//
// Said in place, as an actor's own property is (`SelfProperty`). A rename
// rewrites every block that reads or sets the property, in every file; a
// delete first says which files' code uses it.

import {Button, Typography} from '@mui/material';
import {useState, type ChangeEvent, type KeyboardEvent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {ValueField} from '../../actors/editor/ValueField';
import {fileLabel} from '../../files/fileLabel';
import type {RuleData, RuleProperty} from '../ruleData';
import {
  defaultText,
  deleteProperty,
  memberUses,
  PROPERTY_TYPES,
  propertyKey,
  propertyProblem,
  renameProperty,
  setPropertyDefault,
  setPropertyReadOnly,
  setPropertyType,
  takesDefault,
  type Owner,
} from '../ruleEdits';

import styles from './ruleEditor.module.css';

export interface RulePropertyRowProps {
  property: RuleProperty;
  owner: Owner;
  data: RuleData;
  fileId: string;
  source: MultiFileSource;
  /** A change to this rule's file alone. */
  onEdit: (data: RuleData) => void;
  /** A change to the whole project: a rename reaches other files. */
  onProject: (source: MultiFileSource) => void;
  isReadOnly: boolean;
  pictures?: readonly string[];
}

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

export const RulePropertyRow = ({
  property,
  owner,
  data,
  fileId,
  source,
  onEdit,
  onProject,
  isReadOnly,
  pictures,
}: RulePropertyRowProps) => {
  const [mode, setMode] = useState<'show' | 'change' | 'delete'>('show');
  const [draft, setDraft] = useState(property.name);
  const [kind, setKind] = useState(property.type);
  const id = `rule-${owner ?? 'own'}-${property.name}`;
  const problem =
    draft.trim() === property.name
      ? undefined
      : propertyProblem(data, draft, property.name);

  if (mode === 'change') {
    const save = () => {
      if (problem) {
        return;
      }
      const retyped =
        kind === property.type
          ? data
          : setPropertyType(data, owner, property.name, kind);
      if (draft.trim() === property.name) {
        if (retyped !== data) {
          onEdit(retyped);
        }
      } else {
        const own = source.files[fileId];
        const held: MultiFileSource =
          retyped === data
            ? source
            : {
                ...source,
                files: {
                  ...source.files,
                  [fileId]: {
                    ...own,
                    contents: JSON.stringify(retyped, null, 2),
                  },
                },
              };
        onProject(renameProperty(held, fileId, owner, property.name, draft));
      }
      setMode('show');
    };
    return (
      <div
        className={styles.add}
        role="group"
        aria-label={`Change ${property.name}`}
      >
        <TextField
          name={`${id}-name`}
          label="Name"
          size="s"
          value={draft}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value)
          }
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              save();
            } else if (event.key === 'Escape') {
              setMode('show');
            }
          }}
          errorMessage={problem}
        />
        <SimpleDropdown
          name={`${id}-kind`}
          labelText="Kind"
          size="s"
          selectedValue={kind}
          items={PROPERTY_TYPES.map(type => ({value: type, text: type}))}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setKind(event.target.value)
          }
        />
        {kind !== property.type && (
          <Typography variant="body3" component="p" className={styles.note}>
            A new kind starts again from its own default.
          </Typography>
        )}
        <div className={styles.acts}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            disabled={Boolean(problem)}
            onClick={save}
          >
            Save
          </Button>
          <Button variant="text" size="small" onClick={() => setMode('show')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'delete') {
    const uses = memberUses(
      source,
      fileId,
      data.name,
      propertyKey(property.name),
    ).map(file => fileLabel(source.files[file]));
    return (
      <div
        className={styles.add}
        role="group"
        aria-label={`Delete ${property.name}`}
      >
        <Typography variant="body3" component="p" className={styles.note}>
          {uses.length
            ? `Delete ${property.name}? The code in ${uses.join(', ')} uses it, and will stop working where it does.`
            : `Delete ${property.name}? No other file uses it.`}
        </Typography>
        <div className={styles.acts}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => {
              setMode('show');
              onEdit(deleteProperty(data, owner, property.name));
            }}
          >
            Delete
          </Button>
          <Button variant="text" size="small" onClick={() => setMode('show')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.property}>
      {takesDefault(property.type) ? (
        <ValueField
          name={id}
          label={`${capitalize(property.name)} (${property.type})`}
          type={property.type}
          value={defaultText(property)}
          isReadOnly={isReadOnly}
          pictures={pictures}
          onValue={text =>
            onEdit(setPropertyDefault(data, owner, property.name, text))
          }
        />
      ) : (
        <Typography variant="body3" component="p">
          {capitalize(property.name)} ({property.type}), starts empty
        </Typography>
      )}
      <Checkbox
        name={`${id}-readonly`}
        label={`Only this rule sets ${property.name}`}
        size="s"
        checked={property.access === 'readonly'}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onEdit(
            setPropertyReadOnly(
              data,
              owner,
              property.name,
              event.target.checked,
            ),
          )
        }
      />
      {!isReadOnly && (
        <div className={styles.acts}>
          <Button
            variant="text"
            size="extraSmall"
            aria-label={`Change ${property.name}`}
            onClick={() => {
              setDraft(property.name);
              setKind(property.type);
              setMode('change');
            }}
          >
            Change
          </Button>
          <Button
            variant="text"
            size="extraSmall"
            aria-label={`Delete ${property.name}`}
            onClick={() => setMode('delete')}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
