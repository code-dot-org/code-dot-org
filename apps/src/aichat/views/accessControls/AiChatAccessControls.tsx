import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import Checkbox from '@code-dot-org/component-library/checkbox';
import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {updateSectionAiChatAccessLevel} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import {handleUpdateSectionAiChatAccessLevel} from '../../accessControlsApi';
import {AI_SETTINGS_SUPPORT_LINK} from '../../constants';
import {shouldShowAiChatEssentialAlert} from '../../helpers/aiChatAccess';
import {AiChatAccessLevel} from '../../types';
import InfoTooltipIcon from '../InfoTooltipIcon';

import style from './ai-chat-access-controls.module.scss';

/**
 * Renders toggles to control student access to AI chat features.
 * Used in Teacher Dashboard (not in lab2).
 */

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
  accessLevel: AiChatAccessLevel
): boolean => {
  return accessLevel !== AiChatAccessLevels.DISABLED;
};

const accessToggleState = (accessLevel: AiChatAccessLevel): boolean => {
  return accessLevel === AiChatAccessLevels.ENABLED;
};

const VERIFIED_TEACHER_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/115001550131-How-to-Become-a-Verified-Teacher';

const AiChatAccessControls: React.FC = () => {
  const section = useAppSelector(selectedSectionSelector);
  const teacherAiChatAccessLevel = useAppSelector(
    state => state.currentUser.aiChatAccessLevel
  );
  const isCurrentUserAccessDisabled =
    teacherAiChatAccessLevel === AiChatAccessLevels.DISABLED;
  if (!section) {
    throw new Error('Section does not exist');
  }
  const isLoadingSectionData = useAppSelector(
    state => state.teacherSections.isLoadingSectionData
  );

  const [accessToggle, setAccessToggle] = useState(
    accessToggleState(section.aiChatAccessLevel)
  );
  const [essentialOnlyCheckbox, setEssentialOnlyCheckbox] = useState(
    essentialOnlyCheckboxState(section.aiChatAccessLevel)
  );

  const shouldShowAlert = shouldShowAiChatEssentialAlert({
    assignedAiChatToolsDependency: section.assignedAiChatToolsDependency,
    sectionAiChatAccessLevel: section.aiChatAccessLevel,
    teacherAiChatAccessLevel,
  });

  const dispatch = useAppDispatch();

  const updateAccessLevel = async (newAccessLevel: AiChatAccessLevel) => {
    await handleUpdateSectionAiChatAccessLevel(section.id, newAccessLevel);
    dispatch(
      updateSectionAiChatAccessLevel({
        sectionId: section.id,
        aiChatAccessLevel: newAccessLevel,
      })
    );
    analyticsReporter.sendEvent(EVENTS.AI_CHAT_SECTION_ACCESS_LEVEL_UPDATED, {
      sectionId: section.id,
      oldAccessLevel: section.aiChatAccessLevel,
      newAccessLevel: newAccessLevel,
      courseAssigned: section.courseVersionName,
      assignedAiAccessDependency: section.assignedAiChatToolsDependency,
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
    const accessLevel = section.aiChatAccessLevel;
    setEssentialOnlyCheckbox(essentialOnlyCheckboxState(accessLevel));
    setAccessToggle(accessToggleState(accessLevel));
  }, [section]);

  return (
    <div className={style.container}>
      {isCurrentUserAccessDisabled && (
        <Alert
          text="You cannot enable AI Chat Tools. These settings will not take
              effect until you become a verified teacher."
          type={alertTypes.warning}
          link={{
            href: VERIFIED_TEACHER_SUPPORT_LINK,
            text: 'Learn how to become a verified teacher',
          }}
          icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
        />
      )}
      <div className={style.interactionsElement}>
        <Typography variant="h4">Class Section Settings</Typography>
        <Typography className={style.subHeader} variant="body3" gutterBottom>
          Control access to AI features and tools for the entire class section.
        </Typography>
        {isLoadingSectionData ? (
          <Spinner />
        ) : (
          <>
            {shouldShowAlert && (
              <Alert
                text="This class section is assigned a course that requires the use of AI tools to complete. If essential features are disabled, students won't be able to complete some levels in the assigned course."
                type={alertTypes.danger}
                link={{
                  href: AI_SETTINGS_SUPPORT_LINK,
                  text: 'Learn more',
                }}
                icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
                className={style.alert}
              />
            )}
            <div
              className={classNames(style.rowContainer, style.withBorderTop)}
            >
              <Typography className={style.semiBold} variant="body2">
                AI Chat Tools
              </Typography>
              {!accessToggle && (
                <div className={style.toolTipContainer}>
                  <Checkbox
                    label="Allow essential AI features only"
                    name="section_essential_ai_checkbox"
                    onChange={handleEssentialOnlyToggle}
                    checked={
                      isCurrentUserAccessDisabled
                        ? false
                        : essentialOnlyCheckbox
                    }
                    disabled={isCurrentUserAccessDisabled}
                  />
                  <InfoTooltipIcon
                    id="section-essential-ai-checkbox-info"
                    tooltipText="If the course you have assigned requires AI tools, this option will give students access to only the AI tools needed to complete the course."
                  />
                </div>
              )}
              <Toggle
                id="uitest-ai-chat-section-access-toggle"
                name="aiChatSectionAccessToggle"
                checked={isCurrentUserAccessDisabled ? false : accessToggle}
                onChange={handleAccessToggle}
                disabled={isCurrentUserAccessDisabled}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AiChatAccessControls;
