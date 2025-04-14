import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {OverlineOneText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import NoSectionCodeDialog from '@cdo/apps/templates/manageStudents/NoSectionCodeDialog';
import {LOGIN_TYPES_WITH_PASSWORD_COLUMN} from '@cdo/apps/templates/teacherDashboard/LoginTypeConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import styles from './joinLinkCopyButton.module.scss';

interface JoinLinkCopyButtonProps {
  loginType?: keyof typeof SectionLoginType;
  sectionCode: string;
  sectionId: number;
  studioUrlPrefix: string;
}

const JoinLinkCopyButton: React.FC<JoinLinkCopyButtonProps> = ({
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

  const handleCopySectionCode = () => {
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
    analyticsReporter.sendEvent(
      EVENTS.SECTION_CARD_CLASS_CODE_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    setShowCopiedMsg(true);
    setTimeout(() => {
      setShowCopiedMsg(false);
    }, 5000);
  };

  return loginType &&
    (LOGIN_TYPES_WITH_PASSWORD_COLUMN as string[]).includes(loginType) ? (
    <div className={styles.sectionCodeBox} data-for="section-code" data-tip>
      {!showCopiedMsg && (
        <TooltipOverlay>
          <OverlineOneText className={styles.sectionCodeText}>
            <span>{i18n.sectionCodeWithColon()}</span>
            <WithTooltip
              tooltipProps={{
                tooltipId: 'section-code',
                role: 'tooltip',
                text: i18n.copySectionCodeTooltip(),
                direction: 'onLeft',
                size: 's',
                iconLeft: {iconName: 'copy'},
              }}
            >
              <a className={styles.sectionCode} onClick={handleCopySectionCode}>
                {sectionCode}
              </a>
            </WithTooltip>
          </OverlineOneText>
        </TooltipOverlay>
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

export default JoinLinkCopyButton;
