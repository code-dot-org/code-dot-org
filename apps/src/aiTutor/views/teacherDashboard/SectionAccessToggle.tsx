import Checkbox from '@code-dot-org/component-library/checkbox';
import Toggle from '@code-dot-org/component-library/toggle';
import {
  Heading4,
  BodyThreeText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useState, useEffect} from 'react';

import InfoTooltipIcon from '@cdo/apps/aichat/views/InfoTooltipIcon';
import {handleUpdateSectionAITutorEnabled} from '@cdo/apps/aiTutor/accessControlsApi';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {updateSectionAiTutorEnabled} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import style from '@cdo/apps/aiTutor/views/teacherDashboard/ai-tutor-access-controls.module.scss';

interface SectionAccessToggleProps {
  sectionId: number;
}

const SectionAccessToggle: React.FC<SectionAccessToggleProps> = ({
  sectionId,
}) => {
  const sectionList = useAppSelector(state => state.teacherSections.sections);

  const [aiTutorEnabled, setAiTutorEnabled] = useState(
    sectionList[sectionId].aiTutorEnabled
  );

  const dispatch = useAppDispatch();

  const handleAITutorEnabledToggle = () => {
    const newValue = !aiTutorEnabled;
    handleUpdateSectionAITutorEnabled(sectionId, newValue);
    setAiTutorEnabled(newValue);
    const event = aiTutorEnabled
      ? EVENTS.AI_TUTOR_DISABLED
      : EVENTS.AI_TUTOR_ENABLED;
    analyticsReporter.sendEvent(event, {
      sectionId: sectionId,
      uiLocation: 'aiTutorTeacherDashboardTab',
    });
    if (sectionList[sectionId]) {
      dispatch(
        updateSectionAiTutorEnabled({sectionId, aiTutorEnabled: newValue})
      );
    } else {
      throw new Error('Section does not exist');
    }
  };

  useEffect(() => {
    setAiTutorEnabled(sectionList[sectionId].aiTutorEnabled);
  }, [sectionList, sectionId]);

  return (
    <div>
      <Heading4 noMargin={true}>
        {i18n.aiSettingsClassSectionSettings()}
      </Heading4>
      <BodyThreeText className={style.subHeader}>
        {i18n.aiSettingsClassSectionSubtitle()}
      </BodyThreeText>
      <div className={classNames(style.rowContainer, style.withBorderTop)}>
        <BodyTwoText noMargin className={style.semiBold}>
          {i18n.aiSettingsAiChatTools()}
        </BodyTwoText>
        {!aiTutorEnabled && (
          <div className={style.toolTipContainer}>
            <Checkbox
              label={i18n.aiSettingsAllowEssentialOnly()}
              name="section_essential_ai_checkbox"
              onChange={() => {}}
              checked={false}
            />
            <InfoTooltipIcon
              id={'section-essential-ai-checkbox-info'}
              tooltipText={i18n.aiSettingsAllowEssentialOnlyTooltip()}
            />
          </div>
        )}
        <Toggle
          id={'uitest-ai-chat-tools-section-access-toggle'}
          name="aiChatToolsSectionAccessToggle"
          checked={aiTutorEnabled}
          onChange={handleAITutorEnabledToggle}
        />
      </div>
    </div>
  );
};

export default SectionAccessToggle;
