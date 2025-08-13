import CardMui from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {HTMLAttributes, useMemo} from 'react';

import Button from '@/components/contentful/button';
import Overline from '@/components/contentful/overline';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
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
  /** Card custom className */
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  imageSrc,
  imageHeight,
  overline,
  primaryButton,
  secondaryButton,
  className,
}) => {
  // Get image url from Contentful
  const imageSource = useMemo(
    () => imageSrc && getAbsoluteImageUrl(imageSrc),
    [imageSrc],
  );

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
        {primaryButton && (
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
          />
        )}
        {secondaryButton && (
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
          />
        )}
      </CardActions>
    </CardMui>
  );
};

export default Card;
