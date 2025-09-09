import classNames from 'classnames';
import {EntryFields} from 'contentful';

import DSCOFullWidthActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock/fullWidthActionBlock';
import DSCOVideo from '@code-dot-org/component-library/video';

import {externalLinkIconProps} from '@/components/common/constants';
import {VideoRelatedProps} from '@/components/common/types';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {showNewTag} from '../helpers';

import moduleStyles from './../actionBlocks.module.scss';

export type FullWidthActionBlockContentfulProps = Omit<
  ActionBlockProps,
  'image'
> &
  VideoRelatedProps & {
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
  className,
  image,
  videoTitle,
  videoYouTubeId,
  videoFallback,
  videoShowCaption,
  overline,
  title,
  description,
  primaryButton,
  secondaryButton,
  background,
  publishedDate,
}) => (
  <DSCOFullWidthActionBlock
    className={classNames(moduleStyles.hideDownloadVideoButton, className)}
    image={{src: getAbsoluteImageUrl(image) || ''}}
    video={
      videoYouTubeId || videoFallback
        ? {
            videoTitle: videoTitle,
            youTubeId: videoYouTubeId,
            showCaption: videoShowCaption,
            videoFallback: videoFallback,
          }
        : undefined
    }
    VideoComponent={DSCOVideo}
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
            ...(primaryButton.fields.isThisAnExternalLink && {
              target: '_blank',
              rel: 'noopener noreferrer',
            }),
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
            ...(secondaryButton.fields.isThisAnExternalLink && {
              target: '_blank',
              rel: 'noopener noreferrer',
            }),
          }
        : undefined
    }
    background={background}
    tag={publishedDate && showNewTag(publishedDate) ? 'New' : undefined}
  />
);

export default FullWidthActionBlock;
