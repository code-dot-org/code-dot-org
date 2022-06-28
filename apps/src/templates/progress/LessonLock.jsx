/**
 * A button that opens our LessonLockDialog component, using our redesigned button.
 */

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import i18n from '@cdo/locale';
import LessonLockDialog from '@cdo/apps/code-studio/components/progress/LessonLockDialog';

const LessonLock = ({unitId, lessonId}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div style={styles.main}>
      <div style={styles.buttonContainer} className="uitest-locksettings">
        <Button
          __useDeprecatedTag
          onClick={() => setDialogOpen(true)}
          color={Button.ButtonColor.gray}
          text={i18n.lockSettings()}
          icon="lock"
          style={styles.button}
        />
      </div>
      {dialogOpen && (
        <LessonLockDialog
          unitId={unitId}
          lessonId={lessonId}
          handleClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

LessonLock.propTypes = {
  unitId: PropTypes.number.isRequired,
  lessonId: PropTypes.number.isRequired
};

const styles = {
  main: {
    marginTop: 5
  },
  buttonContainer: {
    marginLeft: 15,
    marginRight: 15
  },
  button: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '100%'
  }
};

export default LessonLock;
