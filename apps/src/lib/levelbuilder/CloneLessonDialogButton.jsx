import PropTypes from 'prop-types';
import React, {useState} from 'react';

import CloneLessonDialog from '@cdo/apps/lib/levelbuilder/unit-editor/CloneLessonDialog';
import Button, {ButtonColor} from '@cdo/apps/templates/Button';

export default function CloneLessonDialogButton(props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const onClick = () => setIsOpen(true);

  const lessonId = isOpen ? props.lessonId : undefined;
  return (
    <div>
      <Button
        color={ButtonColor.white}
        text={props.buttonText}
        style={styles.button}
        onClick={onClick}
      />
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
  buttonText: PropTypes.string.isRequired,
};

const styles = {
  button: {
    height: 23,
    padding: 5,
    margin: 0,
  },
};
