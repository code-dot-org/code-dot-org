import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';
import i18n from '@cdo/locale';

type UnitResourcesDropdownProps = {
  unitNumber: number;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
  scriptSlidesUrl: string;
};

const UnitResourcesDropdown: React.FC<UnitResourcesDropdownProps> = ({
  unitNumber,
  scriptOverviewPdfUrl,
  scriptResourcesPdfUrl,
  scriptSlidesUrl,
}) => {
  // note: use the iconTypes here once merged in
  const dummyOptions = [
    {
      value: 'option-1',
      label: i18n.downloadUnitLessonPlans({unitNumber: unitNumber}),
      icon: {iconName: 'file-lines'},
      onClick: () => console.log('clicked'),
    },
    {
      value: 'option-2',
      label: i18n.downloadUnitSlides({unitNumber: unitNumber}),
      icon: {iconName: 'presentation-screen'},
      onClick: () => console.log('option 2'),
    },
    {
      value: 'option-3',
      label: i18n.downloadUnitHandouts({unitNumber: unitNumber}),
      icon: {iconName: 'files'},
      onClick: () => console.log('option 2'),
    },
  ];

  return (
    <div data-testid={'unit-resources-download-dropdown'}>
      <ActionDropdown
        name="view-options"
        labelText="View options dropdown"
        options={dummyOptions}
        size="s"
        menuPlacement="right"
        triggerButtonProps={{
          color: 'gray',
          type: 'secondary',
          isIconOnly: true,
          icon: {
            iconName: 'ellipsis-vertical',
            iconStyle: 'solid',
          },
        }}
      />
    </div>
  );
};

export default UnitResourcesDropdown;
