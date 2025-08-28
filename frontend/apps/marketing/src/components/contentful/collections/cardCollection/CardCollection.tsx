import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {EntryFields} from 'contentful';
import {useMemo, useId} from 'react';

import Card from '@/components/contentful/card';
import {EVENT} from '@/providers/statsig/statsigConstants';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {CollectionProps} from '../types';

type ItemFields = {
  title: EntryFields.Text;
  actionBlockOverline: EntryFields.Text;
  shortDescription: EntryFields.Text;
  image: ExperienceAsset;
  primaryLinkRef: LinkEntry;
  secondaryLinkRef: LinkEntry;
  tutorialID: EntryFields.Text;
};

type ItemEntry = Entry<ItemFields>;

export type CardCollectionProps = CollectionProps & {
  /** Collection content w/ fields from Contentful */
  cards: ItemEntry[];
  /** Hide secondary button */
  hideSecondaryButton?: boolean;
};

const styles = {
  gridItem: {
    height: '100%',
    '& .cardWrapper': {
      height: '100%',
    },
  },
};

const CardCollection: React.FC<CardCollectionProps> = ({
  cards,
  hideSecondaryButton = false,
  hideImages = false,
  sortOrder = 'alphabetical',
  className,
}) => {
  const inMemoryEntities = useInMemoryEntities();

  if (!cards) {
    return (
      <Typography variant="body3">
        <em>
          <strong>📋 Card Collection placeholder.</strong> Please add a "List"
          content type entry in the Content sidebar.
        </em>
      </Typography>
    );
  }

  const cardsData = useMemo(() => {
    const data = cards.filter(Boolean).map(({fields}) => {
      const {
        actionBlockOverline,
        title,
        shortDescription,
        image,
        primaryLinkRef,
        secondaryLinkRef,
        tutorialID,
      } = fields;

      const resolvedImage = inMemoryEntities.maybeResolveLink(
        image,
      ) as ExperienceAsset;
      const resolvedPrimaryLinkRef = inMemoryEntities.maybeResolveLink(
        primaryLinkRef,
      ) as LinkEntry;
      const resolvedSecondaryLinkRef = inMemoryEntities.maybeResolveLink(
        secondaryLinkRef,
      ) as LinkEntry;

      return {
        id: title,
        item: (
          <Box sx={[{...styles.gridItem}]}>
            <Card
              className="cardWrapper"
              id={tutorialID}
              overline={actionBlockOverline ? actionBlockOverline : undefined}
              title={title}
              description={shortDescription}
              imageSrc={!hideImages ? getAbsoluteImageUrl(resolvedImage) : ''}
              primaryButton={
                resolvedPrimaryLinkRef ? resolvedPrimaryLinkRef : undefined
              }
              secondaryButton={
                !hideSecondaryButton && resolvedSecondaryLinkRef
                  ? resolvedSecondaryLinkRef
                  : undefined
              }
              primaryButtonEventName={EVENT.CARD_PRIMARY_BUTTON_CLICKED}
              secondaryButtonEventName={EVENT.CARD_SECONDARY_BUTTON_CLICKED}
              eventMetadata={{
                cardId: tutorialID,
                cardTitle: title,
              }}
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
  }, [cards, hideImages, hideSecondaryButton, sortOrder]);

  return (
    <Grid container spacing={4} className={className}>
      {cardsData.map(card => (
        <Grid
          key={`id-${useId().replaceAll(':', '')}`}
          size={{xs: 12, md: 6, lg: 4}}
        >
          {card.item}
        </Grid>
      ))}
    </Grid>
  );
};

export default CardCollection;
