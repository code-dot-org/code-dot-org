import React from 'react';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';
import {action} from '@storybook/addon-actions';

const defaultLevel = {
  id: '10',
  levels: [
    {
      name: 'Level One',
      id: '1',
      url: 'levels/598/edit',
      icon: 'fa-desktop',
      isUnplugged: false,
      isConceptLevel: true,
      skin: null,
      videoKey: null,
      concepts: '',
      conceptDifficulty: ''
    }
  ],
  position: 1,
  activeId: '1',
  kind: 'puzzle',
  bonus: false,
  assessment: false,
  challenge: false,
  expand: false
};

const blocklyLevel = {
  id: '11',
  position: 1,
  levels: [
    {
      id: '4',
      name: 'blockly:Studio:playlab_1',
      url: 'levels/59800/edit'
    }
  ],
  activeId: '4',
  expand: false
};

export default storybook => {
  storybook.storiesOf('LevelTokenDetails', module).addStoryTable([
    {
      name: 'level token details',
      story: () => (
        <div style={{width: 800}}>
          <LevelTokenDetails
            setScriptLevelField={action('setScriptLevelField')}
            scriptLevel={defaultLevel}
            activitySectionPosition={1}
            activityPosition={1}
            lessonExtrasAvailableForScript={true}
          />
        </div>
      )
    },
    {
      name: 'level token details with bonus disabled',
      story: () => (
        <div style={{width: 800}}>
          <LevelTokenDetails
            setScriptLevelField={action('setScriptLevelField')}
            scriptLevel={defaultLevel}
            activitySectionPosition={1}
            activityPosition={1}
            lessonExtrasAvailableForScript={false}
          />
        </div>
      )
    },
    {
      name: 'level token details with blockly level',
      story: () => (
        <div style={{width: 800}}>
          <LevelTokenDetails
            setScriptLevelField={action('setScriptLevelField')}
            scriptLevel={blocklyLevel}
            activitySectionPosition={1}
            activityPosition={1}
            lessonExtrasAvailableForScript={true}
          />
        </div>
      )
    }
  ]);
};
