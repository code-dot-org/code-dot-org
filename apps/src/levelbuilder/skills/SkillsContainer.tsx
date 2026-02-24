import React from 'react';

import LevelsSkillsCreator from './LevelsSkillsCreator';
import LevelsSkillsTable from './LevelsSkillsTable';
import SkillsByConceptTable from './SkillsByConcept';
import SkillsCreator from './SkillsCreator';
import {SkillsByConcept, Levels} from './types';

interface SkillsContainerProps {
  canEditSkills: boolean;
  skills: SkillsByConcept;
  levels: Levels[];
}

const SkillsContainer: React.FC<SkillsContainerProps> = ({
  canEditSkills,
  skills,
  levels,
}) => {
  return (
    <div>
      <h1>Skills</h1>
      {!canEditSkills && (
        <h3>You need levelbuilder permissions to edit Skills.</h3>
      )}
      {canEditSkills && <SkillsCreator skills={skills} />}
      <SkillsByConceptTable skills={skills} canEditSkills={canEditSkills} />
      {canEditSkills && <LevelsSkillsCreator />}
      <LevelsSkillsTable levels={levels} />
    </div>
  );
};

export default SkillsContainer;
