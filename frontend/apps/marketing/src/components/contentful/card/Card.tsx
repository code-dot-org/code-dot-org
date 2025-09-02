'use client';
import CardMui from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {HTMLAttributes, useMemo} from 'react';

import Button from '@/components/contentful/button';
import Overline from '@/components/contentful/overline';
import {useStatsigLogger} from '@/providers/statsig/client';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card ID */
  id?: string;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Card image */
  imageSrc?: string;
  /** Height of the image */
  imageHeight?: string;
  /** Card overline */
  overline?: string;
  /** Primary button props */
  primaryButton?: LinkEntry;
  /** Secondary button props */
  secondaryButton?: LinkEntry;
  /** Statsig event name for primary button clicks */
  primaryButtonEventName?: string;
  /** Statsig event name for secondary button clicks */
  secondaryButtonEventName?: string;
  /** Additional event metadata */
  eventMetadata?: Record<string, string>;
  /** Card custom className */
  className?: string;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  imageSrc,
  imageHeight,
  overline,
  primaryButton,
  secondaryButton,
  primaryButtonEventName,
  secondaryButtonEventName,
  eventMetadata,
  className,
}) => {
  // Get image url from Contentful
  const imageSource = useMemo(
    () => imageSrc && getAbsoluteImageUrl(imageSrc),
    [imageSrc],
  );

  // Set up Statsig logging on Primary and Secondary buttons
  const {logEvent} = useStatsigLogger();

  const handlePrimaryButtonClick = () => {
    if (id && primaryButton && primaryButtonEventName && eventMetadata) {
      logEvent(primaryButtonEventName, id, {
        ...eventMetadata,
        buttonText: primaryButton.fields.ariaLabel || '',
        buttonTarget: primaryButton.fields.primaryTarget || '',
      });
    }
  };

  const handleSecondaryButtonClick = () => {
    if (id && secondaryButton && secondaryButtonEventName && eventMetadata) {
      logEvent(secondaryButtonEventName, id, {
        ...eventMetadata,
        buttonText: secondaryButton.fields.ariaLabel || '',
        buttonTarget: secondaryButton.fields.primaryTarget || '',
      });
    }
  };

  // Customize image height with a default of 300px
  const setImageHeight = useMemo(() => {
    if (imageHeight) {
      return `${imageHeight}px`;
    }
    return '300px';
  }, [imageHeight]);

  return (
    <CardMui className={className} raised={false}>
      {imageSrc && (
        <CardMedia
          src={imageSource}
          component="img"
          alt=""
          loading="lazy"
          sx={{height: setImageHeight}}
        />
      )}
      <CardContent>
        {overline && (
          <Overline color="primary" size="s" removeMarginBottom={false}>
            {overline}
          </Overline>
        )}
        <Typography variant="h5" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body3">{description}</Typography>
      </CardContent>
      <CardActions disableSpacing>
        {primaryButton?.fields && (
          <Button
            {...primaryButton}
            text={primaryButton.fields.label}
            href={primaryButton.fields.primaryTarget}
            ariaLabel={primaryButton.fields.ariaLabel}
            isLinkExternal={
              primaryButton.fields.isThisAnExternalLink || undefined
            }
            type="primary"
            size="medium"
            onClick={handlePrimaryButtonClick}
          />
        )}
        {secondaryButton?.fields && (
          <Button
            {...secondaryButton}
            text={secondaryButton.fields.label}
            href={secondaryButton.fields.primaryTarget}
            ariaLabel={secondaryButton.fields.ariaLabel}
            isLinkExternal={
              secondaryButton.fields.isThisAnExternalLink || undefined
            }
            type="secondary"
            size="medium"
            onClick={handleSecondaryButtonClick}
          />
        )}
      </CardActions>
    </CardMui>
  );
};

export default Card;
