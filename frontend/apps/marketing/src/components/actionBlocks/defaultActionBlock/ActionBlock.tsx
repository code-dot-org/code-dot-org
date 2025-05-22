import {EntryFields} from 'contentful';

import DSCOActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock';

import {externalLinkIconProps} from '@/components/common/constants';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {showNewTag} from '../helpers';

export type ActionBlockContentfulProps = ActionBlockProps & {
  overline: EntryFields.Text;
  title: EntryFields.Text;
  description: EntryFields.Text;
  image: ExperienceAsset;
  primaryButton: LinkEntry;
  secondaryButton: LinkEntry;
  background: EntryFields.Text;
  publishedDate?: EntryFields.Date;
};

const ActionBlock: React.FC<ActionBlockContentfulProps> = ({
  className,
  overline,
  title,
  description,
  image,
  primaryButton,
  secondaryButton,
  background,
  publishedDate,
}) => (
  <DSCOActionBlock
    className={className}
    overline={overline}
    title={title}
    description={description}
    image={{src: `https:${image}`}}
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

export default ActionBlock;
