import React, {useState} from 'react';

import PopUpMenu from '@cdo/apps/sharedComponents/PopUpMenu';
import BulkSetModal from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/BulkSetModal';
import QuickActionsCell, {
  QuickActionsCellType,
} from '@cdo/apps/templates/tables/QuickActionsCell';
import i18n from '@cdo/locale';

const Header: React.FC = () => {
  const [bulkSetModalOpened, setBulkSetModalOpened] = useState(false);

  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <span>{i18n.usState()}</span>

      <QuickActionsCell type={QuickActionsCellType.header}>
        <PopUpMenu.Item onClick={() => setBulkSetModalOpened(true)}>
          {i18n.studentUsStateUpdatesModal_title()}
        </PopUpMenu.Item>
      </QuickActionsCell>

      <BulkSetModal
        isOpen={bulkSetModalOpened}
        onClose={() => setBulkSetModalOpened(false)}
      />
    </span>
  );
};

export default Header;
