import React from 'react';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';
import {action} from '@storybook/addon-actions';

const levelKeyList = {
  1: 'Level One',
  2: 'Level Two',
  3: 'Level Three',
  4: 'blockly:Studio:playlab_1'
};

const levelNameToIdMap = {
  'Level One': 1,
  'Level Two': 2,
  'Level Three': 3,
  'blockly:Studio:playlab_1': 4
};

const defaultLevel = {
  id: 10,
  position: 1,
  levels: [{id: 2}],
  activeId: 2
};

const blocklyLevel = {
  id: 11,
  position: 1,
  levels: [{id: 4}],
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
            levelNameToIdMap={levelNameToIdMap}
            chooseLevel={action('chooseLevel')}
            addVariant={action('addVariant')}
            removeVariant={action('removeVariant')}
            setActiveVariant={action('setActiveVariant')}
            setLevelField={action('setLevelField')}
            setScriptLevelField={action('setScriptLevelField')}
            scriptLevel={defaultLevel}
            activitySectionPosition={1}
            activityPosition={1}
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
            levelNameToIdMap={levelNameToIdMap}
            chooseLevel={action('chooseLevel')}
            addVariant={action('addVariant')}
            removeVariant={action('removeVariant')}
            setActiveVariant={action('setActiveVariant')}
            setLevelField={action('setLevelField')}
            setScriptLevelField={action('setScriptLevelField')}
            scriptLevel={blocklyLevel}
            activitySectionPosition={1}
            activityPosition={1}
          />
        </div>
      )
    }
  ]);
};
