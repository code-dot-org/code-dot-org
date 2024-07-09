import React, {useState} from 'react';
import PropTypes from 'prop-types';

import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

const CelebrationImage = require('@cdo/static/pd/EnrollmentCelebration.png');
import style from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage.module.scss';

export default function WorkshopEnrollmentCelebrationDialog({
  workshopName = 'a new workshop',
}) {
  const [isOpen, setIsOpen] = useState(true);
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={style.celebrationContainer}>
      {isOpen && (
        <AccessibleDialog onClose={onClose} closeOnClickBackdrop={true}>
          <div className={style.containerMargin}>
            <img src={CelebrationImage} alt="" />
            <div className={style.containerMargin}>
              <h2>{i18n.enrollmentCelebrationTitle()}</h2>
              <>{i18n.enrollmentCelebrationBody({workshopName})}</>
            </div>
            <Button
              onClick={onClose}
              text={i18n.enrollmentCelebrationCallToAction()}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          </div>
        </AccessibleDialog>
      )}
    </div>
  );
}

WorkshopEnrollmentCelebrationDialog.propTypes = {
  workshopName: PropTypes.string,
};
