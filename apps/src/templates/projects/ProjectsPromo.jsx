import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import i18n from '@cdo/locale';
import appLabImg from '@cdo/static/athome/app-lab.jpg';

import moduleStyles from './projects-promo.module.scss';

const ProjectsPromo = () => {
  return (
    <div className={moduleStyles.container}>
      <ContentContainer hideBottomMargin>
        <div className={moduleStyles.row}>
          <img src={appLabImg} alt="" className={moduleStyles.image} />
          <div className={moduleStyles.text}>
            <Typography variant="body2" sx={{fontWeight: 600}}>
              {'Learn more about labs and widgets'}
            </Typography>
            <Typography variant="body3">
              {
                'Code.org labs and widgets let students explore computer science concepts through hands-on discovery, no structured course required.'
              }
            </Typography>
          </div>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            href={pegasus('/tools')}
            id="view-project-tools"
          >
            {i18n.learnMore()}
          </MuiButton>
        </div>
      </ContentContainer>
    </div>
  );
};

export default ProjectsPromo;
