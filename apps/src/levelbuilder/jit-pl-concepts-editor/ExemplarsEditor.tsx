import $ from 'jquery';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import ResourcesEditor from '@cdo/apps/levelbuilder/lesson-editor/ResourcesEditor';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import {getStore, hasReducer, registerReducers} from '@cdo/apps/redux';

import moduleStyles from './misconceptionsEditor.module.scss';

interface Resource {
  id: number;
  key: string;
  name: string;
  url: string;
  type?: string;
  audience?: string;
}

export interface Exemplar {
  id: number;
  name?: string;
  text_content?: string;
  code_content?: string;
  exemplar_type?: string;
  resources?: Resource[];
}

const EXEMPLAR_TYPES = ['good', 'bad', 'neutral'];

interface ExemplarFormProps {
  conceptId: number;
  misconceptionId?: number;
  initial: Exemplar | null;
  onSave: (exemplar: Exemplar) => void;
  onCancel: () => void;
}

const ExemplarForm: React.FC<ExemplarFormProps> = ({
  conceptId,
  misconceptionId,
  initial,
  onSave,
  onCancel,
}) => {
  const contextKey = `jitPlExemplarResource_${misconceptionId ?? 'concept'}_${
    initial?.id ?? 'new'
  }`;
  const initialResourcesRef = useRef(initial?.resources ?? []);

  useEffect(() => {
    if (!hasReducer(contextKey)) {
      registerReducers({[contextKey]: createResourcesReducer(contextKey)});
    }
    getStore().dispatch(initResources(contextKey, initialResourcesRef.current));
  }, [contextKey]);

  const resources = useSelector(
    (state: Record<string, Resource[]>) => state[contextKey] ?? []
  );

  const [name, setName] = useState(initial?.name ?? '');
  const [exemplarType, setExemplarType] = useState(
    initial?.exemplar_type ?? 'good'
  );
  const [textContent, setTextContent] = useState(initial?.text_content ?? '');
  const [codeContent, setCodeContent] = useState(initial?.code_content ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = misconceptionId
    ? `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions/${misconceptionId}/jit_pl_exemplars`
    : `/jit_pl_concepts/${conceptId}/jit_pl_exemplars`;

  const save = () => {
    setIsSaving(true);
    const isNew = !initial;
    $.ajax({
      url: isNew ? baseUrl : `${baseUrl}/${initial!.id}`,
      method: isNew ? 'POST' : 'PUT',
      data: {
        name,
        exemplar_type: exemplarType,
        text_content: textContent,
        code_content: codeContent,
        resource_ids: resources.map(r => r.id),
      },
    })
      .done((data: Exemplar) => onSave(data))
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
      <label className={moduleStyles.label}>
        Type
        <select
          value={exemplarType}
          onChange={e => setExemplarType(e.target.value)}
        >
          {EXEMPLAR_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <TextareaWithMarkdownPreview
        name="text_content"
        label="Text Content"
        handleMarkdownChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setTextContent(e.target.value)
        }
        markdown={textContent}
      />
      <label className={moduleStyles.label}>
        Code Content
        <textarea
          value={codeContent}
          onChange={e => setCodeContent(e.target.value)}
          rows={6}
          style={{fontFamily: 'monospace', width: '100%'}}
        />
      </label>
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

interface ExemplarItemProps {
  exemplar: Exemplar;
  conceptId: number;
  misconceptionId?: number;
  onUpdate: (exemplar: Exemplar) => void;
  onDelete: (id: number) => void;
}

const ExemplarItem: React.FC<ExemplarItemProps> = ({
  exemplar,
  conceptId,
  misconceptionId,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updated: Exemplar) => {
    setIsEditing(false);
    onUpdate(updated);
  };

  const handleDelete = () => {
    if (!confirm(`Delete exemplar "${exemplar.name}"?`)) {
      return;
    }
    const baseUrl = misconceptionId
      ? `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions/${misconceptionId}/jit_pl_exemplars`
      : `/jit_pl_concepts/${conceptId}/jit_pl_exemplars`;
    $.ajax({url: `${baseUrl}/${exemplar.id}`, method: 'DELETE'}).done(() =>
      onDelete(exemplar.id)
    );
  };

  if (isEditing) {
    return (
      <ExemplarForm
        conceptId={conceptId}
        misconceptionId={misconceptionId}
        initial={exemplar}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={moduleStyles.card}>
      <span>
        <strong>{exemplar.name}</strong>
        {exemplar.exemplar_type && (
          <span style={{marginLeft: 8, color: '#666'}}>
            [{exemplar.exemplar_type}]
          </span>
        )}
      </span>
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

interface ExemplarsEditorProps {
  conceptId: number;
  misconceptionId?: number;
  initialExemplars?: Exemplar[];
}

const ExemplarsEditor: React.FC<ExemplarsEditorProps> = ({
  conceptId,
  misconceptionId,
  initialExemplars,
}) => {
  const [exemplars, setExemplars] = useState<Exemplar[]>(
    initialExemplars ?? []
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (created: Exemplar) => {
    setExemplars(prev => [...prev, created]);
    setIsAdding(false);
  };

  const handleUpdate = (updated: Exemplar) => {
    setExemplars(prev => prev.map(e => (e.id === updated.id ? updated : e)));
  };

  const handleDelete = (id: number) => {
    setExemplars(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div>
      {exemplars.map(e => (
        <ExemplarItem
          key={e.id}
          exemplar={e}
          conceptId={conceptId}
          misconceptionId={misconceptionId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
      {isAdding ? (
        <ExemplarForm
          conceptId={conceptId}
          misconceptionId={misconceptionId}
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
          + Add Exemplar
        </button>
      )}
    </div>
  );
};

export default ExemplarsEditor;
