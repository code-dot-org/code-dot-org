import {Entry, EntryFields} from 'contentful';
import List, {
  LIST_DEFAULT_ICON,
  ListProps,
  ListItem,
} from '@code-dot-org/component-library/list';
import {useMemo} from 'react';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';

type ListItemEntry = Entry & {
  fields: {
    shortText: EntryFields.Text;
  };
};

interface ListContentfulProps extends Omit<ListProps, 'items'> {
  items?: ListItemEntry[];
  iconName?: string;
}

const ListContentful: React.FunctionComponent<ListContentfulProps> = ({
  items = [],
  iconName = LIST_DEFAULT_ICON,
  ...props
}) => {
  const listItems: ListItem[] = useMemo(
    () =>
      items.filter(Boolean).map(listItemEntry => ({
        label: listItemEntry.fields.shortText,
      })),
    [items],
  );

  // Show placeholder text until a content entry is added
  if (!listItems.length) {
    return (
      <em>
        <strong>✍ List placeholder.</strong> Please add a "List" content type
        entry in the List sidebar.
      </em>
    );
  }

  return (
    <List
      {...props}
      items={listItems}
      icon={{
        iconName,
        iconStyle: 'solid',
        iconFamily: fontAwesomeV6BrandIconsMap.has(iconName)
          ? 'brands'
          : undefined,
      }}
    />
  );
};

export default ListContentful;
