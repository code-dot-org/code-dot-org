import {useMemo} from 'react';

import Snapshot, {
  SnapshotProps,
  SnapshotItem,
} from '@code-dot-org/component-library/cms/snapshot';

export interface CurriculumSnapshotProps extends SnapshotProps {
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
  const items = useMemo(() => {
    const items: SnapshotItem[] = [];

    if (grades?.length) {
      items.push({
        key: 'grades',
        icon: {iconName: 'user'},
        label: 'Grades',
        content: grades.join(', '),
      });
    }

    if (level?.length) {
      items.push({
        key: 'level',
        icon: {iconName: 'arrow-up-wide-short'},
        label: 'Level',
        content: level.join(', '),
      });
    }

    if (duration?.length) {
      items.push({
        key: 'duration',
        icon: {iconName: 'clock'},
        label: 'Duration',
        content: duration.join(', '),
      });
    }

    if (devices?.length) {
      items.push({
        key: 'devices',
        icon: {iconName: 'desktop'},
        label: 'Devices',
        content: devices.join(', '),
      });
    }

    if (topics?.length) {
      items.push({
        key: 'topics',
        icon: {iconName: 'book'},
        label: 'Topics',
        content: topics.join(', '),
      });
    }

    if (programmingTools?.length) {
      items.push({
        key: 'programmingTools',
        icon: {iconName: 'screwdriver-wrench'},
        label: 'Programming Tools',
        content: programmingTools.join(', '),
      });
    }

    if (professionalLearning?.length) {
      items.push({
        key: 'professionalLearning',
        icon: {iconName: 'chalkboard-user'},
        label: 'Professional Learning',
        content: professionalLearning.join(', '),
      });
    }

    if (accessibility?.length) {
      items.push({
        key: 'accessibility',
        icon: {iconName: 'universal-access'},
        label: 'Accessibility',
        content: accessibility.join(', '),
      });
    }

    if (languagesSupported?.length) {
      items.push({
        key: 'languagesSupported',
        icon: {iconName: 'language'},
        label: 'Languages supported',
        content: languagesSupported.join(', '),
      });
    }

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
