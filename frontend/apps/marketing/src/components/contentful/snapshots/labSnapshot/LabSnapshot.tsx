import {useMemo} from 'react';

import Snapshot, {
  SnapshotItem,
} from '@code-dot-org/component-library/cms/snapshot';

import {sortInAscendingOrder} from '../helpers';

export interface LabSnapshotProps {
  label?: string;
  ages?: string[];
  level?: string[];
  creation?: string;
  devices?: string[];
  browsers?: string[];
  accessibility?: string[];
  languages?: string[];
}

const LabSnapshot: React.FunctionComponent<LabSnapshotProps> = ({
  label,
  ages,
  level,
  devices,
  creation,
  browsers,
  accessibility,
  languages,
}) => {
  const items = useMemo(() => {
    const items: SnapshotItem[] = [];

    const addItem = (
      label: string,
      iconName: string,
      content?: string | string[],
    ) => {
      // Avoid pushing empty arrays and empty strings
      if (content?.length)
        items.push({
          key: label + iconName,
          label: label,
          icon: {iconName},
          content: Array.isArray(content) ? content.join(', ') : content,
        });
    };

    addItem('Ages', 'user', ages?.slice().sort(sortInAscendingOrder));
    addItem('Level', 'arrow-up-wide-short', level);
    addItem('What you can make', 'paintbrush', creation);
    addItem('Devices', 'desktop', devices);
    addItem('Browsers', 'globe', browsers);
    addItem('Accessibility', 'universal-access', accessibility);
    addItem('Languages supported', 'language', languages);

    return items;
  }, [ages, level, devices, creation, browsers, accessibility, languages]);

  // Show placeholder text until a content entry is added
  if (!items.length) {
    return (
      <em>
        <strong>🧪 Lab Snapshot placeholder.</strong> Please add a "Lab" content
        type entry in the Content sidebar.
      </em>
    );
  }

  return <Snapshot aria-label={label} items={items} />;
};

export default LabSnapshot;
