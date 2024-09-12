import React, {useCallback, useMemo, useState} from 'react';
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

  const visibleTabs = useMemo(() => {
    const iconValue: FontAwesomeV6IconProps = {
      iconName: 'lock',
      iconStyle: 'solid',
    };
    const visibleTabs = [];
    if (showSetupCustomization) {
      visibleTabs.push({
        value: 'setup',
        text:
          'Setup' +
          ((isSetupCustomizationReadOnly || isReadOnly) &&
          selectedTab === 'setup'
            ? ' (view only)'
            : ''),
        tabContent: <SetupCustomization />,
        iconLeft:
          isSetupCustomizationReadOnly || isReadOnly ? iconValue : undefined,
      });
    }
    if (isVisible(retrievalContexts)) {
      visibleTabs.push({
        value: 'retrieval',
        text:
          'Retrieval' +
          ((isDisabled(retrievalContexts) || isReadOnly) &&
          selectedTab === 'retrieval'
            ? ' (view only)'
            : ''),
        tabContent: <RetrievalCustomization />,
        iconLeft:
          isDisabled(retrievalContexts) || isReadOnly ? iconValue : undefined,
      });
    }
    if (isVisible(modelCardInfo) && !hidePresentationPanel) {
      visibleTabs.push({
        value: 'modelCardInfo',
        text:
          'Publish' +
          ((isDisabled(modelCardInfo) || isReadOnly) &&
          selectedTab === 'modelCardInfo'
            ? ' (view only)'
            : ''),
        tabContent: <PublishNotes />,
        iconLeft:
          isDisabled(modelCardInfo) || isReadOnly ? iconValue : undefined,
      });
    }
    return visibleTabs;
  }, [
    hidePresentationPanel,
    isReadOnly,
    isSetupCustomizationReadOnly,
    modelCardInfo,
    retrievalContexts,
    selectedTab,
    showSetupCustomization,
  ]);

  const handleOnChange = useCallback(
    (value: string) => {
      setSelectedTab(value);
    },
    [setSelectedTab]
  );

  if (visibleTabs.length === 0) {
    return null;
  }

  const tabArgs: TabsProps = {
    name: 'modelCustomizationTabs',
    tabs: visibleTabs,
    defaultSelectedTabValue: visibleTabs[0].value,
    onChange: handleOnChange,
    type: 'secondary',
    tabsContainerClassName: styles.tabsContainer,
    tabPanelsContainerClassName: styles.tabPanels,
  };

  return (
    <div className={styles.modelCustomizationWorkspace}>
      <Tabs {...tabArgs} />
    </div>
  );
};

export default ModelCustomizationWorkspace;
