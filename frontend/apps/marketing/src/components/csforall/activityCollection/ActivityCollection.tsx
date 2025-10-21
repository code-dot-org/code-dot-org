import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Card from '@/components/contentful/card';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {EVENT} from '@/providers/statsig/statsigConstants';

export type ActivityCollectionProps = {
  activities: Activity[];
};

const styles = {
  gridItem: {
    height: '100%',
    '& .cardWrapper': {
      height: '100%',
    },
  },
};

const ActivityCollection: React.FC<ActivityCollectionProps> = ({
  activities,
}) => {
  const data = activities.map(activity => {
    const {title, shortDescription, image, primaryLinkRef, tutorialID, topic} =
      activity;

    return {
      id: title,
      key: tutorialID,
      item: (
        <Box sx={[{...styles.gridItem}]}>
          <Card
            className="cardWrapper"
            id={tutorialID}
            title={title}
            description={shortDescription}
            primaryButton={primaryLinkRef && JSON.parse(primaryLinkRef)}
            imageSrc={image}
            imageObjectFit={'contain'}
            primaryButtonEventName={EVENT.CARD_PRIMARY_BUTTON_CLICKED}
            secondaryButtonEventName={EVENT.CARD_SECONDARY_BUTTON_CLICKED}
            eventMetadata={{
              cardId: tutorialID,
              cardTitle: title,
            }}
            chipLabels={[...topic]}
          />
        </Box>
      ),
    };
  });

  return (
    <Grid container spacing={3}>
      {data.length > 0 ? (
        data.map(card => (
          <Grid key={card.key} size={{xs: 12, sm: 12, md: 6, lg: 4, xl: 3}}>
            {card.item}
          </Grid>
        ))
      ) : (
        <Typography variant={'body2'}>No activities found</Typography>
      )}
    </Grid>
  );
};

export default ActivityCollection;
