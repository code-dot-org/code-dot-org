import React from 'react';

import SkillsContainer from '@cdo/apps/levelbuilder/skills/SkillsContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const skillsData = getScriptData('skillsData');
  createReactRoot(
    <SkillsContainer
      canEditSkills={skillsData.canEditSkills}
      skills={skillsData.skills}
      levels={skillsData.levels}
    />,
    document.getElementById('skills')
  );
});
