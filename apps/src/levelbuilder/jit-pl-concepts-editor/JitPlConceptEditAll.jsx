import {TextLink} from '@dsco_/link';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Dialog, {
  Title as DialogTitle,
} from '@cdo/apps/legacySharedComponents/Dialog';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

const JitPlConceptEditAll = props => {
  const {jitPlConcepts: initialConcepts} = props;
  const [concepts, setConcepts] = useState(initialConcepts);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const initiateDelete = id => {
    setPendingDeleteId(id);
    setShowDeleteDialog(true);
  };

  const deleteConcept = () => {
    $.ajax({
      url: `/jit_pl_concepts/${pendingDeleteId}`,
      method: 'DELETE',
      success: () => deleteCleanup(),
      error: (xhr, ajaxOptions, thrownError) => {
        if (xhr.status === 404) {
          deleteCleanup();
        }
      },
    });
  };

  const deleteCleanup = () => {
    setConcepts([...concepts.filter(c => c.id !== pendingDeleteId)]);
    setShowDeleteDialog(false);
    setPendingDeleteId(null);
  };

  const pendingConcept = concepts.find(c => c.id === pendingDeleteId);

  return (
    <div>
      <h1 style={{marginBottom: 30}}>JIT PL Concepts</h1>
      <div className="page-actions">
        <TextLink
          className="create-btn"
          id="create_new_jit_pl_concept"
          icon={<FontAwesome icon="plus" />}
          iconBefore={true}
          href="/jit_pl_concepts/new"
          text="Create New JIT PL Concept"
        />
      </div>
      {showDeleteDialog && (
        <Dialog
          body={
            <DialogTitle>{`Are you sure you want to permanently delete "${pendingConcept?.name}"?`}</DialogTitle>
          }
          cancelText="Cancel"
          confirmText="Delete"
          confirmType="danger"
          isOpen={true}
          handleClose={() => setShowDeleteDialog(false)}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={() => deleteConcept()}
        />
      )}
      <div
        className="guides-table"
        style={{gridTemplateColumns: '100px 1fr 1fr'}}
      >
        <span className="header">Actions</span>
        <span className="header">Name</span>
        <span className="header">Display Name</span>
        {concepts.map(concept => (
          <React.Fragment key={concept.id}>
            <div className="actions-box">
              <TextLink
                id={`edit_${concept.id}`}
                icon={<FontAwesome icon="pencil-square-o" title="edit" />}
                href={`/jit_pl_concepts/${concept.id}/edit`}
              />
              <TextLink
                id={`delete_${concept.id}`}
                icon={<FontAwesome icon="trash" title="delete" />}
                onClick={() => initiateDelete(concept.id)}
              />
            </div>
            <div className="guide-box">{concept.name}</div>
            <div className="guide-box">{concept.display_name}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

JitPlConceptEditAll.propTypes = {
  jitPlConcepts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string,
      display_name: PropTypes.string,
      text_content: PropTypes.string,
    })
  ),
};

export default JitPlConceptEditAll;
