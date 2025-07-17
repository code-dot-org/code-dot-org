import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {
  Heading3,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {OrganizerInfo} from './../types';

import moduleStyles from './../workshopMarketingPage.module.scss';

type OrganizerInformationProps = {
  organizer: OrganizerInfo;
  regional_partner_name?: string;
};

/** Component to display the organizer information for a workshop. */
const OrganizerInformation: React.FC<OrganizerInformationProps> = ({
  organizer,
  regional_partner_name,
}) => {
  return (
    <div className={moduleStyles.card}>
      <Heading3 visualAppearance="heading-xs">Organizer information</Heading3>
      <div className={moduleStyles.underCardHeadingDetails}>
        <BodyThreeText>
          <FontAwesomeV6Icon iconName="user" />
          <StrongText>Organizer:</StrongText>
          {organizer.name}
        </BodyThreeText>
        <BodyThreeText>
          <FontAwesomeV6Icon iconName="at" />
          <StrongText>Email: </StrongText>
          <Link size="s" href={`mailto:${organizer.email}`}>
            {organizer.email}
          </Link>
        </BodyThreeText>
        {regional_partner_name && (
          <BodyThreeText>
            <FontAwesomeV6Icon iconName="building" />
            <StrongText>Regional Partner:</StrongText>
            {regional_partner_name}
          </BodyThreeText>
        )}
      </div>
    </div>
  );
};

export default OrganizerInformation;
