import React from 'react';
import {TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';
import DCDO from '@cdo/apps/dcdo';

const ProjectsPromo = () => {
  if (!!DCDO.get('thebadguys-projects-page', false)) {
    return (
      <TwoColumnActionBlock
        imageUrl={pegasus(
          '/images/fill-970x562/marketing/thebadguys-banner-projects-page.png'
        )}
        subHeading={i18n.projectPromoHeadingThebadguys()}
        description={i18n.projectPromoDescriptionThebadguys()}
        buttons={[
          {
            id: 'projects-promo-thebadguys',
            url: '/projects/thebadguys/new',
            text: i18n.coursesLearnHeroButton(),
          },
        ]}
      />
    );
  }

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
