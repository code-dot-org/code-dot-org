import React from 'react';

import SkillsCreator from './SkillsCreator';
import SkillsTable from './SkillsTable';
import {SkillsByConcept} from './types';

interface SkillsContainerProps {
  canEditSkills: boolean;
  skills: SkillsByConcept;
}

const SkillsContainer: React.FC<SkillsContainerProps> = ({
  canEditSkills,
  skills,
}) => {
  return (
    <div>
      <h1>Skills</h1>
      {!canEditSkills && (
        <h3>You need levelbuilder permissions to edit Skills.</h3>
      )}
      {canEditSkills && <SkillsCreator skills={skills} />}
      <SkillsTable skills={skills} />
    </div>
  );
};

export default SkillsContainer;
