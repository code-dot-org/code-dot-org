import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {UnconnectedResourcesEditor} from '@cdo/apps/levelbuilder/lesson-editor/ResourcesEditor';
import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';

const misconceptionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  text_content: PropTypes.string,
  resources: PropTypes.arrayOf(resourceShape),
});

const MisconceptionForm = ({conceptId, initial, onSave, onCancel}) => {
  const [name, setName] = useState(initial?.name || '');
  const [textContent, setTextContent] = useState(initial?.text_content || '');
  const [resources, setResources] = useState(initial?.resources || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const addResource = (_context, resource) =>
    setResources(prev => [...prev, resource]);
  const editResource = (_context, resource) =>
    setResources(prev =>
      prev.map(r => (r.key === resource.key ? resource : r))
    );
  const removeResource = (_context, key) =>
    setResources(prev => prev.filter(r => r.key !== key));

  const save = () => {
    setIsSaving(true);
    const isNew = !initial;
    $.ajax({
      url: isNew
        ? `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions`
        : `/jit_pl_concepts/${conceptId}/jit_pl_misconceptions/${initial.id}`,
      method: isNew ? 'POST' : 'PUT',
      data: {
        name,
        text_content: textContent,
        resource_ids: resources.map(r => r.id),
      },
    })
      .done(data => onSave(data))
      .fail(err => {
        setIsSaving(false);
        setError(err.responseText);
      });
  };

  return (
    <div style={styles.form}>
      {error && <p style={styles.error}>{error}</p>}
      <label style={styles.label}>
        Name
        <input
          style={styles.input}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <TextareaWithMarkdownPreview
        name="text_content"
        label="Text Content"
        handleMarkdownChange={e => setTextContent(e.target.value)}
        markdown={textContent}
      />
      <h4 style={styles.resourcesHeading}>Resources</h4>
      <UnconnectedResourcesEditor
        forJitPl
        resourceContext="jitPlMisconceptionResource"
        resources={resources}
        addResource={addResource}
        editResource={editResource}
        removeResource={removeResource}
      />
      <div style={styles.formButtons}>
        <button onClick={save} disabled={isSaving} type="button">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel} type="button" style={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

MisconceptionForm.propTypes = {
  conceptId: PropTypes.number.isRequired,
  initial: misconceptionShape,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const MisconceptionItem = ({misconception, conceptId, onUpdate, onDelete}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = updated => {
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
    <div style={styles.card}>
      <strong>{misconception.name}</strong>
      <div style={styles.cardActions}>
        <button
          onClick={() => setIsEditing(true)}
          type="button"
          style={styles.editButton}
        >
          <i className="fa fa-edit" /> Edit
        </button>
        <button
          onClick={handleDelete}
          type="button"
          style={styles.deleteButton}
        >
          <i className="fa fa-trash" /> Delete
        </button>
      </div>
    </div>
  );
};

MisconceptionItem.propTypes = {
  misconception: misconceptionShape.isRequired,
  conceptId: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const MisconceptionsEditor = ({conceptId, initialMisconceptions}) => {
  const [misconceptions, setMisconceptions] = useState(
    initialMisconceptions || []
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = created => {
    setMisconceptions(prev => [...prev, created]);
    setIsAdding(false);
  };

  const handleUpdate = updated => {
    setMisconceptions(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  const handleDelete = id => {
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
          style={styles.addButton}
        >
          + Add Misconception
        </button>
      )}
    </div>
  );
};

MisconceptionsEditor.propTypes = {
  conceptId: PropTypes.number.isRequired,
  initialMisconceptions: PropTypes.arrayOf(misconceptionShape),
};

const styles = {
  form: {
    border: '1px solid #ddd',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
  },
  input: {
    marginTop: 4,
  },
  resourcesHeading: {
    marginTop: 12,
    marginBottom: 6,
  },
  formButtons: {
    marginTop: 12,
    display: 'flex',
    gap: 8,
  },
  cancelButton: {
    marginLeft: 8,
  },
  error: {
    color: 'red',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: 4,
    padding: '8px 12px',
    marginBottom: 8,
    background: '#fafafa',
  },
  cardActions: {
    display: 'flex',
    gap: 8,
  },
  editButton: {
    background: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: 3,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  deleteButton: {
    background: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: 3,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  addButton: {
    background: '#eee',
    border: '1px solid #ddd',
    borderRadius: 3,
    padding: 7,
    marginTop: 8,
    cursor: 'pointer',
  },
};

export default MisconceptionsEditor;
