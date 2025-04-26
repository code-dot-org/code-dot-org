import React from 'react';

import Tabs, {TabModel} from '@code-dot-org/component-library/tabs';

import moduleStyles from './information.module.scss';

export interface InformationProps {
  tabs: TabModel[];
}

/**
 * Represents the generic coding workspace for a level.
 */
const Information: React.FunctionComponent<InformationProps> = ({tabs}) => {
  return (
    <div className={moduleStyles.informationContainer}>
      <Tabs
        name="workspaceInformation"
        tabs={tabs}
        tabsContainerClassName={moduleStyles.tabs}
        tabPanelsContainerClassName={moduleStyles.tabPanels}
      />
    </div>
  );
};

export default Information;
