import {useMemo} from 'react';

import Snapshot, {
  SnapshotItem,
} from '@code-dot-org/component-library/cms/snapshot';

import {sortInAscendingOrder} from '../helpers';

export interface CurriculumSnapshotProps {
  label: string;
  grades?: string[];
  level?: string[];
  duration?: string[];
  devices?: string[];
  topics?: string[];
  devTools?: string[];
  proLearning?: string[];
  accessibility?: string[];
  languages?: string[];
}

const CurriculumSnapshot: React.FunctionComponent<CurriculumSnapshotProps> = ({
  label,
  grades,
  level,
  duration,
  devices,
  topics,
  devTools,
  proLearning,
  accessibility,
  languages,
}) => {
  const items = useMemo(() => {
    const items: SnapshotItem[] = [];

    const addItem = (label: string, iconName: string, content?: string[]) => {
      if (Array.isArray(content) && content.length)
        items.push({
          key: label + iconName,
          label: label,
          icon: {iconName},
          content: content.join(', '),
        });
    };

    addItem('Grades', 'user', grades?.slice().sort(sortInAscendingOrder));
    addItem('Level', 'arrow-up-wide-short', level);
    addItem('Duration', 'clock', duration);
    addItem('Devices', 'desktop', devices);
    addItem('Topics', 'book', topics);
    addItem('Programming Tools', 'screwdriver-wrench', devTools);
    addItem('Professional Learning', 'chalkboard-user', proLearning);
    addItem('Accessibility', 'universal-access', accessibility);
    addItem('Languages supported', 'language', languages);

    return items;
  }, [
    grades,
    level,
    duration,
    devices,
    topics,
    devTools,
    proLearning,
    accessibility,
    languages,
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

  return <Snapshot aria-label={label} items={items} />;
};

export default CurriculumSnapshot;
