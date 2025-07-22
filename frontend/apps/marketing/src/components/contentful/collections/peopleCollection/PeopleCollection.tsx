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
import placeholderImage from '@public/images/person-placeholder.png';

import {CollectionProps} from '../types';

type ItemFields = {
  name: EntryFields.Text;
  title: EntryFields.Text;
  image?: ExperienceAsset;
  bio?: EntryFields.Text;
  personalLink?: LinkEntry;
};

type ItemEntry = Entry<ItemFields>;

export type PeopleCollectionProps = CollectionProps & {
  /** Collection content w/ fields from Contentful */
  people: ItemEntry[];
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
    color: 'var(--text-neutral-quaternary)',
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

const PeopleCollection: React.FC<PeopleCollectionProps> = ({
  people,
  sortOrder,
  hideImages = false,
  className,
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

  const peopleData = useMemo(() => {
    const data = people.filter(Boolean).map(({fields}) => {
      const {name, image, title, bio, personalLink} = fields;

      return {
        id: name,
        item: (
          <Box sx={styles.gridItem}>
            {!hideImages && (
              <Box component="figure" sx={styles.image}>
                <img
                  src={
                    getAbsoluteImageUrl(image, 'fit=fill&w=128&h=128&r=max') ||
                    (typeof placeholderImage === 'string'
                      ? placeholderImage
                      : placeholderImage.src)
                  }
                  alt=""
                  loading="lazy"
                />
              </Box>
            )}
            {name && (
              <Typography variant="h5" component="h3">
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
    });
    // Sort alphabetically if sortOrder is 'alphabetical'
    if (sortOrder === 'alphabetical') {
      data.sort((a, b) => a?.id?.localeCompare(b?.id));
    }
    return data;
  }, [people, hideImages, sortOrder]);

  return (
    <Grid container spacing={7.5} sx={styles.container} className={className}>
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
