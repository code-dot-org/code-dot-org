import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

/**
 * The image dialog's Delete button: confirming swaps it for an inline
 * question.
 */
const DeleteImageButton: React.FunctionComponent<{onDelete: () => void}> = ({
  onDelete,
}) => {
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <>
      <span>Delete this image?</span>
      <MuiButton
        variant="contained"
        color="error"
        size="small"
        onClick={onDelete}
      >
        Delete
      </MuiButton>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        onClick={() => setConfirming(false)}
      >
        Keep
      </MuiButton>
    </>
  ) : (
    <MuiButton
      variant="outlined"
      color="error"
      size="small"
      onClick={() => setConfirming(true)}
    >
      Delete
    </MuiButton>
  );
};

export default DeleteImageButton;
