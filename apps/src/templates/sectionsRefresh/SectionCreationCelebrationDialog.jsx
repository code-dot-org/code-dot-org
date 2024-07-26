import React, {useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';

import moduleStyles from './sections-refresh.module.scss';

const CelebrationGif = require('@cdo/static/section_creation_celebration.gif');

export default function SectionCreationCelebrationDialog() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <BaseDialog
      useUpdatedStyles
      handleClose={() => setIsOpen(false)}
      isOpen={isOpen}
    >
      <div className={moduleStyles.celebrationDialogBody}>
        <h2>{i18n.congratulations()}</h2>
        <div>{i18n.sectionCreationCelebrationDialogMessage()}</div>
        <img
          src={CelebrationGif}
          className={moduleStyles.celebrationGif}
          alt=""
        />
      </div>
      <div className={moduleStyles.celebrationDialogFooter}>
        <Button
          onClick={() => setIsOpen(false)}
          text={i18n.goToDashboard()}
          color={Button.ButtonColor.brandSecondaryDefault}
        />
      </div>
    </BaseDialog>
  );
}
