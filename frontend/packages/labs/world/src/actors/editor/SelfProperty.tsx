// One property of an actor's own in the Actor Editor's Self group: where it
// starts, and a rename or a delete (specs/ACTOR_EDITOR_PLAN.md, step 6).
//
// Both are said in place rather than in a dialog. A rename rewrites every
// block that reads or sets the property, in every file (`selfProperties`);
// a delete first says which files' code uses it, since those blocks will
// name nothing afterwards.

import {Button, Typography} from '@mui/material';
import {useState, type ChangeEvent, type KeyboardEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileLabel} from '../../files/fileLabel';
import type {ActorData, ActorProperty} from '../actorData';

import styles from './actorEditor.module.css';
import {setPropertyDefault, takesValue} from './actorEdits';
import {
  deleteProperty,
  propertyUses,
  renameProblem,
  renameProperty,
} from './selfProperties';
import {ValueField} from './ValueField';

export interface SelfPropertyProps {
  property: ActorProperty;
  data: ActorData;
  fileId: string;
  modulePath: string;
  source: MultiFileSource;
  /** A change to this actor's file alone. */
  onEdit: (data: ActorData) => void;
  /** A change to the whole project: a rename reaches other files. */
  onProject: (source: MultiFileSource) => void;
  isReadOnly: boolean;
}

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

export const SelfProperty = ({
  property,
  data,
  fileId,
  modulePath,
  source,
  onEdit,
  onProject,
  isReadOnly,
}: SelfPropertyProps) => {
  const [mode, setMode] = useState<'show' | 'rename' | 'delete'>('show');
  const [draft, setDraft] = useState(property.name);
  const problem =
    draft.trim() === property.name
      ? undefined
      : renameProblem(data, property.name, draft);

  if (mode === 'rename') {
    const save = () => {
      if (!problem && draft.trim() !== property.name) {
        onProject(
          renameProperty(source, fileId, modulePath, property.name, draft),
        );
      }
      setMode('show');
    };
    return (
      <div className={styles.add}>
        <TextField
          name={`self-${property.name}-rename`}
          label={`Rename ${property.name}`}
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
          <Button variant="text" size="small" onClick={() => setMode('show')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'delete') {
    const uses = propertyUses(source, modulePath, property.name).map(id =>
      fileLabel(source.files[id]),
    );
    return (
      <div
        className={styles.add}
        role="group"
        aria-label={`Delete ${property.name}`}
      >
        <Typography variant="body3" component="p" className={styles.note}>
          {uses.length
            ? `Delete ${property.name}? The code in ${uses.join(', ')} uses it, and will stop working where it does.`
            : `Delete ${property.name}? No code uses it.`}
        </Typography>
        <div className={styles.acts}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => {
              setMode('show');
              onEdit(deleteProperty(data, modulePath, property.name));
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
      <ValueField
        name={`self-${property.name}`}
        label={capitalize(property.name)}
        type={property.type}
        value={
          property.type === 'vector' || property.type === 'point'
            ? `${property.value ?? 0},${property.valueY ?? 0}`
            : (property.value ?? '')
        }
        isReadOnly={isReadOnly || !takesValue(property.type)}
        onValue={text => onEdit(setPropertyDefault(data, property.name, text))}
      />
      {!isReadOnly && (
        <div className={styles.acts}>
          <Button
            variant="text"
            size="extraSmall"
            aria-label={`Rename ${property.name}`}
            onClick={() => {
              setDraft(property.name);
              setMode('rename');
            }}
          >
            Rename
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
