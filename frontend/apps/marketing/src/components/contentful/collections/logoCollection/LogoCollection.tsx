import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {EntryFields} from 'contentful';
import {useId, useMemo} from 'react';

import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {CollectionProps} from '../types';

type ItemFields = {
  title: EntryFields.Text;
  logoImage: ExperienceAsset;
  primaryLinkRef: LinkEntry;
};

type ItemEntry = Entry<ItemFields>;

export type LogoCollectionProps = Omit<CollectionProps, 'hideImages'> & {
  /** Collection content w/ fields from Contentful */
  logos: ItemEntry[];
};

const logoStyles = {
  gridItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    m: 0,
    height: '40px',
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    },
  },
  link: {
    display: 'flex',
    justifyContent: 'center',
    width: 'fit-content',
    height: '100%',
    marginBottom: 0,
    textDecoration: 'none',
    transition: 'opacity 0.3s ease-in-out',
    '&:hover': {
      opacity: 0.8,
    },
  },
};

const LogoCollection: React.FC<LogoCollectionProps> = ({
  logos,
  sortOrder,
  className,
}) => {
  if (!logos) {
    return (
      <Typography variant="body3" sx={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>📋 Logo Collection placeholder.</strong> Please add a "List"
          content type entry in the Content sidebar.
        </em>
      </Typography>
    );
  }

  const inMemoryEntities = useInMemoryEntities();

  const logosData = useMemo(() => {
    const data = logos.filter(Boolean).map(({fields}) => {
      const {title, logoImage, primaryLinkRef} = fields;

      const resolvedLogoImage = inMemoryEntities.maybeResolveLink(
        logoImage,
      ) as ExperienceAsset;

      const url = primaryLinkRef?.fields?.primaryTarget || '';
      const getImage = () => (
        <img
          src={getAbsoluteImageUrl(resolvedLogoImage)}
          alt={resolvedLogoImage?.fields?.title || title || 'Logo'}
          loading="lazy"
        />
      );

      return {
        id: title,
        item: (
          <Box component="figure" sx={logoStyles.gridItem}>
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={logoStyles.link}
              >
                {getImage()}
              </Link>
            ) : (
              getImage()
            )}
          </Box>
        ),
        url: url,
      };
    });
    // Sort alphabetically if sortOrder is 'alphabetical'
    if (sortOrder === 'alphabetical') {
      data.sort((a, b) => a?.id?.localeCompare(b?.id));
    }
    return data;
  }, [logos, sortOrder]);

  return (
    <Grid container spacing={7.5} className={className}>
      {logosData.map(logo => (
        <Grid
          key={`id-${useId().replaceAll(':', '')}`}
          size={{xs: 12, sm: 4, md: 3}}
        >
          {logo.item}
        </Grid>
      ))}
    </Grid>
  );
};

export default LogoCollection;
