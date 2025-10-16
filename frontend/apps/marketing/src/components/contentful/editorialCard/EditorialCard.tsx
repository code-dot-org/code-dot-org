import {EntryFields} from 'contentful';
import {useMemo} from 'react';

import EditorialCard, {
  EDITORIAL_CARD_LAYOUTS,
  EditorialCardProps,
} from '@code-dot-org/component-library/cms/editorialCard';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';

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
  image?: EntryFields.Text;
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
  const layout: EditorialCardProps['layout'] = useMemo(() => {
    switch (layoutOpt) {
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE:
        return EDITORIAL_CARD_LAYOUTS.HORIZONTAL;
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE:
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON:
        return EDITORIAL_CARD_LAYOUTS.VERTICAL;
    }
  }, [layoutOpt]);

  const media: EditorialCardProps['media'] | undefined = useMemo(() => {
    switch (layoutOpt) {
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE:
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE: {
        const imageSrc = image && getAbsoluteImageUrl(image);
        return imageSrc ? {src: imageSrc} : undefined;
      }
      case EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON:
        return iconName
          ? {
              iconName,
              iconStyle: 'solid',
              iconFamily: fontAwesomeV6BrandIconsMap.has(iconName)
                ? 'brands'
                : undefined,
            }
          : undefined;
    }
  }, [layoutOpt, iconName, image]);

  const link: EditorialCardProps['link'] = useMemo(
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
