import React from 'react';
import * as Table from 'reactabular-table';

import {tableLayoutStyles as style} from '@cdo/apps/templates/tables/tableConstants';

import {columns} from './SkillsByConceptTable';
import {Skill} from './types';

interface Props {
  skills: Skill[];
}

const SkillEvaluationSettings: React.FC<Props> = ({skills}) => {
  return (
    <div className="skill-evaluation-settings">
      <h2>Skills associated with this Level</h2>
      {skills.length === 0 && (
        <h3>There are no skills associated with this level.</h3>
      )}
      {skills.length > 0 && (
        <Table.Provider columns={columns} style={{...style.table}}>
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
      <br />
    </div>
  );
};

export default SkillEvaluationSettings;
