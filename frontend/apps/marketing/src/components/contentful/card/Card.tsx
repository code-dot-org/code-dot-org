'use client';
import CardMui from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {HTMLAttributes, useMemo} from 'react';

import Button, {ButtonProps} from '@/components/contentful/button';
import Overline from '@/components/contentful/overline';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import theme from '@/themes/csforall';
import {LinkEntry} from '@/types/contentful/entries/Link';

type SharedButtonProps = ButtonProps & LinkEntry;

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
  primaryButton?: SharedButtonProps;
  /** Secondary button props */
  secondaryButton?: SharedButtonProps;
  /** Card custom className */
  className?: string;
}

const styles = {
  card: {
    border: '1px solid',
    boxShadow: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    containerName: 'cardContainer',
    containerType: 'inline-size',
  },
  content: {
    paddingTop: theme.spacing(4),
    paddingInline: theme.spacing(5),
  },
  actions: {
    padding: theme.spacing(5),
    paddingTop: theme.spacing(2),
    gap: theme.spacing(2),
    marginTop: 'auto',
    '@container cardContainer (width < 700px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      '& a': {
        width: '100%',
      },
    },
  },
};

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

  console.log(primaryButton, secondaryButton);

  return (
    <CardMui className={className} raised={false} sx={styles.card}>
      {imageSrc && (
        <CardMedia
          src={imageSource}
          component="img"
          alt=""
          loading="lazy"
          sx={{height: setImageHeight}}
        />
      )}
      <CardContent sx={styles.content}>
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
      <CardActions sx={styles.actions} disableSpacing>
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
          />
        )}
      </CardActions>
    </CardMui>
  );
};

export default Card;
