import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import {EntryFields} from 'contentful';
import {useMemo} from 'react';

import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type ItemFields = {
  title: EntryFields.Text;
  logoImage: ExperienceAsset;
  primaryLinkRef: LinkEntry;
};

type ItemEntry = Entry<ItemFields>;

export type LogoCollectionProps = {
  /** Collection content w/ fields from Contentful */
  logos: ItemEntry[];
};

const logoStyles = {
  container: {
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
    textDecoration: 'none',
    transition: 'opacity 0.3s ease-in-out',
    '&:hover': {
      opacity: 0.8,
    },
  },
};

const LogoCollection: React.FC<LogoCollectionProps> = ({logos}) => {
  if (!logos) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>📋 Logo Collection placeholder.</strong> Please add a "List"
          content type entry in the Content sidebar.
        </em>
      </div>
    );
  }

  const logosData = useMemo(
    () =>
      logos.filter(Boolean).map(({fields}) => {
        const {title, logoImage, primaryLinkRef} = fields;

        return {
          id: title,
          item: (
            <img
              src={getAbsoluteImageUrl(logoImage)}
              alt={logoImage?.fields?.title || title || 'Logo'}
              loading="lazy"
            />
          ),
          url: primaryLinkRef?.fields?.primaryTarget || '',
        };
      }),
    [logos],
  );

  return (
    <Grid container spacing={7.5}>
      {logosData.map(logo => (
        <Grid key={logo.id} size={{xs: 12, sm: 4, md: 3}}>
          <Box key={logo.id} component="figure" sx={logoStyles.container}>
            {logo.url ? (
              <Link
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={logoStyles.link}
              >
                {logo.item}
              </Link>
            ) : (
              logo.item
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default LogoCollection;
