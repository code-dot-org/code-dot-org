/**
 * A button that opens our LessonLockDialog component
 */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import LessonLockDialog from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDialog';
import i18n from '@cdo/locale';

const LessonLock = ({unitId, lessonId, isHidden}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div style={styles.main}>
      <div style={styles.buttonContainer} className="uitest-locksettings">
        <MuiButton
          size="small"
          variant="outlined"
          color="secondary"
          sx={styles.button}
          onClick={() => setDialogOpen(true)}
        >
          <FontAwesomeV6Icon iconName="lock" />
          {i18n.lockSettings()}
        </MuiButton>
      </div>
      {dialogOpen && (
        <LessonLockDialog
          unitId={unitId}
          lessonId={lessonId}
          lessonIsHidden={isHidden}
          handleClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

LessonLock.propTypes = {
  unitId: PropTypes.number.isRequired,
  lessonId: PropTypes.number.isRequired,
  isHidden: PropTypes.bool,
};

const styles = {
  main: {
    marginTop: 5,
  },
  buttonContainer: {
    marginLeft: 15,
    marginRight: 15,
  },
  // Using 'margin' instead of 'marginTop' intentionally to override styling
  button: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '100%',
    margin: '5px 0px 0px 0px',
  },
};

export default LessonLock;
