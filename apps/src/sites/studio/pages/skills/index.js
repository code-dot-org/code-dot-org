import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import SkillsContainer from '@cdo/apps/levelbuilder/skills/SkillsContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const skillsData = getScriptData('skillsData');
  const root = createRoot(document.getElementById('skills'));

  root.render(<SkillsContainer
    canEditSkills={skillsData.canEditSkills}
    skills={skillsData.skills}
    levels={skillsData.levels}
  />);
});
