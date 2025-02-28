import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import {levelWithProgressType} from './progressTypes';

interface ClearProgressButtonProps {
  levels: (typeof levelWithProgressType)[];
}

const ClearProgressButton: React.FunctionComponent<
  ClearProgressButtonProps
> = ({levels}) => {
  const onUpdate = () => {
    console.log('Clearing progress for this lesson ');
    console.log(
      "Want UserLevel.where(user_id: current_user.id, level_id: [#{levels.map(&:id).join(',')}]), script_id: current_script.id).destroy_all"
    );
    console.log(
      'Still need to figure out what to do about contained levels...'
    );
    console.log(
      'For contained levels, we need to get the id of the contained level (the inner level) then follow the same process as above'
    );
  };

  return (
    <Button
      id="uitest-clear-lesson-progress"
      text={'Clear progress for this lesson'}
      iconLeft={{iconName: 'spinner', animationType: 'spin'}}
      onClick={onUpdate}
    />
  );
};

export default ClearProgressButton;
