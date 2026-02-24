import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import React from 'react';

import {OrganizerInfo} from './../types';

import moduleStyles from './../workshopMarketingPage.module.scss';

type OrganizerInformationProps = {
  organizer: OrganizerInfo;
  regionalPartnerName?: string;
};

/** Component to display the organizer information for a workshop. */
const OrganizerInformation: React.FC<OrganizerInformationProps> = ({
  organizer,
  regionalPartnerName,
}) => {
  return (
    <div className={moduleStyles.card}>
      <Typography component="h3" variant="h6" gutterBottom>
        Organizer information
      </Typography>
      <div className={moduleStyles.underCardHeadingDetails}>
        <Typography variant="body3" gutterBottom>
          <FontAwesomeV6Icon iconName="user" />
          <Typography variant="strong">Organizer:</Typography>
          {organizer.name}
        </Typography>
        <Typography variant="body3" gutterBottom>
          <FontAwesomeV6Icon iconName="at" />
          <Typography variant="strong">Email: </Typography>
          <Link size="s" href={`mailto:${organizer.email}`}>
            {organizer.email}
          </Link>
        </Typography>
        {regionalPartnerName && (
          <Typography variant="body3" gutterBottom>
            <FontAwesomeV6Icon iconName="building" />
            <Typography variant="strong">Regional Partner:</Typography>
            {regionalPartnerName}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default OrganizerInformation;
