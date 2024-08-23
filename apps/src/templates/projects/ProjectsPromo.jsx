import React from 'react';

import {marketing} from '@cdo/apps/lib/util/urlHelpers';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import i18n from '@cdo/locale';

const ProjectsPromo = () => {
  return (
    <TwoColumnActionBlock
      imageUrl={marketing('/images/athome/fill-970x562/app-lab.png')}
      subHeading={i18n.projectPromoHeading()}
      description={i18n.projectPromoDescription()}
      buttons={[
        {
          id: 'view-project-ideas',
          url: marketing('/project-ideas'),
          text: i18n.projectPromoButton(),
        },
      ]}
    />
  );
};

export default ProjectsPromo;
