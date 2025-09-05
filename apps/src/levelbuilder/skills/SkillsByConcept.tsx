import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState} from 'react';

import './skills.css';

import SkillsTable from './SkillsTable';
import {SkillsByConcept} from './types';

interface SkillsByConceptTableProps {
  skills: SkillsByConcept;
}

const SkillsByConcept: React.FC<SkillsByConceptTableProps> = ({skills}) => {
  const [selectedConcept, setSelectedConcept] = useState('');
  const concepts = Object.keys(skills)
    .sort((a, b) => a.localeCompare(b))
    .map(concept => ({
      value: concept,
      text: concept,
    }));
  concepts.push({value: '', text: ''});
  const skillsToShow = skills[selectedConcept] || [];

  return (
    <div>
      <h2>View Available Skills</h2>
      <SimpleDropdown
        labelText="Concept"
        name="concept"
        size="s"
        onChange={(e: {target: {value: React.SetStateAction<string>}}) => {
          setSelectedConcept(e.target.value);
        }}
        selectedValue={selectedConcept}
        items={concepts}
        isLabelVisible={false}
      />
      <br />
      <br />
      {skillsToShow.length === 0 && (
        <h3>There are no skills for the selected concept.</h3>
      )}
      <SkillsTable skills={skillsToShow} canModifySkill />
    </div>
  );
};

export default SkillsByConcept;
