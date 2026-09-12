// The tutor has rewritten some files. Keep them, or put them back.
//
// Ported from `apps/src/aiComponentLibrary/aiTutorVersionActions`, including
// the shape of the decision: Accept is TWO steps, because accepting saves a
// version and a version wants a name. Reject is one, because undoing something
// you did not ask for should not require a form.
//
// The files are named and not shown. The student is looking at them — the host
// applied the edits when the offer arrived, and the workspace is showing the
// result — so a second copy in the chat would be the same content twice, once
// unreadably.

import {Button as MuiButton} from '@mui/material';
import {useEffect, useRef, useState, type FC} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {TutorProposal} from '../response/proposal';

import moduleStyles from './proposal-actions.module.scss';

export interface ProposalActionsProps {
  proposal: TutorProposal;
  onAccept: (description: string) => void;
  onReject: () => void;
}

export const ProposalActions: FC<ProposalActionsProps> = ({
  proposal,
  onAccept,
  onReject,
}) => {
  const [naming, setNaming] = useState(false);
  const [description, setDescription] = useState('');
  const field = useRef<HTMLInputElement | null>(null);

  // Focus moves to the field when it appears, because it appeared in response
  // to the student pressing Accept — leaving focus behind would make them hunt
  // for the thing they just asked for. Done here rather than with `autoFocus`,
  // which fires on mount whether or not anyone asked, and which is what the
  // accessibility rule against it is about.
  useEffect(() => {
    if (naming) {
      field.current?.focus();
    }
  }, [naming]);

  return (
    <div className={moduleStyles.actions}>
      <ul className={moduleStyles.files}>
        {proposal.files.map(file => (
          <li key={file.path} className={moduleStyles.chip}>
            <FontAwesomeV6Icon iconName="file" />
            <span>{file.path}</span>
          </li>
        ))}
      </ul>

      {naming ? (
        <div className={moduleStyles.naming}>
          <label className={moduleStyles.field}>
            <span className={moduleStyles.label}>What did you change?</span>
            <input
              ref={field}
              type="text"
              value={description}
              onChange={event => setDescription(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && description.trim()) {
                  onAccept(description.trim());
                }
              }}
            />
          </label>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            type="button"
            // A version with no description is a version nobody can find
            // later, which is most of what a history is for.
            disabled={description.trim() === ''}
            onClick={() => onAccept(description.trim())}
          >
            Save
          </MuiButton>
        </div>
      ) : (
        <div className={moduleStyles.buttons}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            type="button"
            onClick={onReject}
          >
            Reject
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            type="button"
            onClick={() => setNaming(true)}
          >
            Accept
          </MuiButton>
        </div>
      )}
    </div>
  );
};

export default ProposalActions;
