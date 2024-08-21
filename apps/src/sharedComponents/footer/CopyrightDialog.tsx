import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from '@cdo/apps/sharedComponents/footer/copyright-dialog.module.scss';

export interface CopyrightDialogProps {
  onClose: () => void;
}

const CopyrightDialog: React.FC<CopyrightDialogProps> = ({isOpen, onClose}) => {
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const getDialogBody = () => {
    return (
      <div id="copyright-scroll-area">
        <h3>{i18n.copyright()}</h3>
        <hr />
        <SafeMarkdown
          markdown={i18n.copyright_thanks({
            donors_link: pegasus('about/donors'),
            partners_link: pegasus('about/partners'),
            team_link: pegasus('about/team'),
          })}
        />
        <p>{i18n.copyright_specialRecognition()}</p>
        <SafeMarkdown
          markdown={i18n.copyright_artFrom({
            current_year: new Date().getFullYear(),
          })}
        />
        <SafeMarkdown
          markdown={i18n.copyright_codeLicense({
            gnu_license_link:
              'https://www.gnu.org/licenses/old-licenses/lgpl-2.1-standalone.html',
          })}
        />
        <p>{i18n.copyright_builtOnGithub()}</p>
        <a href="https://aws.amazon.com/what-is-cloud-computing">
          <img
            src="/shared/images/Powered-By_logo-horiz_RGB.png"
            alt="Powered by AWS Cloud Computing"
            className={styles.awsLogo}
          />
        </a>
        <SafeMarkdown
          markdown={i18n.copyright_trademark({
            current_year: new Date().getFullYear(),
            cs_discoveries: 'CS Discoveries&reg;',
          })}
        />
      </div>
    );
  };

  return (
    <AccessibleDialog
      className={styles.copyright}
      onClose={handleClose}
      closeOnClickBackdrop={true}
    >
      {getDialogBody()}
    </AccessibleDialog>
  );
};

export default CopyrightDialog;
