'use client';

import {BaseEntry, EntryFields, EntrySkeletonType} from 'contentful';
import React, {useMemo} from 'react';

import ActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock';
import DSCOCarousel from '@code-dot-org/component-library/carousel';

import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type ActionBlockCarouselFields = {
  actionBlockOverline: EntryFields.Text;
  title: EntryFields.Text;
  shortDescription: EntryFields.Text;
  image: ExperienceAsset;
  primaryLinkRef: LinkEntry;
  secondaryLinkRef: LinkEntry;
};

type ActionBlockCarouselEntry = BaseEntry &
  EntrySkeletonType<ActionBlockCarouselFields>;

export type ActionBlockCarouselProps = {
  /** Carousel content w/ fields from Contentful */
  slides: ActionBlockCarouselEntry[];
  /** Background color of the Action Blocks */
  background: Extract<ActionBlockProps['background'], string>;
};

const ActionBlockCarousel: React.FC<ActionBlockCarouselProps> = ({
  slides,
  background,
}) => {
  if (!slides) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🎠 Action Block carousel placeholder.</strong> Please add a
          "Carousel" content type entry in the Content sidebar, save, and open
          the preview tab to see the carousel in action.
        </em>
      </div>
    );
  }

  const slidesData = useMemo(
    () =>
      slides.filter(Boolean).map(({sys, fields}) => {
        const contentType = sys?.contentType?.sys?.id;
        const {
          actionBlockOverline,
          title,
          shortDescription,
          image,
          primaryLinkRef,
          secondaryLinkRef,
        } = fields;

        return {
          id: title,
          slide: (
            <ActionBlock
              overline={
                [
                  'curriculum',
                  'selfPacedPl',
                  'lab',
                  'resourcesAndTools',
                ].includes(contentType)
                  ? actionBlockOverline
                  : undefined
              }
              title={title}
              description={shortDescription}
              image={{src: `https:${image?.fields?.file?.url}`}}
              primaryButton={
                primaryLinkRef?.fields?.label
                  ? {
                      text: primaryLinkRef.fields.label,
                      href: primaryLinkRef.fields.primaryTarget || '#',
                      ariaLabel: primaryLinkRef.fields.ariaLabel || '',
                      iconRight: primaryLinkRef.fields.isThisAnExternalLink
                        ? externalLinkIconProps
                        : undefined,
                    }
                  : undefined
              }
              secondaryButton={
                secondaryLinkRef?.fields?.label &&
                ['selfPacedPl', 'lab'].includes(contentType)
                  ? {
                      text: secondaryLinkRef.fields.label,
                      href: secondaryLinkRef.fields.primaryTarget || '#',
                      ariaLabel: secondaryLinkRef.fields.ariaLabel || '',
                      iconRight: secondaryLinkRef.fields.isThisAnExternalLink
                        ? externalLinkIconProps
                        : undefined,
                    }
                  : undefined
              }
              background={background}
            />
          ),
        };
      }),
    [slides, background],
  );

  return (
    <DSCOCarousel
      showNavArrows
      slidesPerView={3}
      slidesPerGroup={3}
      allowTouchMove
      slides={slidesData}
    />
  );
};

export default ActionBlockCarousel;
