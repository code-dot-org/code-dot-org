import {Entry, EntryFields} from 'contentful';
import {useMemo} from 'react';

import {
  SimpleList,
  SIMPLE_LIST_DEFAULT_ICON,
  SimpleListProps,
  SimpleListItem,
} from '@code-dot-org/component-library/list';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';

export type SimpleListItemEntry = Entry & {
  sys: {
    id: string;
  };
  fields: {
    shortText: EntryFields.Text;
  };
};

export interface SimpleListContentfulProps
  extends Omit<SimpleListProps, 'items'> {
  items?: SimpleListItemEntry[];
  iconName?: string;
}

const SimpleListContentful: React.FunctionComponent<
  SimpleListContentfulProps
> = ({items = [], iconName = SIMPLE_LIST_DEFAULT_ICON, ...props}) => {
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
        <strong>🗂️ Simple List placeholder.</strong> Please add a "List" content
        type entry in the List sidebar.
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

export default SimpleListContentful;
