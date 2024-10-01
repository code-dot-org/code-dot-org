import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {
  isGDocsUrl,
  gDocsMsOfficeUrl,
  gDocsCopyUrl,
  gDocsPdfUrl,
} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

import {Resource, computeMaterialType} from './LessonMaterialTypes';

type ResourceViewOptionsDropdownProps = {
  resource: Resource;
};

// includes test for leading slash in lesson plan link
const normalizeUrl = (url: string) => {
  const httpRegex = /https?:\/\//;
  if (httpRegex.test(url) || url.startsWith('/')) {
    return url;
  } else {
    return 'https://' + url;
  }
};

const openDownloadUrl = (url: string) => {
  url = normalizeUrl(url);
  window.open(url, '_self');
};

const openInNewTab = (url: string) => {
  url = normalizeUrl(url);
  window.open(url, '_blank', 'noopener,noreferrer');
};

const ResourceViewOptionsDropdown: React.FC<
  ResourceViewOptionsDropdownProps
> = ({resource}) => {
  const materialType = computeMaterialType(resource.type, resource.url);

  const getDropdownOptions = () => {
    if (materialType === 'VIDEO') {
      const options = [];
      if (resource.downloadUrl) {
        options.push({
          value: 'download-video',
          label: 'Download',
          icon: {iconName: 'download'},
          onClick: () => {
            if (resource.downloadUrl) {
              openDownloadUrl(resource.downloadUrl);
            }
          },
        });
      }
      options.push({
        value: 'watch',
        label: 'Watch',
        icon: {iconName: 'video'},
        onClick: () => {
          openInNewTab(resource.url);
        },
      });
      return options;
    }

    const options = [
      {
        value: 'view',
        label: 'View',
        icon: {iconName: 'eye'},
        onClick: () => {
          openInNewTab(resource.url);
        },
      },
    ];

    if (materialType === 'LESSON_PLAN') {
      options.push({
        value: 'download-pdf',
        label: 'Download (PDF)',
        icon: {iconName: 'download'},
        onClick: () => {
          if (resource.downloadUrl) {
            openDownloadUrl(resource.downloadUrl);
          }
        },
      });
    } else if (isGDocsUrl(resource.url)) {
      options.push({
        value: 'download-pdf',
        label: 'Download (PDF)',
        icon: {iconName: 'download'},
        onClick: () => {
          openDownloadUrl(gDocsPdfUrl(resource.url));
        },
      });
      options.push({
        value: 'download-office',
        label: 'Download (Microsoft Office)',
        icon: {iconName: 'download'},
        onClick: () => {
          openDownloadUrl(gDocsMsOfficeUrl(resource.url));
        },
      });
      options.push({
        value: 'copy-google-docs',
        label: 'Make a Copy (Google Docs)',
        icon: {iconName: 'copy'},
        onClick: () => {
          openInNewTab(gDocsCopyUrl(resource.url));
        },
      });
    } else {
      // Exclude download link for gdocs, which already have PDF download links.
      if (resource.downloadUrl) {
        options.push({
          value: 'download',
          label: 'Download',
          icon: {iconName: 'download'},
          onClick: () => {
            if (resource.downloadUrl) {
              openDownloadUrl(resource.downloadUrl);
            }
          },
        });
      }
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
