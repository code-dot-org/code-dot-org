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
  // also, not sure if every unit with this paeg has these three options...
  // might need to do some checking before rendering
  const dropdownOptions = [
    {
      value: 'download-lesson-plans',
      label: i18n.downloadUnitLessonPlans({unitNumber: unitNumber}),
      icon: {iconName: 'file-lines'},
      onClick: () => {
        window.location.href = scriptOverviewPdfUrl;
      },
    },
    {
      value: 'download-resources',
      label: i18n.downloadUnitHandouts({unitNumber: unitNumber}),
      icon: {iconName: 'files'},
      onClick: () => {
        window.location.href = scriptResourcesPdfUrl;
      },
    },
  ];

  return (
    <div data-testid={'unit-resources-download-dropdown'}>
      <ActionDropdown
        name="view-options"
        labelText="View options dropdown"
        options={dropdownOptions}
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
