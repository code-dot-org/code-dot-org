import OpenInNew from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {EntryFields} from 'contentful';
import {useMemo, useId} from 'react';

import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type ItemFields = {
  name: EntryFields.Text;
  title: EntryFields.Text;
  image?: ExperienceAsset;
  bio?: EntryFields.Text;
  personalLink?: LinkEntry;
};

type ItemEntry = Entry<ItemFields>;

export type PeopleCollectionProps = {
  /** Collection content w/ fields from Contentful */
  people: ItemEntry[];
  /** Show or hide images */
  imageVisibility?: 'show' | 'hide';
};

const styles = {
  container: {
    alignItems: 'flex-start',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  image: {
    marginBottom: '1.25rem',
    width: 128,
    height: 128,
    borderRadius: '50%',
  },
  overline: {
    color: '#4C5661',
    marginTop: 1,
    marginBottom: 1.5,
  },
  bio: {
    textAlign: 'center',
  },
  personalLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    marginTop: 1,
    'html[dir="rtl"] & svg': {
      transform: 'scaleX(-1)',
    },
  },
};

// This is coming directly from Contentful so we can use the Images API to
// format this similarly to the other images which is better for performance.
const PLACEHOLDER_IMAGE_URL =
  'https://contentful-images.code.org/90t6bu6vlf76/12hYaT6lKHqt7yO3knvqHF/8cc3dc67771cd6baaecdff1b155b7d31/person-placeholder.png?fm=avif&fit=fill&w=128&h=128&r=max';

const PeopleCollection: React.FC<PeopleCollectionProps> = ({
  people,
  imageVisibility = 'show',
}) => {
  if (!people) {
    return (
      <Typography variant="body2" sx={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>📋 People Collection placeholder.</strong> Please add a "List"
          content type entry in the Content sidebar.
        </em>
      </Typography>
    );
  }

  const peopleData = useMemo(
    () =>
      people
        .filter(Boolean)
        .map(({fields}) => {
          const {name, image, title, bio, personalLink} = fields;

          return {
            id: name,
            item: (
              <Box sx={styles.gridItem}>
                {imageVisibility === 'show' && (
                  <Box component="figure" sx={styles.image}>
                    <img
                      src={
                        getAbsoluteImageUrl(
                          image,
                          'fit=fill&w=128&h=128&r=max',
                        ) || PLACEHOLDER_IMAGE_URL
                      }
                      alt={name || ''}
                      loading="lazy"
                      role="presentation"
                    />
                  </Box>
                )}
                {name && (
                  <Typography variant="h6" component="h3">
                    {name}
                  </Typography>
                )}
                {title && (
                  <Typography
                    variant="overline"
                    component="h4"
                    sx={styles.overline}
                  >
                    {title}
                  </Typography>
                )}
                {bio && (
                  <Typography variant="body2" component="p" sx={styles.bio}>
                    {bio}
                  </Typography>
                )}
                {personalLink && (
                  <Link
                    variant="body2"
                    href={personalLink?.fields?.primaryTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={styles.personalLink}
                  >
                    Visit personal page
                    <OpenInNew fontSize="small" color="primary" />
                  </Link>
                )}
              </Box>
            ),
          };
        })
        .sort((a, b) => a.id.localeCompare(b.id)), // Sort alphabetically
    [people, imageVisibility],
  );

  return (
    <Grid container spacing={7.5} sx={styles.container}>
      {peopleData.map(person => (
        <Grid
          key={`id-${useId().replaceAll(':', '')}`}
          size={{xs: 12, sm: 4, md: 4}}
        >
          {person.item}
        </Grid>
      ))}
    </Grid>
  );
};

export default PeopleCollection;
