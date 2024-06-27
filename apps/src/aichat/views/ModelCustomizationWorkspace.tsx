import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PublishNotes from './modelCustomization/PublishNotes';
import RetrievalCustomization from './modelCustomization/RetrievalCustomization';
import SetupCustomization from './modelCustomization/SetupCustomization';
import {isVisible, isDisabled} from './modelCustomization/utils';

import styles from './model-customization-workspace.module.scss';

const ModelCustomizationWorkspace: React.FunctionComponent = () => {
  const [setupTabName, setSetupTabName] = useState('Setup');
  const [retrievalTabName, setRetrievalTabName] = useState('Retrieval');
  const [publishTabName, setPublishTabName] = useState('Publish');
  const [selectedTab, setSelectedTab] = useState('setup');
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

  const visibleTabs = [];
  if (showSetupCustomization) {
    visibleTabs.push({
      value: 'setup',
      text: setupTabName,
      tabContent: <SetupCustomization />,
      iconLeft: setupCustomizationIcon,
    });
  }
  if (isVisible(retrievalContexts)) {
    visibleTabs.push({
      value: 'retrieval',
      text: retrievalTabName,
      tabContent: <RetrievalCustomization />,
      iconLeft: retrievalIcon,
    });
  }
  if (isVisible(modelCardInfo) && !hidePresentationPanel) {
    visibleTabs.push({
      value: 'modelCardInfo',
      text: publishTabName,
      tabContent: <PublishNotes />,
      iconLeft: publishIcon,
    });
  }

  const handleOnChange = (value: string) => {
    setSelectedTab(value);
  };

  const resetTabNames = () => {
    setSetupTabName('Setup');
    setRetrievalTabName('Retrieval');
    setPublishTabName('Publish');
  };

  const tabArgs: TabsProps = {
    name: 'modelCustomizationTabs',
    tabs: visibleTabs,
    defaultSelectedTabValue: visibleTabs[0].value,
    onChange: handleOnChange,
    type: 'secondary',
    tabsContainerClassName: styles.tabsContainer,
    tabPanelsContainerClassName: styles.tabPanels,
  };

  useEffect(() => {
    resetTabNames();
    if (
      selectedTab === 'setup' &&
      (isSetupCustomizationReadOnly || isReadOnly)
    ) {
      setSetupTabName('Setup (view only)');
    } else if (
      selectedTab === 'retrieval' &&
      (isDisabled(retrievalContexts) || isReadOnly)
    ) {
      setRetrievalTabName('Retrieval (view only)');
    } else if (
      selectedTab === 'modelCardInfo' &&
      (isDisabled(modelCardInfo) || isReadOnly)
    ) {
      setPublishTabName('Publish (view only)');
    }
  }, [
    setSelectedTab,
    selectedTab,
    isSetupCustomizationReadOnly,
    isReadOnly,
    retrievalContexts,
    modelCardInfo,
  ]);
  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs {...tabArgs} />
    </div>
  );
};

export default ModelCustomizationWorkspace;
