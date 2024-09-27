import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';

import {Resource} from './LessonMaterialTypes';

type ResourceViewOptionsDropdownProps = {
  resource: Resource;
};

const ResourceViewOptionsDropdown: React.FC<
  ResourceViewOptionsDropdownProps
> = ({resource}) => {
  // This is a dummy options array that will be replaced with actual options in TEACH-1326
  const dummyOptions = [
    {
      value: 'view',
      label: 'View',
      icon: {iconName: 'check'},
      onClick: () => console.log('view clicked'),
    },
    {
      value: 'download-video',
      label: 'Download',
      icon: {iconName: 'download'},
      onClick: () => console.log('download-video clicked'),
    },
    {
      value: 'download-pdf',
      label: 'Download (PDF)',
      icon: {iconName: 'download'},
      onClick: () => console.log('download-pdf clicked'),
    },
    {
      value: 'download-office',
      label: 'Download (Microsoft Office)',
      icon: {iconName: 'download'},
      onClick: () => console.log('download-office clicked'),
    },
    {
      value: 'copy-google-docs',
      label: 'Make a Copy (Google Docs)',
      icon: {iconName: 'copy'},
      onClick: () => console.log('copy-google-docs clicked'),
    },
    {
      value: 'watch-youtube',
      label: 'Watch on Youtube',
      icon: {iconName: 'youtube'},
      onClick: () => console.log('watch-youtube clicked'),
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
