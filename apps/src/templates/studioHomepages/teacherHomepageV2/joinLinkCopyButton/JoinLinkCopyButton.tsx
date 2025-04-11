import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {OverlineOneText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useState} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import i18n from '@cdo/locale';

import styles from './joinLinkCopyButton.module.scss';

interface JoinLinkCopyButtonProps {
  sectionId: number;
  sectionCode: string;
  studioUrlPrefix: string;
  style?: React.CSSProperties;
  textStyles?: React.CSSProperties;
  className?: string;
}

const JoinLinkCopyButton: React.FC<JoinLinkCopyButtonProps> = ({
  sectionId,
  sectionCode,
  studioUrlPrefix,
  style = {},
  textStyles = {},
  className,
}) => {
  const [showCopiedMsg, setShowCopiedMsg] = useState(false);

  const handleCopySectionCode = () => {
    const joinLink = `${studioUrlPrefix}/join/${sectionCode}`;
    copyToClipboard(joinLink);

    console.log('lfm', {sectionId, joinLink});

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

  return (
    <div
      className={classNames(styles.sectionCodeBox, className)}
      style={style}
      data-for="section-code"
      data-tip
    >
      <TooltipOverlay>
        {!showCopiedMsg && (
          <OverlineOneText
            className={styles.sectionCodeText}
            style={textStyles}
          >
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
        )}
        {showCopiedMsg && (
          <OverlineOneText
            className={styles.sectionCodeText}
            style={textStyles}
          >
            {i18n.copySectionCodeSuccess()}
          </OverlineOneText>
        )}
      </TooltipOverlay>
    </div>
  );
};

export default JoinLinkCopyButton;
