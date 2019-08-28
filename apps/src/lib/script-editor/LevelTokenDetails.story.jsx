import React from 'react';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from './LevelTokenDetails';
import {action} from '@storybook/addon-actions';

const levelKeyList = {
  1: 'Level One',
  2: 'Level Two',
  3: 'Level Three',
  4: 'blockly:Studio:playlab_1'
};

const defaultLevel = {
  position: 1,
  ids: [2],
  activeId: 2,
  named: true
};

const blocklyLevel = {
  position: 1,
  ids: [4],
  activeId: 4
};

export default storybook => {
  storybook.storiesOf('LevelTokenDetails', module).addStoryTable([
    {
      name: 'level token details',
      story: () => (
        <div style={{width: 800}}>
          <LevelTokenDetails
            levelKeyList={levelKeyList}
            chooseLevel={action('chooseLevel')}
            addVariant={action('addVariant')}
            removeVariant={action('removeVariant')}
            setActiveVariant={action('setActiveVariant')}
            setField={action('setField')}
            level={defaultLevel}
            stagePosition={1}
          />
        </div>
      )
    },
    {
      name: 'level token details with blockly level',
      story: () => (
        <div style={{width: 800}}>
          <LevelTokenDetails
            levelKeyList={levelKeyList}
            chooseLevel={action('chooseLevel')}
            addVariant={action('addVariant')}
            removeVariant={action('removeVariant')}
            setActiveVariant={action('setActiveVariant')}
            setField={action('setField')}
            level={blocklyLevel}
            stagePosition={1}
          />
        </div>
      )
    }
  ]);
};
