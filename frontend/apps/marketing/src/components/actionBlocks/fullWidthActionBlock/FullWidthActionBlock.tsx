import {EntryFields} from 'contentful';

import DSCOFullWidthActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock/fullWidthActionBlock';

import {externalLinkIconProps} from '@/components/common/constants';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {showNewTag} from '../helpers';

export type FullWidthActionBlockContentfulProps = Omit<
  ActionBlockProps,
  'image'
> & {
  image: ExperienceAsset;
  overline: EntryFields.Text;
  title: EntryFields.Text;
  description: EntryFields.Text;
  primaryButton: LinkEntry;
  secondaryButton: LinkEntry;
  background: EntryFields.Text;
  publishedDate?: EntryFields.Date;
};

const FullWidthActionBlock: React.FC<FullWidthActionBlockContentfulProps> = ({
  image,
  overline,
  title,
  description,
  primaryButton,
  secondaryButton,
  background,
  publishedDate,
}) => (
  <DSCOFullWidthActionBlock
    image={{src: `https:${image}`}}
    overline={overline}
    title={title}
    description={description}
    primaryButton={
      primaryButton?.fields?.label
        ? {
            text: primaryButton.fields.label,
            href: primaryButton.fields.primaryTarget || '#',
            ariaLabel: primaryButton.fields.ariaLabel || '',
            iconRight: primaryButton.fields.isThisAnExternalLink
              ? externalLinkIconProps
              : undefined,
          }
        : undefined
    }
    secondaryButton={
      secondaryButton?.fields?.label
        ? {
            text: secondaryButton.fields.label,
            href: secondaryButton.fields.primaryTarget || '#',
            ariaLabel: secondaryButton.fields.ariaLabel || '',
            iconRight: secondaryButton.fields.isThisAnExternalLink
              ? externalLinkIconProps
              : undefined,
          }
        : undefined
    }
    background={background}
    tag={publishedDate && showNewTag(publishedDate) ? 'New' : undefined}
  />
);

export default FullWidthActionBlock;
