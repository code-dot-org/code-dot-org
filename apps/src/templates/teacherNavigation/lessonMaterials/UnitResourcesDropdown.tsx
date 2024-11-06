import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import {RESOURCE_ICONS} from './ResourceIconType';

type UnitResourcesDropdownProps = {
  unitNumber: number;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
};

const UnitResourcesDropdown: React.FC<UnitResourcesDropdownProps> = ({
  unitNumber,
  scriptOverviewPdfUrl,
  scriptResourcesPdfUrl,
}) => {
  const dropdownOptions = [
    {
      value: 'download-lesson-plans',
      label: i18n.downloadUnitLessonPlans({unitNumber: unitNumber}),
      icon: {iconName: RESOURCE_ICONS.LESSON_PLAN.icon},
      onClick: () => {
        window.location.href = scriptOverviewPdfUrl;

        analyticsReporter.sendEvent(
          EVENTS.LESSON_MATERIALS_DOWNLOAD_ALL_LESSON_PLANS
        );
      },
    },
    {
      value: 'download-resources',
      label: i18n.downloadUnitHandouts({unitNumber: unitNumber}),
      icon: {iconName: RESOURCE_ICONS.GOOGLE_DOC.icon},
      onClick: () => {
        window.location.href = scriptResourcesPdfUrl;
        analyticsReporter.sendEvent(
          EVENTS.LESSON_MATERIALS_DOWNLOAD_ALL_HANDOUTS
        );
      },
    },
  ];

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <div data-testid={'unit-resources-download-dropdown'}>
      <ActionDropdown
        name="view-options"
        labelText="View unit options dropdown"
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
