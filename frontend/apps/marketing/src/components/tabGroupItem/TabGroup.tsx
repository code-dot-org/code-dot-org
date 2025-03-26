import {BaseEntry} from 'contentful';
import {useMemo} from 'react';

import TabGroup, {
  TabGroupTabModel,
} from '@code-dot-org/component-library/cms/tabGroup';

import {externalLinkIconProps} from '@/components/common/constants';
import tabGroup from '@/components/tabGroup';

type TabGroupItemProps = {
  ctaLink: {
    fields: {
      ariaLabel?: string;
      isThisAnExternalLink: boolean;
      label: string;
      primaryTarget: string;
    };
  };
  description: string;
  image: {
    description?: string;
    title?: string;
    file: {
      url: string;
    };
  };
  tabLabel: string;
  title: string;
};

const TabGroupItem: React.FunctionComponent<TabGroupItemProps> = ({
  ctaLink,
  description,
  image,
  tabLabel,
  title,
}) => {
  const parsedTabs: TabGroupTabModel = {
    value: tabLabel,
    text: tabLabel,
    tabContent: {
      title: title,
      description: description,
      image: {
        src: `${image}`,
      },
      button: {
        href: ctaLink?.fields.primaryTarget,
        text: ctaLink?.fields.label || '#',
        iconRight: ctaLink?.fields.isThisAnExternalLink
          ? externalLinkIconProps
          : undefined,
      },
    },
  };

  return (
    <pre style={{whiteSpace: 'pre-wrap'}}>
      {JSON.stringify(parsedTabs, null, 2)}
    </pre>
  );
};

export default TabGroupItem;
