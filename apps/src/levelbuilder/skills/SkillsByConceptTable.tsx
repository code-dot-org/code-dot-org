import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import * as Table from 'reactabular-table';

import './skills.css';

import {SkillsByConcept} from './types';

interface SkillsByConceptTableProps {
  skills: SkillsByConcept;
}

export const columns = [
  {
    property: 'id',
    header: {
      label: 'Id',
      props: {className: 'skills-table-header-cell'},
    },
    cell: {
      formatters: [(id: string) => <span>{id}</span>],
      props: {},
    },
  },
  {
    property: 'key',
    header: {
      label: 'Key',
      props: {className: 'skills-table-header-cell'},
    },
    cell: {
      formatters: [(key: string) => <span>{key}</span>],
      props: {},
    },
  },
  {
    property: 'description',
    header: {
      label: 'Description',
      props: {className: 'skills-table-header-cell'},
    },
    cell: {
      formatters: [(description: string) => <span>{description}</span>],
      props: {},
    },
  },
  {
    property: 'evaluationCriteria',
    header: {
      label: 'Evaluation Criteria',
      props: {
        className:
          'skills-table-header-cell skills-table-header-cell-unset-maxwidth',
      },
    },
    cell: {
      formatters: [
        (evaluationCriteria: string) => <span>{evaluationCriteria}</span>,
      ],
      props: {className: 'skills-table-cell-unset-maxwidth'},
    },
  },
];

const SkillsByConceptTable: React.FC<SkillsByConceptTableProps> = ({
  skills,
}) => {
  const [selectedConcept, setSelectedConcept] = React.useState('');
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
        onChange={e => {
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
      <Table.Provider columns={columns} className="skills-table">
        <Table.Header />
        <Table.Body
          rows={skillsToShow.map(skill => ({
            id: skill.id,
            key: skill.key,
            description: skill.description,
            evaluationCriteria: skill.evaluationCriteria,
          }))}
          rowKey="key"
        />
      </Table.Provider>
    </div>
  );
};

export default SkillsByConceptTable;
