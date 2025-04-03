import {useMemo} from 'react';

import Snapshot, {
  SnapshotProps,
  SnapshotItem,
} from '@code-dot-org/component-library/cms/snapshot';

export interface CurriculumSnapshotProps extends Omit<SnapshotProps, 'items'> {
  grades?: string[];
  level?: string[];
  duration?: string[];
  devices?: string[];
  topics?: string[];
  programmingTools?: string[];
  professionalLearning?: string[];
  accessibility?: string[];
  languagesSupported?: string[];
}

const CurriculumSnapshot: React.FunctionComponent<CurriculumSnapshotProps> = ({
  grades,
  level,
  duration,
  devices,
  topics,
  programmingTools,
  professionalLearning,
  accessibility,
  languagesSupported,
  ...props
}) => {
  const initItem = (
    label: string,
    iconName: string,
    content: string[],
  ): SnapshotItem => ({
    key: label + iconName,
    label: label,
    icon: {iconName},
    content: content.join(', '),
  });

  const items = useMemo(() => {
    const items: SnapshotItem[] = [];

    const addItem = (label: string, iconName: string, content?: string[]) => {
      if (Array.isArray(content) && content.length)
        items.push(initItem(label, iconName, content));
    };

    addItem('Grades', 'user', grades);
    addItem('Level', 'arrow-up-wide-short', level);
    addItem('Duration', 'clock', duration);
    addItem('Devices', 'desktop', devices);
    addItem('Topics', 'book', topics);
    addItem('Programming Tools', 'screwdriver-wrench', programmingTools);
    addItem('Professional Learning', 'chalkboard-user', professionalLearning);
    addItem('Accessibility', 'universal-access', accessibility);
    addItem('Languages supported', 'language', languagesSupported);

    return items;
  }, [
    grades,
    level,
    duration,
    devices,
    topics,
    programmingTools,
    professionalLearning,
    accessibility,
    languagesSupported,
  ]);

  // Show placeholder text until a content entry is added
  if (!items.length) {
    return (
      <em>
        <strong>📓 Curriculum Snapshot placeholder.</strong> Please add a
        "Curriculum" content type entry in the Content sidebar.
      </em>
    );
  }

  return <Snapshot {...props} items={items} />;
};

export default CurriculumSnapshot;
