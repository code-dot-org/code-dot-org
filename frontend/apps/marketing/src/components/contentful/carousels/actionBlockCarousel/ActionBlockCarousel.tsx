'use client';

import {EntryFields} from 'contentful';
import React, {useMemo} from 'react';

import ActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock';
import DSCOCarousel from '@code-dot-org/component-library/carousel';

import {externalLinkIconProps} from '@/components/common/constants';
import {showNewTag} from '@/components/contentful/actionBlocks/helpers';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type ActionBlockCarouselFields = {
  actionBlockOverline: EntryFields.Text;
  title: EntryFields.Text;
  shortDescription: EntryFields.Text;
  image: ExperienceAsset;
  primaryLinkRef: LinkEntry;
  secondaryLinkRef: LinkEntry;
  publishedDate?: EntryFields.Date;
};

type ActionBlockCarouselEntry = Entry<ActionBlockCarouselFields>;

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
          publishedDate,
        } = fields;

        const resolvedImage = resolveContentfulLink<ExperienceAsset>(image);
        const resolvedPrimaryLinkRef =
          resolveContentfulLink<LinkEntry>(primaryLinkRef);
        const resolvedSecondaryLinkRef =
          resolveContentfulLink<LinkEntry>(secondaryLinkRef);

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
              image={{
                src: getAbsoluteImageUrl(resolvedImage) || '',
              }}
              primaryButton={
                resolvedPrimaryLinkRef?.fields?.label
                  ? {
                      text: resolvedPrimaryLinkRef.fields.label,
                      href: resolvedPrimaryLinkRef.fields.primaryTarget || '#',
                      ariaLabel: resolvedPrimaryLinkRef.fields.ariaLabel || '',
                      iconRight: resolvedPrimaryLinkRef.fields
                        .isThisAnExternalLink
                        ? externalLinkIconProps
                        : undefined,
                      ...(resolvedPrimaryLinkRef.fields
                        .isThisAnExternalLink && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }),
                    }
                  : undefined
              }
              secondaryButton={
                resolvedSecondaryLinkRef?.fields?.label &&
                ['selfPacedPl', 'lab'].includes(contentType)
                  ? {
                      text: resolvedSecondaryLinkRef.fields.label,
                      href:
                        resolvedSecondaryLinkRef.fields.primaryTarget || '#',
                      ariaLabel:
                        resolvedSecondaryLinkRef.fields.ariaLabel || '',
                      iconRight: resolvedSecondaryLinkRef.fields
                        .isThisAnExternalLink
                        ? externalLinkIconProps
                        : undefined,
                      ...(resolvedSecondaryLinkRef.fields
                        .isThisAnExternalLink && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }),
                    }
                  : undefined
              }
              background={background}
              tag={
                publishedDate && showNewTag(publishedDate) ? 'New' : undefined
              }
            />
          ),
        };
      }),
    [slides, background],
  );

  return (
    <DSCOCarousel
      showNavArrows
      slidesPerView={slidesData.length === 2 ? 2 : 3}
      slidesPerGroup={slidesData.length === 2 ? 2 : 3}
      allowTouchMove
      slides={slidesData}
    />
  );
};

export default ActionBlockCarousel;
