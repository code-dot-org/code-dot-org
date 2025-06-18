import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import {EntryFields} from 'contentful';
import {useMemo} from 'react';

import Image from '@/components/contentful/image';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type ItemFields = {
  title: EntryFields.Text;
  logoImage: ExperienceAsset;
};

type ItemEntry = Entry<ItemFields>;

export type LogoCollectionProps = {
  /** Collection content w/ fields from Contentful */
  logos: ItemEntry[];
};

const LogoCollection: React.FC<LogoCollectionProps> = ({logos}) => {
  console.log(logos);

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
        const {title, logoImage} = fields;

        return {
          id: title,
          item: <Image src={getAbsoluteImageUrl(logoImage)} altText={title} />,
        };
      }),
    [logos],
  );

  return (
    <Box>
      <ImageList cols={4} gap={60}>
        {logosData.map(logo => (
          <ImageListItem key={logo.id}>{logo.item}</ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default LogoCollection;
