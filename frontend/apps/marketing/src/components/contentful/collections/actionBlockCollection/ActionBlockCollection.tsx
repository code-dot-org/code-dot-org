import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {EntryFields} from 'contentful';
import {useMemo, useId} from 'react';

import ActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock';

import {externalLinkIconProps} from '@/components/common/constants';
import {showNewTag} from '@/components/contentful/actionBlocks/helpers';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {CollectionProps} from '../types';

type ItemFields = {
  actionBlockOverline: EntryFields.Text;
  title: EntryFields.Text;
  shortDescription: EntryFields.Text;
  image: ExperienceAsset;
  primaryLinkRef: LinkEntry;
  secondaryLinkRef: LinkEntry;
  publishedDate?: EntryFields.Date;
};

type ItemEntry = Entry<ItemFields>;

export type ActionBlockCollectionProps = CollectionProps & {
  /** Collection content w/ fields from Contentful */
  blocks: ItemEntry[];
  /** Background color of the Action Blocks */
  background: Extract<ActionBlockProps['background'], string>;
};

const styles = {
  gridItem: {
    height: '100%',
    '& .actionBlockWrapper': {
      height: '100%',
    },
  },
  hideImages: {
    '& figure': {
      display: 'none',
    },
  },
};

const ActionBlockCollection: React.FC<ActionBlockCollectionProps> = ({
  blocks,
  background,
  hideImages = false,
  sortOrder = 'alphabetical',
  className,
}) => {
  const CONTENT_TYPES_WITH_OVERLINE = [
    'curriculum',
    'selfPacedPl',
    'lab',
    'resourcesAndTools',
  ];
  const CONTENT_TYPES_WITH_SECONDARY_BUTTON = ['selfPacedPl', 'lab'];

  const createButtonConfig = (linkRef: LinkEntry) => {
    if (!linkRef?.fields?.label) return undefined;

    const {fields} = linkRef;
    const isExternal = fields.isThisAnExternalLink;

    return {
      text: fields.label,
      href: fields.primaryTarget || '#',
      ariaLabel: fields.ariaLabel || '',
      ...(isExternal && {
        iconRight: externalLinkIconProps,
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    };
  };

  if (!blocks) {
    return (
      <Typography variant="body3" sx={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>📋 Action Block Collection placeholder.</strong> Please add a
          "List" content type entry in the Content sidebar.
        </em>
      </Typography>
    );
  }

  const blocksData = useMemo(() => {
    const data = blocks.filter(Boolean).map(({sys, fields}) => {
      const contentType = sys?.contentType?.sys?.id;
      const {
        actionBlockOverline,
        title,
        shortDescription,
        image,
        primaryLinkRef,
        secondaryLinkRef,
        publishedDate,
      } = fields;

      return {
        id: title,
        item: (
          <Box
            sx={[{...styles.gridItem}, hideImages && {...styles.hideImages}]}
          >
            <ActionBlock
              className="actionBlockWrapper"
              overline={
                CONTENT_TYPES_WITH_OVERLINE.includes(contentType)
                  ? actionBlockOverline
                  : undefined
              }
              title={title}
              description={shortDescription}
              image={{src: getAbsoluteImageUrl(image) || ''}}
              primaryButton={createButtonConfig(primaryLinkRef)}
              secondaryButton={
                CONTENT_TYPES_WITH_SECONDARY_BUTTON.includes(contentType)
                  ? createButtonConfig(secondaryLinkRef)
                  : undefined
              }
              background={background}
              tag={
                publishedDate && showNewTag(publishedDate) ? 'New' : undefined
              }
            />
          </Box>
        ),
      };
    });
    // Sort alphabetically if sortOrder is 'alphabetical'
    if (sortOrder === 'alphabetical') {
      data.sort((a, b) => a?.id?.localeCompare(b?.id));
    }
    return data;
  }, [blocks, hideImages, sortOrder]);

  return (
    <Grid container spacing={3} className={className}>
      {blocksData.map(block => (
        <Grid
          key={`id-${useId().replaceAll(':', '')}`}
          size={{xs: 12, sm: 6, md: 4}}
        >
          {block.item}
        </Grid>
      ))}
    </Grid>
  );
};

export default ActionBlockCollection;
