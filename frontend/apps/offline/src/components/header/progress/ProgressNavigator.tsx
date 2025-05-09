'use client';

import {useRouter} from 'next/navigation';
import React from 'react';

import Progress, {ProgressProps} from './Progress';

const ProgressNavigator: React.FunctionComponent<ProgressProps> = props => {
  const router = useRouter();

  return (
    <Progress
      onNavigate={levelIndex => {
        router.push(
          `/units/${props.unit.key}/lessons/${props.lessonIndex + 1}/levels/${levelIndex + 1}`,
        );
      }}
      {...props}
    />
  );
};

export default ProgressNavigator;
