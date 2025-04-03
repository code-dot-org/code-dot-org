import {useMemo} from 'react';

import Snapshot, {
  SnapshotProps,
  SnapshotItem,
} from '@code-dot-org/component-library/cms/snapshot';

export interface LabSnapshotProps extends Omit<SnapshotProps, 'items'> {
  ages?: string[];
  level?: string[];
  creation?: string;
  devices?: string[];
  browsers?: string[];
  accessibility?: string[];
  languages?: string[];
}

const LabSnapshot: React.FunctionComponent<LabSnapshotProps> = ({
  ages,
  level,
  devices,
  creation,
  browsers,
  accessibility,
  languages,
  ...props
}) => {
  const initItem = (
    label: string,
    iconName: string,
    content: string | string[],
  ): SnapshotItem => ({
    key: label + iconName,
    label: label,
    icon: {iconName},
    content: Array.isArray(content) ? content.join(', ') : content,
  });

  const items = useMemo(() => {
    const items: SnapshotItem[] = [];

    const addItem = (
      label: string,
      iconName: string,
      content?: string | string[],
    ) => {
      // Avoid pushing empty arrays and empty strings
      if (content?.length) items.push(initItem(label, iconName, content));
    };

    addItem('Ages', 'user', ages);
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

  return <Snapshot {...props} items={items} />;
};

export default LabSnapshot;
