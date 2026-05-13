import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import * as Table from 'reactabular-table';

import './skills.css';

import SkillKeyRow from './SkillKeyRow';
import {Levels} from './types';
interface LevelsSkillsTableProps {
  levels: Levels[];
}

const LevelsSkillsTable: React.FC<LevelsSkillsTableProps> = ({levels}) => {
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const units = Array.from(new Set(levels.flatMap(level => level.unitNames)));
  const unitsForDropdown = units
    .sort((a, b) => a.localeCompare(b))
    .map(unit => ({
      value: unit,
      text: unit,
    }));
  unitsForDropdown.push({value: '', text: ''});
  const levelsToShow =
    levels.filter(level => level.unitNames.includes(selectedUnit)) || [];

  const columns = [
    {
      property: 'levelId',
      header: {
        label: 'Level Id',
        props: {className: 'levels-skills-table-header-cell'},
      },
      cell: {
        formatters: [(levelId: string) => <span>{levelId}</span>],
        props: {},
      },
    },
    {
      property: 'levelName',
      header: {
        label: 'Level Name',
        props: {className: 'levels-skills-table-header-cell'},
      },
      cell: {
        formatters: [(levelName: string) => <span>{levelName}</span>],
        props: {},
      },
    },
    {
      property: 'unitNames',
      header: {
        label: 'Units',
        props: {className: 'levels-skills-table-header-cell'},
      },
      cell: {
        formatters: [(unitNames: string[]) => <span>{unitNames}</span>],
        props: {},
      },
    },
    {
      property: 'skills',
      header: {
        label: 'Skills',
        props: {
          className:
            'levels-skills-table-header-cell levels-skills-table-header-cell-unset-maxwidth',
        },
      },
      cell: {
        formatters: [(skills: string) => <span>{skills}</span>],
        props: {className: 'levels-skills-table-cell-unset-maxwidth'},
      },
    },
  ];
  return (
    <div>
      <h2>Levels mapped to Skills</h2>
      <SimpleDropdown
        labelText="Select a unit"
        name="unit"
        size="s"
        onChange={e => {
          setSelectedUnit(e.target.value);
        }}
        selectedValue={selectedUnit}
        items={unitsForDropdown}
        isLabelVisible={false}
      />
      <br />
      <br />
      {levelsToShow.length === 0 && (
        <h3>
          There are no skills associated with levels in the selected unit.
        </h3>
      )}
      <Table.Provider columns={columns} className="levels-skills-table">
        <Table.Header />
        <Table.Body
          rows={levelsToShow.map(level => ({
            levelId: level.levelId,
            levelName: level.levelName,
            unitNames: level.unitNames.join(', '),
            skills: level.skills.map(skill => (
              <SkillKeyRow
                key={`${level.levelId}-${skill.key}`}
                levelSkill={{skillId: skill.id, levelId: level.levelId}}
                skillKey={skill.key}
              />
            )),
          }))}
          rowKey="levelId"
        />
      </Table.Provider>
    </div>
  );
};

export default LevelsSkillsTable;
