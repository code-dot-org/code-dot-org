'use client';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {BaseEntry} from 'contentful';
import {useMemo} from 'react';

import TabGroup, {
  TabGroupTabModel,
} from '@code-dot-org/component-library/cms/tabGroup';

import {externalLinkIconProps} from '@/components/common/constants';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type TabGroupContentfulProps = {
  tabs?: (BaseEntry & {
    fields: {
      ctaLink?: LinkEntry;
      description: string;
      image?: ExperienceAsset;
      tabLabel: string;
      title: string;
    };
  })[];
};

const TabGroupContentful: React.FunctionComponent<TabGroupContentfulProps> = ({
  tabs = [],
}) => {
  const inMemoryEntities = useInMemoryEntities();

  const parsedTabs: TabGroupTabModel[] = useMemo(
    () =>
      tabs.map(tab => {
        const resolvedImage = inMemoryEntities.maybeResolveLink(
          tab.fields.image,
        ) as ExperienceAsset;
        const resolvedCtaLink = inMemoryEntities.maybeResolveLink(
          tab.fields.ctaLink,
        ) as LinkEntry;
        return {
          value: tab.fields.tabLabel,
          text: tab.fields.tabLabel,
          tabContent: {
            title: tab.fields.title,
            description: tab.fields.description,
            image: (() => {
              const tabImgSrc =
                resolvedImage && getAbsoluteImageUrl(resolvedImage);

              return tabImgSrc
                ? {
                    src: tabImgSrc,
                    alt: tab.fields.image?.fields?.description,
                  }
                : undefined;
            })(),
            button: resolvedCtaLink
              ? {
                  href: resolvedCtaLink.fields?.primaryTarget || '#',
                  text: resolvedCtaLink.fields?.label || '#',
                  iconRight: resolvedCtaLink.fields?.isThisAnExternalLink
                    ? externalLinkIconProps
                    : undefined,
                }
              : undefined,
          },
        };
      }),
    [tabs],
  );

  // Show placeholder text until a content entry is added
  if (!tabs.length) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🗂️ Tab Group placeholder.</strong> Please add a "Tabs" content
          type entry in the Tab Group sidebar, save, and open the preview tab to
          see the accordions in action.
        </em>
      </div>
    );
  }

  return (
    <TabGroup
      // TODO: This prop shouldn't affect much the CMS app, but it would be nice to use actual Tab Group internal name
      // or section heading here to make sure we are passing a unique name for each TabGroup instance
      name={tabs[0].sys.id}
      tabs={parsedTabs}
    />
  );
};

export default TabGroupContentful;
