import Checkbox from '@code-dot-org/component-library/checkbox';
import Toggle from '@code-dot-org/component-library/toggle';
import {
  Heading4,
  BodyThreeText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import {handleUpdateSectionAiChatAccessLevel} from '../../accessControlsApi';
import {AiChatAccessLevel} from '../../types';
import InfoTooltipIcon from '../InfoTooltipIcon';

import style from './ai-chat-access-controls.module.scss';

/**
 * Renders toggles to control student access to AI chat features.
 * Used in Teacher Dashboard (not in lab2).
 *
 * TODO-AICHAT-PERMISSIONS: uncomment references to Section.aiChatAccessLevel
 * and updateSectionAiChatAccessLevel once implemented
 */

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

interface AiChatAccessControlsProps {
  sectionId: number;
}

const AiChatAccessControls: React.FC<AiChatAccessControlsProps> = ({
  sectionId,
}) => {
  const sectionList = useAppSelector(state => state.teacherSections.sections);

  const [accessToggle, setAccessToggle] = useState(
    accessToggleState(
      /*sectionList[sectionId].aiChatAccessLevel*/ defaultAccessLevel
    )
  );
  const [essentialOnlyCheckbox, setEssentialOnlyCheckbox] = useState(
    essentialOnlyCheckboxState(
      /*sectionList[sectionId].aiChatAccessLevel*/ defaultAccessLevel
    )
  );

  // const dispatch = useAppDispatch();

  const updateAccessLevel = async (newAccessLevel: AiChatAccessLevel) => {
    if (!sectionList[sectionId]) {
      throw new Error('Section does not exist');
    }

    await handleUpdateSectionAiChatAccessLevel(sectionId, newAccessLevel);
    // dispatch(
    //   updateSectionAiChatAccessLevel({
    //     sectionId,
    //     aiChatAccessLevel: newAccessLevel,
    //   })
    // );
    analyticsReporter.sendEvent(EVENTS.AI_CHAT_SECTION_ACCESS_LEVEL_UPDATED, {
      sectionId: sectionId,
      newAccessLevel: newAccessLevel,
      uiLocation: 'aiSettingsTeacherDashboardTab',
    });
  };

  const handleAccessToggle = async () => {
    const previousValue = accessToggle;
    const newValue = !accessToggle;
    setAccessToggle(newValue);
    const newAccessLevel = calculateAccessLevel(newValue, true);
    try {
      await updateAccessLevel(newAccessLevel);
      setEssentialOnlyCheckbox(true);
    } catch (error) {
      setAccessToggle(previousValue);
    }
  };

  const handleEssentialOnlyToggle = async () => {
    const previousValue = essentialOnlyCheckbox;
    const newValue = !essentialOnlyCheckbox;
    setEssentialOnlyCheckbox(newValue);
    const newAccessLevel = calculateAccessLevel(accessToggle, newValue);
    try {
      await updateAccessLevel(newAccessLevel);
    } catch (error) {
      setEssentialOnlyCheckbox(previousValue);
    }
  };

  useEffect(() => {
    const accessLevel =
      /*sectionList[sectionId].aiChatAccessLevel ||*/ defaultAccessLevel;
    setEssentialOnlyCheckbox(essentialOnlyCheckboxState(accessLevel));
    setAccessToggle(accessToggleState(accessLevel));
  }, [sectionList, sectionId]);

  return (
    <div className={style.container}>
      <div className={style.interactionsElement}>
        <Heading4 noMargin={true}>Class Section Settings</Heading4>
        <BodyThreeText className={style.subHeader}>
          Control access to AI features and tools for the entire class section.
        </BodyThreeText>
        <div className={classNames(style.rowContainer, style.withBorderTop)}>
          <BodyTwoText noMargin className={style.semiBold}>
            AI Chat Tools
          </BodyTwoText>
          {!accessToggle && (
            <div className={style.toolTipContainer}>
              <Checkbox
                label="Allow essential AI features only"
                name="section_essential_ai_checkbox"
                onChange={handleEssentialOnlyToggle}
                checked={essentialOnlyCheckbox}
              />
              <InfoTooltipIcon
                id="section-essential-ai-checkbox-info"
                tooltipText="The assigned course requires the use of AI tools. This option will give students access to only the AI tools needed to complete the assigned course."
              />
            </div>
          )}
          <Toggle
            id="uitest-ai-chat-section-access-toggle"
            name="aiChatSectionAccessToggle"
            checked={accessToggle}
            onChange={handleAccessToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default AiChatAccessControls;
