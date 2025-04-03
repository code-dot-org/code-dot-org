'use client';
import {BaseEntry} from 'contentful';
import {useMemo} from 'react';

import TabGroup, {
  TabGroupTabModel,
} from '@code-dot-org/component-library/cms/tabGroup';

import {externalLinkIconProps} from '@/components/common/constants';
import {ImageAssetEntry, LinkEntry} from '@/contentful/types/entries';

type TabGroupContentfulProps = {
  tabs?: (BaseEntry & {
    fields: {
      ctaLink: LinkEntry;
      description: string;
      image: ImageAssetEntry;
      tabLabel: string;
      title: string;
    };
  })[];
};

const TabGroupContentful: React.FunctionComponent<TabGroupContentfulProps> = ({
  tabs = [],
}) => {
  const parsedTabs: TabGroupTabModel[] = useMemo(
    () =>
      tabs.map(tab => ({
        value: tab.fields.tabLabel,
        text: tab.fields.tabLabel,
        tabContent: {
          title: tab.fields.title,
          description: tab.fields.description,
          image: {
            src: `https:${tab.fields.image.fields?.file.url}`,
            alt: tab.fields.image.fields?.description,
          },
          button: {
            href: tab.fields.ctaLink.fields?.primaryTarget || '#',
            text: tab.fields.ctaLink.fields?.label || '#',
            iconRight: tab.fields.ctaLink.fields?.isThisAnExternalLink
              ? externalLinkIconProps
              : undefined,
          },
        },
      })),
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
