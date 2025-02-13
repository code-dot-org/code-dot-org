import React from 'react';

import {Heading2} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

export interface SectionListProps {
  headline: string;
}
export const SectionList: React.FC<SectionListProps> = ({headline}) => {
  return (
    <div>
      <Heading2>
        {i18n.welcome()}
        {headline}
      </Heading2>
    </div>
  );
};
