import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {removeSkillFromLevel} from './SkillsApi';
import './skills.css';
import {LevelSkill} from './types';

interface Props {
  levelSkill: LevelSkill;
  skillKey: string;
}

const SkillKeyRow: React.FC<Props> = ({levelSkill, skillKey}) => {
  const handleRemoveSkill = () => {
    if (
      window.confirm(
        `Are you sure you want to remove ${skillKey} from level ${levelSkill.levelId}?`
      )
    ) {
      removeSkillFromLevel(levelSkill);
    }
  };

  return (
    <div>
      <span>
        {skillKey}{' '}
        <button
          type="button"
          onClick={handleRemoveSkill}
          className="skill-trash-btn"
        >
          <FontAwesomeV6Icon iconName="trash" className="skill-trash-icon" />
        </button>
      </span>
    </div>
  );
};

export default SkillKeyRow;
