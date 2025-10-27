'use client';

import React from 'react';

import DSCOCarousel from '@code-dot-org/component-library/carousel';

import Card from '@/components/contentful/card';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {EVENT} from '@/providers/statsig/statsigConstants';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type ActivityCarouselEntry = Entry<Activity>;

export type ActivityCarouselProps = {
  /** Carousel content w/ fields from Contentful */
  slides: ActivityCarouselEntry[];
};

const ActivityCarousel: React.FC<ActivityCarouselProps> = ({slides}) => {
  if (!slides) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🎠 Activity carousel placeholder.</strong> Please add a
          "Carousel" content type entry in the Content sidebar, save, and open
          the preview tab to see the carousel in action.
        </em>
      </div>
    );
  }

  const slidesData = slides.map(activity => {
    const {title, shortDescription, image, primaryLinkRef, tutorialID, topic} =
      activity.fields;
    const resolvedImage = resolveContentfulLink<ExperienceAsset>(image);
    const primaryButton = resolveContentfulLink<LinkEntry>(primaryLinkRef);

    return {
      id: title,
      key: tutorialID,
      slide: (
        <Card
          style={{display: 'inline-block'}}
          className="cardWrapper"
          id={tutorialID}
          title={title}
          description={shortDescription}
          primaryButton={primaryButton}
          imageSrc={getAbsoluteImageUrl(resolvedImage)}
          imageObjectFit={'contain'}
          primaryButtonEventName={EVENT.CARD_PRIMARY_BUTTON_CLICKED}
          secondaryButtonEventName={EVENT.CARD_SECONDARY_BUTTON_CLICKED}
          eventMetadata={{
            cardId: tutorialID,
            cardTitle: title,
          }}
          chipLabels={[...topic]}
        />
      ),
    };
  });
  return (
    <DSCOCarousel
      showNavArrows={true}
      slidesPerView={slidesData.length === 2 ? 2 : 3}
      slidesPerGroup={slidesData.length === 2 ? 2 : 3}
      slides={slidesData}
    />
  );
};

export default ActivityCarousel;
