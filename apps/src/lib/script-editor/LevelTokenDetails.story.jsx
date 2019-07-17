import React from 'react';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from './LevelTokenDetails';
import {action} from '@storybook/addon-actions';

const levelKeyList = {
  1: 'Level One',
  2: 'Level Two',
  3: 'Level Three'
};

const defaultLevel = {
  position: 1,
  kind: 'puzzle',
  ids: [2],
  activeId: 2,
  named: true
};

export default storybook => {
  storybook.storiesOf('LevelTokenDetails', module).addStoryTable([
    {
      name: 'level token details',
      story: () => (
        <div style={{width: 800}}>
          <LevelTokenDetails
            levelKeyList={levelKeyList}
            chooseLevelType={action('chooseLevelType')}
            chooseLevel={action('chooseLevel')}
            addVariant={action('addVariant')}
            setActiveVariant={action('setActiveVariant')}
            setField={action('setField')}
            level={defaultLevel}
            stagePosition={1}
          />
        </div>
      )
    }
  ]);
};
