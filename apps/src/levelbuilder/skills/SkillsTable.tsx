import {Button, buttonColors} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useState} from 'react';
import * as Table from 'reactabular-table';

import Tooltip from '@cdo/apps/templates/Tooltip';

import './skills.css';

import SkillsEditDialog from './SkillsEditDialog';
import {Skill} from './types';

interface SkillsTableProps {
  skills: Skill[];
  canModifySkill: boolean;
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

const actionColumns = [
  {
    property: 'edit',
    header: {
      label: 'Edit',
      props: {className: 'skills-table-header-cell'},
    },
    cell: {
      formatters: [(edit: string) => <span>{edit}</span>],
      props: {},
    },
  },
  {
    property: 'delete',
    header: {
      label: 'Delete',
      props: {className: 'skills-table-header-cell'},
    },
    cell: {
      formatters: [(del: string) => <span>{del}</span>],
      props: {},
    },
  },
];

const SkillsTable: React.FC<SkillsTableProps> = ({skills, canModifySkill}) => {
  const [skillToEdit, setSkillToEdit] = useState<Skill | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (skill: Skill) => {
    setIsModalOpen(true);
    setSkillToEdit(skill);
  };

  const handleDelete = async (skillId: number) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const response = await fetch(`/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token':
            (
              document.querySelector(
                'meta[name="csrf-token"]'
              ) as HTMLMetaElement
            )?.content || '',
        },
      });
      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete skill.');
      }
    } catch (err) {
      alert('Failed to delete skill.');
    }
  };
  const columnsToShow = canModifySkill
    ? columns.concat(actionColumns)
    : columns;
  return (
    <div>
      <Table.Provider columns={columnsToShow} className="skills-table">
        <Table.Header />
        <Table.Body
          rows={skills.map(skill => ({
            id: skill.id,
            key: skill.key,
            description: skill.description,
            evaluationCriteria: skill.evaluationCriteria,
            edit: (
              <span
                style={{cursor: 'pointer'}}
                onClick={() => handleEditClick(skill)}
              >
                <FontAwesomeV6Icon iconName="pencil-alt" />
              </span>
            ),
            delete: (
              <>
                <Tooltip
                  text={
                    'You can only delete skills that are not associated with levels.'
                  }
                  place="right"
                >
                  <Button
                    icon={{iconName: 'trash'}}
                    isIconOnly
                    onClick={() => handleDelete(skill.id)}
                    size="s"
                    color={buttonColors.destructive}
                    disabled={skill.hasLevels}
                  />
                </Tooltip>
              </>
            ),
          }))}
          rowKey="key"
        />
      </Table.Provider>
      {isModalOpen && skillToEdit && (
        <SkillsEditDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skill={skillToEdit}
        />
      )}
    </div>
  );
};

export default SkillsTable;
