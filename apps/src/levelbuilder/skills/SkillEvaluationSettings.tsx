import Link from '@code-dot-org/component-library/link';
import React from 'react';
import * as Table from 'reactabular-table';

import {studio} from '@cdo/apps/lib/util/urlHelpers';

import AccuracyCheck from './AccuracyCheck';
import {columns} from './SkillsByConceptTable';
import {Skill} from './types';
import ViewSystemPrompt from './ViewSystemPrompt';

interface Props {
  skills: Skill[];
  levelId: number;
  systemPrompt: string;
}

const SkillEvaluationSettings: React.FC<Props> = ({
  skills,
  levelId,
  systemPrompt,
}) => {
  return (
    <div className="skill-evaluation-settings">
      <h2>Skills associated with this Level</h2>
      {skills.length === 0 && (
        <h3>There are no skills associated with this level.</h3>
      )}
      {skills.length > 0 && (
        <Table.Provider columns={columns} className="skills-table">
          <Table.Header />
          <Table.Body
            rows={skills.map((skill: Skill) => ({
              id: skill.id,
              key: skill.key,
              description: skill.description,
              evaluationCriteria: skill.evaluationCriteria,
            }))}
            rowKey="key"
          />
        </Table.Provider>
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
      <AccuracyCheck levelId={levelId} />
      <br />
      <ViewSystemPrompt systemPrompt={systemPrompt} />
      <br />
      <br />
    </div>
  );
};

export default SkillEvaluationSettings;
