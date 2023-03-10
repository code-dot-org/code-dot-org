import React, {useState} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import moduleStyles from './sections-refresh.module.scss';
const CelebrationGif = require('@cdo/static/section_creation_celebration.gif');

export default function CelebrationDialog() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <BaseDialog
      useUpdatedStyles
      handleClose={() => setIsOpen(false)}
      isOpen={isOpen}
    >
      <div className={moduleStyles.celebrationDialogBody}>
        <h2>Congratulations!</h2>
        <div>
          Your class sections have been saved. Next, use the teacher dashboard
          to add students to your class sections.
        </div>
        <img src={CelebrationGif} className={moduleStyles.celebrationGif} />
      </div>
    </BaseDialog>
  );
}
