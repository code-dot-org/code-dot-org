import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import PopUpMenu from '@cdo/apps/sharedComponents/PopUpMenu';
import BulkSetModal from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/BulkSetModal';
import QuickActionsCell, {
  QuickActionsCellType,
} from '@cdo/apps/templates/tables/QuickActionsCell';
import {RootState} from '@cdo/apps/types/redux';
import i18n from '@cdo/locale';

const Header: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [bulkSetModalOpened, setBulkSetModalOpened] = useState(false);

  const openBulkSetModal = () => {
    setBulkSetModalOpened(true);
  };

  const closeBulkSetModal = () => {
    setBulkSetModalOpened(false);
  };

  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <span>{i18n.usState()}</span>

      <QuickActionsCell type={QuickActionsCellType.header}>
        <PopUpMenu.Item onClick={openBulkSetModal}>
          {i18n.studentUsStateUpdatesModal_title()}
        </PopUpMenu.Item>
      </QuickActionsCell>

      <BulkSetModal
        isOpen={bulkSetModalOpened}
        initVal={currentUser?.usStateCode || ''}
        onClose={closeBulkSetModal}
      />
    </span>
  );
};

export default Header;
