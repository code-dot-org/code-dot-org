import React from 'react';
// @ts-expect-error (lfm) because old react-tooltip version is untyped. Will update soon.
import ReactTooltip from 'react-tooltip';

import firehoseClient from '@cdo/apps/metrics/firehose';
import NoSectionCodeDialog from '@cdo/apps/templates/manageStudents/NoSectionCodeDialog';
import {LOGIN_TYPES_WITH_PASSWORD_COLUMN} from '@cdo/apps/templates/teacherDashboard/LoginTypeConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import styles from './joinLinkCopyButton.module.scss';

interface JoinLinkCopyButtonProps {
  loginType: keyof typeof SectionLoginType;
  sectionCode: string;
  sectionId: number;
  studioUrlPrefix: string;
}

export const JoinLinkCopyButton: React.FC<JoinLinkCopyButtonProps> = ({
  loginType,
  sectionCode,
  sectionId,
  studioUrlPrefix,
}) => {
  const [shouldShowDialog, setShouldShowDialog] = React.useState(false);
  const [showCopiedMsg, setShowCopiedMsg] = React.useState(false);

  const showSectionCodeDialog = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'no-section-code-link',
        data_json: JSON.stringify({
          sectionId: sectionId,
        }),
      },
      {includeUserId: true}
    );
    setShouldShowDialog(true);
  };

  const close = () => {
    setShouldShowDialog(false);
  };

  const copySectionCode = () => {
    const joinLink = `${studioUrlPrefix}/join/${sectionCode}`;
    copyToClipboard(joinLink);
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'copy-section-code-join-link',
        data_json: JSON.stringify({
          sectionId: sectionId,
        }),
      },
      {includeUserId: true}
    );
    setShowCopiedMsg(true);
    setTimeout(() => {
      setShowCopiedMsg(false);
    }, 5000);
  };

  return (LOGIN_TYPES_WITH_PASSWORD_COLUMN as string[]).includes(loginType) ? (
    <div
      className={styles.sectionCodeBox}
      data-for="section-code"
      data-tip
      onClick={copySectionCode}
    >
      {!showCopiedMsg && (
        <span>
          <span>{i18n.sectionCodeWithColon()}</span>
          <span className={styles.sectionCode}>{sectionCode}</span>
          <ReactTooltip id="section-code" role="tooltip" effect="solid">
            <div>{i18n.copySectionCodeTooltip()}</div>
          </ReactTooltip>
        </span>
      )}
      {showCopiedMsg && <span>{i18n.copySectionCodeSuccess()}</span>}
    </div>
  ) : (
    <div className={styles.sectionCodeBox}>
      {i18n.sectionCodeWithColon()}
      <span
        className={styles.sectionCodeNotApplicable}
      >{` ${i18n.notApplicable()}. `}</span>
      <span className={styles.noSectionCode}>
        <a onClick={() => showSectionCodeDialog()} id="uitest-why-link">
          {i18n.whyWithQuestionMark()}
        </a>
      </span>
      <NoSectionCodeDialog
        typeClassroom={loginType}
        handleClose={close}
        isOpen={shouldShowDialog}
      />
    </div>
  );
};
