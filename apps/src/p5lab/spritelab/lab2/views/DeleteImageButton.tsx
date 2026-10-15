import React, {useState} from 'react';

import moduleStyles from './image-details-dialog.module.scss';

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
      <button
        type="button"
        className={moduleStyles.dangerButton}
        onClick={onDelete}
      >
        Delete
      </button>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={() => setConfirming(false)}
      >
        Keep
      </button>
    </>
  ) : (
    <button
      type="button"
      className={moduleStyles.dangerButton}
      onClick={() => setConfirming(true)}
    >
      Delete
    </button>
  );
};

export default DeleteImageButton;
