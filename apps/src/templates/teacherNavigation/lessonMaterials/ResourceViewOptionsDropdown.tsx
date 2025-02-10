import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useMemo} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  isGDocsUrl,
  gDocsMsOfficeUrl,
  gDocsCopyUrl,
  gDocsPdfUrl,
} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';
import {windowOpen} from '@cdo/apps/utils';

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
  windowOpen(url, '_self');
};

const openInNewTab = (url: string) => {
  url = normalizeUrl(url);
  windowOpen(url, '_blank', 'noopener,noreferrer');
};

const ResourceViewOptionsDropdown: React.FC<
  ResourceViewOptionsDropdownProps
> = ({resource}) => {
  const materialType = computeMaterialType(resource.type, resource.url);

  const dropdownOptions = useMemo(() => {
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

              analyticsReporter.sendEvent(
                EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
                {resourceKey: resource.key, type: 'download-video'}
              );
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
          analyticsReporter.sendEvent(
            EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
            {
              resourceKey: resource.key,
              type: 'watch',
            }
          );
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
          analyticsReporter.sendEvent(
            EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
            {
              resourceKey: resource.key,
              type: 'view',
            }
          );
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
            analyticsReporter.sendEvent(
              EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
              {
                resourceKey: resource.key,
                type: 'download-lesson-plan',
              }
            );
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
          analyticsReporter.sendEvent(
            EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
            {
              resourceKey: resource.key,
              type: 'download-google-docs',
            }
          );
        },
      });
      options.push({
        value: 'download-office',
        label: 'Download (Microsoft Office)',
        icon: {iconName: 'download'},
        onClick: () => {
          openDownloadUrl(gDocsMsOfficeUrl(resource.url));
          analyticsReporter.sendEvent(
            EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
            {
              resourceKey: resource.key,
              type: 'download-ms-office',
            }
          );
        },
      });
      options.push({
        value: 'copy-google-docs',
        label: 'Make a copy (Google Docs)',
        icon: {iconName: 'copy'},
        onClick: () => {
          openInNewTab(gDocsCopyUrl(resource.url));
          analyticsReporter.sendEvent(
            EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
            {
              resourceKey: resource.key,
              type: 'copy-google-doc',
            }
          );
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
              analyticsReporter.sendEvent(
                EVENTS.LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION,
                {
                  resourceKey: resource.key,
                  type: 'download-url',
                }
              );
            }
          },
        });
      }
    }

    return options;
  }, [materialType, resource]);

  return (
    // eslint-disable-next-line react/forbid-dom-props
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
