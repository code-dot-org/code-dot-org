import React, {useState} from 'react';
import PropTypes from 'prop-types';
import CloneLessonDialog from '@cdo/apps/lib/levelbuilder/unit-editor/CloneLessonDialog';

export default function CloneLessonDialogButton(props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const onClick = () => setIsOpen(true);

  const lessonId = isOpen ? props.lessonId : undefined;
  return (
    <div>
      <button type="button" onClick={onClick}>
        {props.buttonText}
      </button>
      <CloneLessonDialog
        lessonId={lessonId}
        lessonName={props.lessonName}
        handleClose={handleClose}
      />
    </div>
  );
}

CloneLessonDialogButton.propTypes = {
  lessonId: PropTypes.number.isRequired,
  lessonName: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired
};
