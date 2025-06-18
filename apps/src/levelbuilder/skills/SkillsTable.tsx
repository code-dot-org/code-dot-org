import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import * as Table from 'reactabular-table';

import styleConstants from '@cdo/apps/styleConstants';
import {tableLayoutStyles as style} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';

import {SkillsByConcept} from './types';

interface SkillsTableProps {
  skills: SkillsByConcept;
}

export const styleOverrides = {
  table: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: `${styleConstants['content-width']}`,
    backgroundColor: color.table_light_row,
  },
  headerCell: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
};

const SkillsTable: React.FC<SkillsTableProps> = ({skills}) => {
  const [selectedConcept, setSelectedConcept] = React.useState('');
  const concepts = Object.keys(skills)
    .sort((a, b) => a.localeCompare(b))
    .map(concept => ({
      value: concept,
      text: concept,
    }));
  concepts.push({value: '', text: ''});
  const skillsToShow = skills[selectedConcept] || [];

  const columns = [
    {
      property: 'id',
      header: {
        label: 'Id',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(id: string) => <span>{id}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'key',
      header: {
        label: 'Key',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(key: string) => <span>{key}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'description',
      header: {
        label: 'description',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(description: string) => <span>{description}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'evaluationCriteria',
      header: {
        label: 'evaluation criteria',
        // Override the default max-width style to allow for longer content
        props: {
          style: {
            ...style.headerCell,
            ...styleOverrides.headerCell,
            maxWidth: 'unset',
          },
        },
      },
      cell: {
        formatters: [
          (evaluationCriteria: string) => <span>{evaluationCriteria}</span>,
        ],
        props: {style: {...style.cell, maxWidth: 'unset'}},
      },
    },
  ];
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
      <Table.Provider
        columns={columns}
        style={{...style.table, ...styleOverrides.table}}
      >
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

export default SkillsTable;
