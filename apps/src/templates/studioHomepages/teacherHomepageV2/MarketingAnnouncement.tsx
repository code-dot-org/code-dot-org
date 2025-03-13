import {LinkButton} from '@code-dot-org/component-library/button';
import {
  BodyThreeText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import React from 'react';

export interface MarketingAnnouncementProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export const MarketingAnnouncement: React.FC<MarketingAnnouncementProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  image,
}) => {
  return (
    <div>
      image
      <Heading3>{title}</Heading3>
      <BodyThreeText>{description}</BodyThreeText>
      <LinkButton href={buttonLink} color="white" text={buttonText} />
    </div>
  );
};
