import $ from 'jquery';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import ResourcesEditor from '@cdo/apps/levelbuilder/lesson-editor/ResourcesEditor';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import {getStore, registerReducers} from '@cdo/apps/redux';

import moduleStyles from './misconceptionsEditor.module.scss';

interface Resource {
  id: number;
  key: string;
  name: string;
  url: string;
  type?: string;
  audience?: string;
  embeddabilityType?: string;
  curriculumCategory?: string;
  assessment?: boolean;
  includeInPdf?: boolean;
  downloadUrl?: string;
  isRollup?: boolean;
}

interface Misconception {
  id: number;
  name?: string;
  text_content?: string;
  resources?: Resource[];
}

interface MisconceptionFormProps {
  conceptId: number;
  initial: Misconception | null;
  onSave: (misconception: Misconception) => void;
  onCancel: () => void;
}

const MisconceptionForm: React.FC<MisconceptionFormProps> = ({
  conceptId,
  initial,
  onSave,
  onCancel,
}) => {
  const contextKey = `jitPlMisconceptionResource_${initial?.id ?? 'new'}`;
  const initialResourcesRef = useRef(initial?.resources ?? []);

  useEffect(() => {
    registerReducers({[contextKey]: createResourcesReducer(contextKey)});
    getStore().dispatch(initResources(contextKey, initialResourcesRef.current));
  }, [contextKey]);

  const resources = useSelector(
    (state: Record<string, Resource[]>) => state[contextKey] ?? []
  );

  const [name, setName] = useState(initial?.name ?? '');
  const [textContent, setTextContent] = useState(initial?.text_content ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setIsSaving(true);
    const isNew = !initial;
    $.ajax({
      url: isNew
        ? `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions`
        : `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions/${initial!.id}`,
      method: isNew ? 'POST' : 'PUT',
      data: {
        name,
        text_content: textContent,
        resource_ids: resources.map(r => r.id),
      },
    })
      .done((data: Misconception) => onSave(data))
      .fail((err: {responseText: string}) => {
        setIsSaving(false);
        setError(err.responseText);
      });
  };

  return (
    <div className={moduleStyles.form}>
      {error && <p className={moduleStyles.error}>{error}</p>}
      <label className={moduleStyles.label}>
        Name
        <input
          className={moduleStyles.input}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <TextareaWithMarkdownPreview
        name="text_content"
        label="Text Content"
        handleMarkdownChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setTextContent(e.target.value)
        }
        markdown={textContent}
      />
      <h4 className={moduleStyles.resourcesHeading}>Resources</h4>
      <ResourcesEditor
        forJitPl
        resourceContext={contextKey}
        resources={resources}
      />
      <div className={moduleStyles.formButtons}>
        <button onClick={save} disabled={isSaving} type="button">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          type="button"
          className={moduleStyles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

interface MisconceptionItemProps {
  misconception: Misconception;
  conceptId: number;
  onUpdate: (misconception: Misconception) => void;
  onDelete: (id: number) => void;
}

const MisconceptionItem: React.FC<MisconceptionItemProps> = ({
  misconception,
  conceptId,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updated: Misconception) => {
    setIsEditing(false);
    onUpdate(updated);
  };

  const handleDelete = () => {
    if (!confirm(`Delete misconception "${misconception.name}"?`)) {
      return;
    }
    $.ajax({
      url: `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions/${misconception.id}`,
      method: 'DELETE',
    }).done(() => onDelete(misconception.id));
  };

  if (isEditing) {
    return (
      <MisconceptionForm
        conceptId={conceptId}
        initial={misconception}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={moduleStyles.card}>
      <strong>{misconception.name}</strong>
      <div className={moduleStyles.cardActions}>
        <button
          onClick={() => setIsEditing(true)}
          type="button"
          className={moduleStyles.editButton}
        >
          <i className="fa fa-edit" /> Edit
        </button>
        <button
          onClick={handleDelete}
          type="button"
          className={moduleStyles.deleteButton}
        >
          <i className="fa fa-trash" /> Delete
        </button>
      </div>
    </div>
  );
};

interface MisconceptionsEditorProps {
  conceptId: number;
  initialMisconceptions?: Misconception[];
}

const MisconceptionsEditor: React.FC<MisconceptionsEditorProps> = ({
  conceptId,
  initialMisconceptions,
}) => {
  const [misconceptions, setMisconceptions] = useState<Misconception[]>(
    initialMisconceptions ?? []
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (created: Misconception) => {
    setMisconceptions(prev => [...prev, created]);
    setIsAdding(false);
  };

  const handleUpdate = (updated: Misconception) => {
    setMisconceptions(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  const handleDelete = (id: number) => {
    setMisconceptions(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div>
      {misconceptions.map(m => (
        <MisconceptionItem
          key={m.id}
          misconception={m}
          conceptId={conceptId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
      {isAdding ? (
        <MisconceptionForm
          conceptId={conceptId}
          initial={null}
          onSave={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          type="button"
          className={moduleStyles.addButton}
        >
          + Add Misconception
        </button>
      )}
    </div>
  );
};

export default MisconceptionsEditor;
