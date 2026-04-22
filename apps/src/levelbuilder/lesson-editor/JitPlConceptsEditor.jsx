import PropTypes from 'prop-types';
import React from 'react';

const JitPlConceptsEditor = ({allConcepts, selectedConceptIds, onChange}) => {
  const selectedConcepts = allConcepts.filter(c =>
    selectedConceptIds.includes(c.id)
  );
  const unselectedConcepts = allConcepts.filter(
    c => !selectedConceptIds.includes(c.id)
  );

  const handleAdd = e => {
    const id = parseInt(e.target.value);
    if (id) {
      onChange([...selectedConceptIds, id]);
      e.target.value = '';
    }
  };

  const handleRemove = id => {
    onChange(selectedConceptIds.filter(cid => cid !== id));
  };

  return (
    <div>
      <p>
        <a href="/jit_pl_concepts/edit" target="_blank" rel="noreferrer">
          Manage JIT PL Content
        </a>
      </p>
      <div style={styles.tagList}>
        {selectedConcepts.map(concept => (
          <span key={concept.id} style={styles.tag}>
            {concept.name}
            <button
              type="button"
              onClick={() => handleRemove(concept.id)}
              style={styles.removeButton}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      {unselectedConcepts.length > 0 && (
        <select onChange={handleAdd} value="" style={styles.dropdown}>
          <option value="">-- Add a JIT PL Concept --</option>
          {unselectedConcepts.map(concept => (
            <option key={concept.id} value={concept.id}>
              {concept.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

const styles = {
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    background: '#e8f0fe',
    border: '1px solid #b3c8f5',
    borderRadius: 12,
    fontSize: 13,
  },
  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: 15,
    lineHeight: 1,
    color: '#555',
  },
  dropdown: {
    marginTop: 4,
  },
};

JitPlConceptsEditor.propTypes = {
  allConcepts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string,
      display_name: PropTypes.string,
    })
  ).isRequired,
  selectedConceptIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default JitPlConceptsEditor;
