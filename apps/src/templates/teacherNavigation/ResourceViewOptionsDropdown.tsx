import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';

type ResourceViewOptionsDropdownProps = {
  resource: {
    url: string;
    downloadUrl: string | null;
    type: string;
  };
};

const ResourceViewOptionsDropdown: React.FC<
  ResourceViewOptionsDropdownProps
> = ({resource}) => {
  const dummyOptions = [
    {
      value: 'option-1',
      label: 'View',
      icon: {iconName: 'check'},
      onClick: () => console.log('option 1 with URL '),
    },
    {
      value: 'option-2',
      label: 'Download',
      icon: {iconName: 'xmark'},
      onClick: () => console.log('option 2'),
    },
  ];

  return (
    <div>
      <ActionDropdown
        name="view options dropdown"
        labelText="label text that I don't think I want..."
        options={dummyOptions}
        size="s"
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
