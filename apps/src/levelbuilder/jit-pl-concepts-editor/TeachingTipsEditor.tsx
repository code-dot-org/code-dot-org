import $ from 'jquery';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import ResourcesEditor from '@cdo/apps/levelbuilder/lesson-editor/ResourcesEditor';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import {getStore, hasReducer, registerReducers} from '@cdo/apps/redux';

import moduleStyles from './jitPlConceptsEditor.module.scss';

interface Resource {
  id: number;
  key: string;
  name: string;
  url: string;
  type?: string;
  audience?: string;
}

export interface TeachingTip {
  id: number;
  name?: string;
  text_content?: string;
  resources?: Resource[];
}

interface TeachingTipFormProps {
  conceptId: number;
  initial: TeachingTip | null;
  onSave: (tip: TeachingTip) => void;
  onCancel: () => void;
}

const TeachingTipForm: React.FC<TeachingTipFormProps> = ({
  conceptId,
  initial,
  onSave,
  onCancel,
}) => {
  const contextKey = `jitPlTeachingTipResource_${initial?.id ?? 'new'}`;
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
  const [textContent, setTextContent] = useState(initial?.text_content ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `/jit_pl_concepts/${conceptId}/jit_pl_teaching_tips`;

  const save = () => {
    setIsSaving(true);
    const isNew = !initial;
    $.ajax({
      url: isNew ? baseUrl : `${baseUrl}/${initial!.id}`,
      method: isNew ? 'POST' : 'PUT',
      data: {
        name,
        text_content: textContent,
        resource_ids: resources.map(r => r.id),
      },
    })
      .done((data: TeachingTip) => onSave(data))
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

interface TeachingTipItemProps {
  tip: TeachingTip;
  conceptId: number;
  onUpdate: (tip: TeachingTip) => void;
  onDelete: (id: number) => void;
}

const TeachingTipItem: React.FC<TeachingTipItemProps> = ({
  tip,
  conceptId,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updated: TeachingTip) => {
    setIsEditing(false);
    onUpdate(updated);
  };

  const handleDelete = () => {
    if (!confirm(`Delete teaching tip "${tip.name}"?`)) {
      return;
    }
    $.ajax({
      url: `/jit_pl_concepts/${conceptId}/jit_pl_teaching_tips/${tip.id}`,
      method: 'DELETE',
    }).done(() => onDelete(tip.id));
  };

  if (isEditing) {
    return (
      <TeachingTipForm
        conceptId={conceptId}
        initial={tip}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={moduleStyles.card}>
      <strong>{tip.name}</strong>
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

interface TeachingTipsEditorProps {
  conceptId: number;
  initialTeachingTips?: TeachingTip[];
}

const TeachingTipsEditor: React.FC<TeachingTipsEditorProps> = ({
  conceptId,
  initialTeachingTips,
}) => {
  const [tips, setTips] = useState<TeachingTip[]>(initialTeachingTips ?? []);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (created: TeachingTip) => {
    setTips(prev => [...prev, created]);
    setIsAdding(false);
  };

  const handleUpdate = (updated: TeachingTip) => {
    setTips(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const handleDelete = (id: number) => {
    setTips(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      {tips.map(tip => (
        <TeachingTipItem
          key={tip.id}
          tip={tip}
          conceptId={conceptId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
      {isAdding ? (
        <TeachingTipForm
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
          + Add Teaching Tip
        </button>
      )}
    </div>
  );
};

export default TeachingTipsEditor;
