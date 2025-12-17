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
import {handleUpdateSectionAiChatAccessLevel} from '@cdo/apps/aiTutor/accessControlsApi';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {updateSectionAiChatAccessLevel} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {AiChatAccessLevel} from '../../types';

import style from '@cdo/apps/aiTutor/views/teacherDashboard/ai-tutor-access-controls.module.scss';

// TODO-AICHAT-PERMISSIONS: the default should be based on the curriculum assigned to the section.
const defaultAccessLevel = AiChatAccessLevels.DISABLED;

const calculateAccessLevel = (
  accessToggle: boolean,
  essentialOnlyCheckbox: boolean
): AiChatAccessLevel => {
  if (accessToggle) {
    return AiChatAccessLevels.ENABLED;
  }
  if (essentialOnlyCheckbox) {
    return AiChatAccessLevels.ESSENTIAL_ONLY;
  }
  return AiChatAccessLevels.DISABLED;
};

const essentialOnlyCheckboxState = (
  accessLevel: AiChatAccessLevel | undefined
): boolean => {
  return accessLevel !== AiChatAccessLevels.DISABLED;
};

const accessToggleState = (
  accessLevel: AiChatAccessLevel | undefined
): boolean => {
  return accessLevel === AiChatAccessLevels.ENABLED;
};

interface SectionAccessToggleProps {
  sectionId: number;
}

const SectionAccessToggle: React.FC<SectionAccessToggleProps> = ({
  sectionId,
}) => {
  const sectionList = useAppSelector(state => state.teacherSections.sections);

  const [accessToggle, setAccessToggle] = useState(
    accessToggleState(sectionList[sectionId].aiChatAccessLevel)
  );
  const [essentialOnlyCheckbox, setEssentialOnlyCheckbox] = useState(
    essentialOnlyCheckboxState(sectionList[sectionId].aiChatAccessLevel)
  );

  const dispatch = useAppDispatch();

  const updateAccessLevel = (newAccessLevel: AiChatAccessLevel) => {
    handleUpdateSectionAiChatAccessLevel(sectionId, newAccessLevel);
    analyticsReporter.sendEvent(
      EVENTS.AI_CHAT_TOOLS_SECTION_ACCESS_LEVEL_UPDATED,
      {
        sectionId: sectionId,
        newAccessLevel: newAccessLevel,
        uiLocation: 'aiSettingsTeacherDashboardTab',
      }
    );
    if (sectionList[sectionId]) {
      dispatch(
        updateSectionAiChatAccessLevel({
          sectionId,
          aiChatAccessLevel: newAccessLevel,
        })
      );
    } else {
      throw new Error('Section does not exist');
    }
  };

  const handleAccessToggle = () => {
    const newValue = !accessToggle;
    setAccessToggle(newValue);
    setEssentialOnlyCheckbox(true);
    const newAccessLevel = calculateAccessLevel(newValue, true);
    updateAccessLevel(newAccessLevel);
  };

  const handleEssentialOnlyToggle = () => {
    const newValue = !essentialOnlyCheckbox;
    setEssentialOnlyCheckbox(newValue);
    const newAccessLevel = calculateAccessLevel(accessToggle, newValue);
    updateAccessLevel(newAccessLevel);
  };

  useEffect(() => {
    const accessLevel =
      sectionList[sectionId].aiChatAccessLevel || defaultAccessLevel;
    setEssentialOnlyCheckbox(essentialOnlyCheckboxState(accessLevel));
    setAccessToggle(accessToggleState(accessLevel));
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
        {!accessToggle && (
          <div className={style.toolTipContainer}>
            <Checkbox
              label={i18n.aiSettingsEssentialOnly()}
              name="section_essential_ai_checkbox"
              onChange={handleEssentialOnlyToggle}
              checked={essentialOnlyCheckbox}
            />
            <InfoTooltipIcon
              id={'section-essential-ai-checkbox-info'}
              tooltipText={i18n.aiSettingsEssentialOnlyTooltip()}
            />
          </div>
        )}
        <Toggle
          id={'uitest-ai-chat-tools-section-access-toggle'}
          name="aiChatToolsSectionAccessToggle"
          checked={accessToggle}
          onChange={handleAccessToggle}
        />
      </div>
    </div>
  );
};

export default SectionAccessToggle;
