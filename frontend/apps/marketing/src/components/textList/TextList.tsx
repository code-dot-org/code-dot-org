import {Entry, EntryFields} from 'contentful';
import {
  SimpleList,
  SIMPLE_LIST_DEFAULT_ICON,
  SimpleListProps,
  SimpleListItem,
} from '@code-dot-org/component-library/list';
import {useMemo} from 'react';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';

type ListItemEntry = Entry & {
  sys: {
    id: string;
  };
  fields: {
    shortText: EntryFields.Text;
  };
};

interface ListContentfulProps extends Omit<SimpleListProps, 'items'> {
  items?: ListItemEntry[];
  iconName?: string;
}

const ListContentful: React.FunctionComponent<ListContentfulProps> = ({
  items = [],
  iconName = SIMPLE_LIST_DEFAULT_ICON,
  ...props
}) => {
  console.log('items', items);

  const listItems: SimpleListItem[] = useMemo(
    () =>
      items.filter(Boolean).map(listItemEntry => ({
        key: listItemEntry.sys.id,
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
    <SimpleList
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
