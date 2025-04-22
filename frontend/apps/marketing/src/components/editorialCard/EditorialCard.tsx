import {EntryFields} from 'contentful';
import {useMemo} from 'react';

import EditorialCard, {
  EDITORIAL_CARD_LAYOUTS,
} from '@code-dot-org/component-library/cms/editorialCard';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export enum EDITORIAL_CARD_CONTENTFUL_LAYOUTS {
  HORIZONTAL_WITH_IMAGE = 'horizontal_with_image',
  VERTICAL_WITH_IMAGE = 'vertical_with_image',
  VERTICAL_WITH_ICON = 'vertical_with_icon',
}

export interface EditorialCardContentfulProps {
  layoutOpt: EDITORIAL_CARD_CONTENTFUL_LAYOUTS;
  heading: EntryFields.Text;
  text: EntryFields.Text;
  iconName?: EntryFields.Text;
  image?: ExperienceAsset | string;
  linkEntry?: LinkEntry;
}

const EditorialCardContentful: React.FC<EditorialCardContentfulProps> = ({
  layoutOpt,
  heading,
  text,
  image,
  iconName,
  linkEntry,
}) => {
  const layout = useMemo(() => {
    switch (layoutOpt) {
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE:
        return EDITORIAL_CARD_LAYOUTS.HORIZONTAL;
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE:
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON:
        return EDITORIAL_CARD_LAYOUTS.VERTICAL;
    }
  }, [layoutOpt]);

  const media = useMemo(() => {
    switch (layoutOpt) {
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE:
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE:
        return image && {src: image as string};
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON:
        return (
          iconName && {
            iconName,
            iconStyle: 'solid' as const,
            iconFamily: fontAwesomeV6BrandIconsMap.has(iconName)
              ? ('brands' as const)
              : undefined,
          }
        );
    }
  }, [layoutOpt, iconName, image]);

  const link = useMemo(
    () =>
      linkEntry && {
        text: linkEntry.fields.label,
        href: linkEntry.fields.primaryTarget,
        external: linkEntry.fields.isThisAnExternalLink,
        target: linkEntry.fields.isThisAnExternalLink ? '_blank' : undefined,
        'aria-label': linkEntry.fields.ariaLabel || undefined,
      },
    [linkEntry],
  );

  if (!media) {
    return (
      <em>
        <strong>🖼 Editorial Card placeholder.</strong> Please add an Image or
        Icon Name in the Content sidebar, depending on the selected Layout.
      </em>
    );
  }

  return (
    <EditorialCard
      layout={layout}
      media={media}
      heading={heading}
      text={text}
      link={link}
    />
  );
};

export default EditorialCardContentful;
