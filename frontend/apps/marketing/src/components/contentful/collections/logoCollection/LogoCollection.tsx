import Box from '@mui/material/Box';
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

const LogoCollection: React.FC<LogoCollectionProps> = ({logos}) => {
  console.log('LogoCollection', logos);
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
            <figure>
              <img
                src={getAbsoluteImageUrl(logoImage)}
                alt={logoImage?.fields?.title || title}
                loading="lazy"
              />
            </figure>
          ),
          url: primaryLinkRef?.fields?.primaryTarget,
        };
      }),
    [logos],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)', // 1 column on mobile
          sm: 'repeat(3, 1fr)', // 3 columns on tablet
          md: 'repeat(4, 1fr)', // 4 columns on desktop
        },
        gap: '60px',
      }}
    >
      {logosData.map(logo => (
        <Box
          key={logo.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& figure': {
              display: 'flex',
              margin: '0',
              height: '100%',
              maxHeight: '40px',
            },
            '& img': {
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            },
          }}
        >
          {logo.url ? (
            <Link
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                textDecoration: 'none',
                '&:hover': {
                  opacity: 0.8,
                  transition: 'opacity 0.3s ease',
                },
              }}
            >
              {logo.item}
            </Link>
          ) : (
            logo.item
          )}
        </Box>
      ))}
    </Box>
  );
};

export default LogoCollection;
