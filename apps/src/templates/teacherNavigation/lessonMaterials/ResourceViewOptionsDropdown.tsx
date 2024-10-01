import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {isGDocsUrl} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

import {Resource, computeMaterialType} from './LessonMaterialTypes';

type ResourceViewOptionsDropdownProps = {
  resource: Resource;
};

const ResourceViewOptionsDropdown: React.FC<
  ResourceViewOptionsDropdownProps
> = ({resource}) => {
  const materialType = computeMaterialType(resource.type, resource.url);

  const getDropdownOptions = () => {
    if (materialType === 'VIDEO') {
      return [
        {
          value: 'download-video',
          label: 'Download',
          icon: {iconName: 'download'},
          onClick: () => console.log('download-video clicked'),
        },
        {
          value: 'watch-youtube',
          label: 'Watch on Youtube',
          icon: {iconName: 'youtube'},
          onClick: () => console.log('watch-youtube clicked'),
        },
      ];
    }

    const options = [
      {
        value: 'view',
        label: 'View',
        icon: {iconName: 'check'},
        onClick: () => console.log('view clicked'),
      },
    ];
    if (resource.downloadUrl) {
      options.push({
        value: 'download',
        label: 'Download',
        icon: {iconName: 'download'},
        onClick: () => console.log('download clicked'),
      });
    }

    if (isGDocsUrl(resource.url)) {
      options.push({
        value: 'download-office',
        label: 'Download (Microsoft Office)',
        icon: {iconName: 'download'},
        onClick: () => console.log('download-office clicked'),
      });
      options.push({
        value: 'copy-google-docs',
        label: 'Make a Copy (Google Docs)',
        icon: {iconName: 'copy'},
        onClick: () => console.log('copy-google-docs clicked'),
      });
    }

    return options;
  };
  const dropdownOptions = getDropdownOptions();

  return (
    <div data-testid={'view-options-dropdown'}>
      <ActionDropdown
        name="view-options"
        labelText="View options dropdown"
        options={dropdownOptions}
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
