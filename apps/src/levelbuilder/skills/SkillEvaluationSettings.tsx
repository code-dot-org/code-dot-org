import Link from '@code-dot-org/component-library/link';
import React from 'react';

import {studio} from '@cdo/apps/lib/util/urlHelpers';

import AccuracyCheck from './AccuracyCheck';
import SkillsTable from './SkillsTable';
import SystemPromptModificationField from './SystemPromptModificationField';
import {Skill} from './types';
import ViewSystemPrompt from './ViewSystemPrompt';

interface Props {
  skills: Skill[];
  levelId: number;
  systemPrompt: string;
  levelType?: string;
  additionalAiEvaluationInstructions?: string;
  updateAdditionalAiEvaluationInstructions: (value: string) => void;
}

const SkillEvaluationSettings: React.FC<Props> = ({
  skills,
  levelId,
  systemPrompt,
  additionalAiEvaluationInstructions,
  updateAdditionalAiEvaluationInstructions,
}) => {
  return (
    <div className="skill-evaluation-settings">
      <h2>Skills associated with this Level</h2>
      {skills.length === 0 && (
        <h3>There are no skills associated with this level.</h3>
      )}
      {skills.length > 0 && (
        <SkillsTable skills={skills} canModifySkill={false} />
      )}
      <br />
      <p>
        To add skills or associate them with levels, go to the{' '}
        <Link
          text="skills page"
          href={studio('/skills')}
          openInNewTab={true}
          size="s"
        />
      </p>
      <AccuracyCheck levelId={levelId} hasSkills={skills.length > 0} />
      <br />
      <ViewSystemPrompt systemPrompt={systemPrompt} />
      <br />
      <SystemPromptModificationField
        initialValue={additionalAiEvaluationInstructions}
        onChange={updateAdditionalAiEvaluationInstructions}
      />
      <br />
      <br />
    </div>
  );
};

export default SkillEvaluationSettings;
