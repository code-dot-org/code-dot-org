import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';

type ResourceViewOptionsDropdownProps = {
  resource: {
    url: string;
    downloadUrl?: string;
    type: string;
  };
};

const ResourceViewOptionsDropdown: React.FC<
  ResourceViewOptionsDropdownProps
> = ({resource}) => {
  // This is a dummy options array that will be replaced with actual options in TEACH-1326
  const dummyOptions = [
    {
      value: 'option-1',
      label: 'View',
      icon: {iconName: 'check'},
      onClick: () => console.log('option 1 with of types' + resource.type),
    },
    {
      value: 'option-2',
      label: 'Download',
      icon: {iconName: 'xmark'},
      onClick: () => console.log('option 2'),
    },
  ];

  return (
    <div data-testid={'view-options-dropdown'}>
      <ActionDropdown
        name="view-options"
        labelText="View options dropdown"
        options={dummyOptions}
        size="s"
        menuPlacement="right"
        triggerButtonProps={{
          color: 'black',
          type: 'tertiary',
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

export default ResourceViewOptionsDropdown;
