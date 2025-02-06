import React from 'react';

import {Heading2} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

export interface TeacherHomepageV2Props {
  headline: string;
}
export const TeacherHomepageV2: React.FC<TeacherHomepageV2Props> = ({
  headline,
}) => {
  return (
    <div>
      <Heading2>
        {i18n.welcome()}
        {headline}
      </Heading2>
    </div>
  );
};
