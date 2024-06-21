import React from 'react';

import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import SetupCustomization from './modelCustomization/SetupCustomization';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import PublishNotes from './modelCustomization/PublishNotes';
import styles from './model-customization-workspace.module.scss';
import {isVisible, isDisabled} from './modelCustomization/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useSelector} from 'react-redux';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const {
    temperature,
    systemPrompt,
    retrievalContexts,
    modelCardInfo,
    selectedModelId,
  } = useAppSelector(state => state.aichat.fieldVisibilities);

  const isReadOnly = useSelector(isReadOnlyWorkspace);

  const hidePresentationPanel = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.hidePresentationPanel
  );

  const showSetupCustomization =
    isVisible(temperature) ||
    isVisible(systemPrompt) ||
    isVisible(selectedModelId);
  const isSetupCustomizationReadOnly =
    isDisabled(temperature) &&
    isDisabled(systemPrompt) &&
    isDisabled(selectedModelId);

  const iconValue: FontAwesomeV6IconProps = {
    iconName: 'lock',
    iconStyle: 'solid',
  };
  const setupCustomizationIcon =
    isSetupCustomizationReadOnly || isReadOnly ? iconValue : undefined;
  const retrievalIcon =
    isDisabled(retrievalContexts) || isReadOnly ? iconValue : undefined;
  const publishIcon =
    isDisabled(modelCardInfo) || isReadOnly ? iconValue : undefined;

  const viewOnlyTooltip = {
    text: 'View Only',
    tooltipId: 'viewOnlyTooltip',
    direction: 'onLeft',
  };
  const visibleTabs = [];
  if (showSetupCustomization) {
    visibleTabs.push({
      value: 'setup',
      text: 'Setup',
      tabContent: <SetupCustomization />,
      iconLeft: setupCustomizationIcon,
      tooltip: viewOnlyTooltip,
    });
  }
  if (isVisible(retrievalContexts)) {
    visibleTabs.push({
      value: 'retrieval',
      text: 'Retrieval',
      tabContent: <RetrievalCustomization />,
      iconLeft: retrievalIcon,
      tooltip: viewOnlyTooltip,
    });
  }
  if (isVisible(modelCardInfo) && !hidePresentationPanel) {
    visibleTabs.push({
      value: 'modelCardInfo',
      text: 'Publish',
      tabContent: <PublishNotes />,
      iconLeft: publishIcon,
      tooltip: viewOnlyTooltip,
    });
  }

  const tabArgs: TabsProps = {
    name: 'modelCustomizationTabs',
    tabs: visibleTabs,
    defaultSelectedTabValue: visibleTabs[0].value,
    onChange: () => null,
    type: 'secondary',
    size: 'l',
  };
  console.log('defaultSelectedTabValue', tabArgs.defaultSelectedTabValue);
  console.log('visibleTabs', visibleTabs);

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs {...tabArgs} />
    </div>
  );
};

export default ModelCustomizationWorkspace;
