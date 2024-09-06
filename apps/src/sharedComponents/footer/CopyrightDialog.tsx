import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import {BodyThreeText, Heading3} from '@cdo/apps/componentLibrary/typography';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from '@cdo/apps/sharedComponents/footer/copyright-dialog.module.scss';

export interface CopyrightDialogProps {
  isOpen: boolean;
  closeModal: (e: React.ChangeEvent) => void;
}

const CopyrightDialog: React.FC<CopyrightDialogProps> = ({
  isOpen,
  closeModal,
}) => {
  const onClose = (e: React.ChangeEvent) => {
    closeModal(e);
  };

  const getDialogBody = () => {
    return (
      <div id="copyright-scroll-area">
        <Heading3>{i18n.copyright()}</Heading3>
        <hr />
        <BodyThreeText className={styles.copyrightContainer}>
          <SafeMarkdown
            markdown={i18n.copyright_thanks({
              donors_link: pegasus('about/donors'),
              partners_link: pegasus('about/partners'),
              team_link: pegasus('about/team'),
            })}
          />
          {i18n.copyright_specialRecognition()}
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
          {i18n.copyright_builtOnGithub()}
          <Link
            href="https://aws.amazon.com/what-is-cloud-computing"
            className={styles.awsLogoContainer}
          >
            <img
              src="/shared/images/Powered-By_logo-horiz_RGB.png"
              alt="Powered by AWS Cloud Computing"
              className={styles.awsLogo}
            />
          </Link>
          <SafeMarkdown
            markdown={i18n.copyright_trademark({
              current_year: new Date().getFullYear(),
              cs_discoveries: 'CS Discoveries&reg;',
            })}
          />
        </BodyThreeText>
      </div>
    );
  };

  return isOpen ? (
    <AccessibleDialog
      className={styles.copyright}
      onClose={onClose}
      closeOnClickBackdrop={true}
    >
      {getDialogBody()}
    </AccessibleDialog>
  ) : null;
};

export default CopyrightDialog;
