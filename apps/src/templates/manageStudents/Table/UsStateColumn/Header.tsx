import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useState} from 'react';
import ReactTooltip from 'react-tooltip';

import BulkSetModal from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/BulkSetModal';
import i18n from '@cdo/locale';

import styles from './../table.module.scss';

interface HeaderProps {
  isDemoSection?: boolean;
}

const Header: React.FC<HeaderProps> = ({isDemoSection = false}) => {
  const [bulkSetModalOpened, setBulkSetModalOpened] = useState(false);

  return (
    <div className={styles.verticalAlign}>
      <span>{i18n.usState()}</span>

      <span
        data-for="demo-us-state-header-tooltip"
        data-tip=""
        style={{display: 'inline-block'}}
      >
        <ActionDropdown
          name="us-state-header-actions"
          labelText={i18n.actions()}
          size="s"
          menuPlacement="right"
          options={[
            {
              value: 'bulk-set-us-state',
              label: i18n.studentUsStateUpdatesModal_title(),
              icon: {iconName: 'pen-to-square'},
              onClick: () => setBulkSetModalOpened(true),
              isOptionDisabled: isDemoSection,
            },
          ]}
          triggerButtonProps={{
            color: 'tertiary',
            variant: 'text',
            children: <FontAwesomeV6Icon iconName="gear" />,
          }}
        />
      </span>
      {isDemoSection && (
        <ReactTooltip
          id="demo-us-state-header-tooltip"
          role="tooltip"
          effect="solid"
          place="top"
        >
          <div>{'Not available for demo sections'}</div>
        </ReactTooltip>
      )}

      <BulkSetModal
        isOpen={bulkSetModalOpened}
        onClose={() => setBulkSetModalOpened(false)}
      />
    </div>
  );
};

export default Header;
