import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from '@cdo/apps/util/AuthenticityTokenStore';

import ChallengeDialog from './ChallengeDialog';
import {ChallengeEditData} from './types';

import moduleStyles from './challenges.module.scss';

interface ChallengesPanelProps {
  lessonId: number;
  initialChallenges: ChallengeEditData[];
}

// The Challenges section of the Tutor Deep Dive editor.
const ChallengesPanel: React.FC<ChallengesPanelProps> = ({
  lessonId,
  initialChallenges,
}) => {
  const [challenges, setChallenges] =
    useState<ChallengeEditData[]>(initialChallenges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChallengeEditData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (challenge: ChallengeEditData) => {
    setEditing(challenge);
    setDialogOpen(true);
  };

  const handleSaved = (saved: ChallengeEditData) => {
    setError(null);
    setChallenges(prev =>
      prev.some(c => c.id === saved.id)
        ? prev.map(c => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
  };

  const handleRemove = async (challenge: ChallengeEditData) => {
    if (!window.confirm(`Delete challenge "${challenge.key}"?`)) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/challenges/${challenge.id}`, {
        method: 'DELETE',
        headers: {[AUTHENTICITY_TOKEN_HEADER]: await getAuthenticityToken()},
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      setChallenges(prev => prev.filter(c => c.id !== challenge.id));
    } catch (e) {
      setError(`Failed to delete challenge: ${(e as Error).message}`);
    }
  };

  return (
    <div>
      <h3>Challenges</h3>

      {error && (
        <Typography
          variant="body3"
          component="p"
          className={moduleStyles.error}
          role="alert"
        >
          {error}
        </Typography>
      )}

      <table className={moduleStyles.table}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Question</th>
            <th>Modality</th>
            <th>Starter image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.length === 0 ? (
            <tr>
              <td colSpan={5} className={moduleStyles.empty}>
                No challenges yet.
              </td>
            </tr>
          ) : (
            challenges.map(challenge => (
              <tr key={challenge.id}>
                <td>{challenge.key}</td>
                <td>{challenge.question}</td>
                <td>{challenge.defaultModality}</td>
                <td>
                  {challenge.whiteboardStarterImageUrl ? (
                    <img
                      className={moduleStyles.thumbnail}
                      src={challenge.whiteboardStarterImageUrl}
                      alt={challenge.whiteboardStarterImageAltText ?? ''}
                    />
                  ) : (
                    <em className={moduleStyles.empty}>None</em>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={moduleStyles.actionButton}
                    aria-label={`Edit ${challenge.key}`}
                    onClick={() => openEdit(challenge)}
                  >
                    <i className="fa-solid fa-pencil" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={moduleStyles.actionButton}
                    aria-label={`Delete ${challenge.key}`}
                    onClick={() => handleRemove(challenge)}
                  >
                    <i className="fa-solid fa-trash" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button
        type="button"
        onClick={openAdd}
        className={moduleStyles.addButton}
      >
        <i className="fa-solid fa-plus" aria-hidden="true" /> Add Challenge
      </button>

      {dialogOpen && (
        <ChallengeDialog
          challenge={editing}
          lessonId={lessonId}
          onClose={() => setDialogOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ChallengesPanel;
