import Modal from '@code-dot-org/component-library/modal';
import React, {useState} from 'react';

import {updateSkill} from './SkillsApi';
import {Skill} from './types';

interface SkillsEditDialogProps {
  isOpen: boolean;
  skill: Skill;
  onClose: () => void;
}

const SkillsEditDialog: React.FC<SkillsEditDialogProps> = ({
  isOpen,
  skill,
  onClose,
}) => {
  const [editedSkill, setEditedSkill] = useState<Skill>(skill || {});
  if (!isOpen) return null;

  const handleSave = () => {
    updateSkill(editedSkill.id, editedSkill);
    onClose();
    window.location.reload();
  };

  const getInputForm = () => {
    return (
      <form>
        <label htmlFor="edit-skill-key" className="skills-modal-label">
          Skill Key:
        </label>
        <input
          id="edit-skill-key"
          type="text"
          value={editedSkill?.key ?? ''}
          onChange={e => setEditedSkill({...editedSkill, key: e.target.value})}
          className="skills-modal-input"
        />
        <label htmlFor="edit-skill-concept" className="skills-modal-label">
          Concept:
        </label>
        <input
          id="edit-skill-concept"
          type="text"
          value={editedSkill?.concept ?? ''}
          onChange={e =>
            setEditedSkill({...editedSkill, concept: e.target.value})
          }
          className="skills-modal-input"
        />
        <label htmlFor="edit-skill-description" className="skills-modal-label">
          Description:
        </label>
        <input
          id="edit-skill-description"
          type="text"
          value={editedSkill?.description ?? ''}
          onChange={e =>
            setEditedSkill({
              ...editedSkill,
              description: e.target.value,
            })
          }
          className="skills-modal-input"
        />
        <label
          htmlFor="edit-skill-evaluation-criteria"
          className="skills-modal-label"
        >
          Evaluation Criteria:
        </label>
        <input
          id="edit-skill-evaluation-criteria"
          type="text"
          value={editedSkill?.evaluationCriteria ?? ''}
          onChange={e =>
            setEditedSkill({
              ...editedSkill,
              evaluationCriteria: e.target.value,
            })
          }
          className="skills-modal-input"
        />
      </form>
    );
  };

  return (
    <Modal
      onClose={onClose}
      title="Edit Skill"
      primaryButtonProps={{onClick: handleSave, text: 'Save'}}
      customContent={getInputForm()}
    />
  );
};

export default SkillsEditDialog;
