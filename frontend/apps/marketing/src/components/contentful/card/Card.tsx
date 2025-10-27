'use client';
import CardMui from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {HTMLAttributes, useMemo} from 'react';

import Button from '@/components/contentful/button';
import Overline from '@/components/contentful/overline';
import NextImage from '@/components/nextImage/NextImage';
import {useStatsigLogger} from '@/providers/statsig/client';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import theme from '@/themes/csforall';
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
  /** Image object fit */
  imageObjectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
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
  /** Card chips */
  chipLabels?: string[];
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  chipLabels,
  description,
  imageSrc,
  imageHeight,
  imageObjectFit = 'cover',
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
    return '245px';
  }, [imageHeight]);

  return (
    <CardMui
      className={className}
      raised={false}
      sx={{
        border: `1px solid ${theme.palette.common.black}`,
        boxShadow: 'none',
        borderRadius: '12px',
        minWidth: 275,
      }}
    >
      {imageSource && (
        <CardMedia
          sx={{
            height: setImageHeight,
            position: 'relative',
            backgroundColor: theme.palette.common.black,
          }}
          component={'div'}
        >
          <NextImage
            alt={title || ''}
            src={imageSource}
            style={{objectFit: imageObjectFit}}
          />
        </CardMedia>
      )}
      <CardContent>
        {overline && (
          <Overline color="primary" size="s" removeMarginBottom={false}>
            {overline}
          </Overline>
        )}
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        {chipLabels && chipLabels.length > 0 && (
          <div
            style={{marginBottom: 8, display: 'flex', gap: 4, flexWrap: 'wrap'}}
          >
            {chipLabels.map((label, idx) => (
              <Chip key={idx} label={label} size="small" />
            ))}
          </div>
        )}
        <Typography variant="body4">{description}</Typography>
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
