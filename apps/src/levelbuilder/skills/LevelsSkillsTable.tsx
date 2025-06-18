import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import * as Table from 'reactabular-table';

import styleConstants from '@cdo/apps/styleConstants';
import {tableLayoutStyles as style} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';

import {Levels} from './types';

interface LevelsSkillsTableProps {
  levels: Levels[];
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
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(levelId: string) => <span>{levelId}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'levelName',
      header: {
        label: 'Level Name',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(levelName: string) => <span>{levelName}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'unitNames',
      header: {
        label: 'Units',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(unitNames: string[]) => <span>{unitNames}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'skills',
      header: {
        label: 'Skills',
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
        formatters: [(skills: string) => <span>{skills}</span>],
        props: {style: {...style.cell, maxWidth: 'unset'}},
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
      <Table.Provider
        columns={columns}
        style={{...style.table, ...styleOverrides.table}}
      >
        <Table.Header />
        <Table.Body
          rows={levelsToShow.map(level => ({
            levelId: level.levelId,
            levelName: level.levelName,
            unitNames: level.unitNames.join(', '),
            skills: level.skills.map(skill => skill.key).join(', '),
          }))}
          rowKey="levelId"
        />
      </Table.Provider>
    </div>
  );
};

export default LevelsSkillsTable;
