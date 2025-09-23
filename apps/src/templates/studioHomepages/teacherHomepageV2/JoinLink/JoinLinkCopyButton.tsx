import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {OverlineOneText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
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
  sourceName?: string;
  hidden?: boolean;
}

const JoinLinkCopyButton: React.FC<JoinLinkCopyButtonProps> = ({
  loginType,
  sectionCode,
  sectionId,
  studioUrlPrefix,
  sourceName = 'teacherHomepage',
  hidden = false,
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

  const classroomType =
    loginType === SectionLoginType.google_classroom
      ? i18n.loginTypeGoogleClassroom()
      : i18n.loginTypeClever();

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
      {source: sourceName},
      PLATFORMS.BOTH
    );
    setShowCopiedMsg(true);
    setTimeout(() => {
      setShowCopiedMsg(false);
    }, 5000);
  };

  return loginType &&
    (LOGIN_TYPES_WITH_PASSWORD_COLUMN as string[]).includes(loginType) ? (
    hidden ? (
      <OverlineOneText>
        <span>{i18n.sectionCodeWithColon()}</span>{' '}
        <span className={styles.sectionCodeTextHidden}>{sectionCode}</span>
      </OverlineOneText>
    ) : (
      <div className={styles.sectionCodeBox} data-for="section-code" data-tip>
        {!showCopiedMsg && (
          <TooltipOverlay>
            <span className={styles.sectionCodeText}>
              <OverlineOneText>
                <span>{i18n.sectionCodeWithColon()}</span>
              </OverlineOneText>
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
                <OverlineOneText>
                  <button
                    id={'ui-test-section-code-button'}
                    className={styles.sectionCode}
                    onClick={handleCopySectionCode}
                    type="button"
                  >
                    {sectionCode}
                  </button>
                </OverlineOneText>
              </WithTooltip>
            </span>
          </TooltipOverlay>
        )}
        {showCopiedMsg && <span>{i18n.copySectionCodeSuccess()}</span>}
      </div>
    )
  ) : (
    <>
      <div
        className={classNames(styles.sectionCodeBox, styles.sectionCodeText)}
        id="uitest-no-section-code"
      >
        <OverlineOneText>
          {`${i18n.sectionCodeWithColon()} ${i18n.notApplicable()}`}
          <button
            onClick={() => showSectionCodeDialog()}
            id="uitest-why-link"
            className={styles.noSectionCode}
            aria-label={i18n.whyWithQuestionMark()}
            type="button"
          >
            <FontAwesomeV6Icon iconName="question-circle" iconStyle="regular" />
          </button>
        </OverlineOneText>
      </div>
      {shouldShowDialog && (
        <Dialog
          title={i18n.noSectionDialogHeader({classroom: classroomType})}
          description={i18n.noSectionDialogBody({classroom: classroomType})}
          primaryButtonProps={{
            onClick: () => setShouldShowDialog(false),
            text: i18n.ok(),
          }}
          onClose={() => setShouldShowDialog(false)}
        />
      )}
    </>
  );
};

export default JoinLinkCopyButton;
