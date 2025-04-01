'use client';

import {BaseEntry, EntryFields} from 'contentful';
import '@code-dot-org/component-library/carousel/index.css';
import React, {ReactNode, useMemo} from 'react';

import ActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock';
import DSCOCarousel from '@code-dot-org/component-library/carousel';

export type ActionBlockCarouselProps = ActionBlockProps & {
  /** Carousel content w/ fields from Contentful */
  slides: {
    id: EntryFields.Text;
    slide: ReactNode;
    sys: {
      contentType: BaseEntry & {
        sys: {id: EntryFields.Text};
      };
    };
    fields: {
      actionBlockOverline: EntryFields.Text;
      title: EntryFields.Text;
      shortDescription: EntryFields.Text;
      image: BaseEntry & {
        fields: {file: {url: EntryFields.Text}};
      };
      primaryLinkRef: BaseEntry & {
        fields: {
          label: EntryFields.Text;
          primaryTarget: EntryFields.Text;
          ariaLabel: EntryFields.Text;
        };
      };
      secondaryLinkRef: BaseEntry & {
        fields: {
          label: EntryFields.Text;
          primaryTarget: EntryFields.Text;
          ariaLabel: EntryFields.Text;
        };
      };
    };
  }[];
  /** Background color of the Action Blocks */
  background: EntryFields.Text;
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
              image={image?.fields?.file?.url}
              primaryButton={
                primaryLinkRef?.fields?.label
                  ? {
                      text: primaryLinkRef.fields.label,
                      href: primaryLinkRef.fields.primaryTarget || '#',
                      ariaLabel: primaryLinkRef.fields.ariaLabel || '',
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
