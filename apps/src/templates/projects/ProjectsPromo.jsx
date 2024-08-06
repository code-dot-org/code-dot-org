import React from 'react';

import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {pegasus} from '@cdo/apps/util/urlHelpers';
import i18n from '@cdo/locale';

const ProjectsPromo = () => {
  return (
    <TwoColumnActionBlock
      imageUrl={pegasus('/images/athome/fill-970x562/app-lab.png')}
      subHeading={i18n.projectPromoHeading()}
      description={i18n.projectPromoDescription()}
      buttons={[
        {
          id: 'view-project-ideas',
          url: pegasus('/project-ideas'),
          text: i18n.projectPromoButton(),
        },
      ]}
    />
  );
};

export default ProjectsPromo;
