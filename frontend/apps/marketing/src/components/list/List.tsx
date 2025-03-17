import {Entry, EntryFields} from 'contentful';
import List, {
  DEFAULT_ICON,
  ListProps,
  ListItem,
} from '@code-dot-org/component-library/list';
import {useMemo} from 'react';

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
  iconName = DEFAULT_ICON,
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
        entry in the List sidebar, save it, and open the preview tab to view the
        list.
      </em>
    );
  }

  return (
    <List
      {...props}
      items={listItems}
      icon={{iconName: iconName || DEFAULT_ICON}}
    />
  );
};

export default ListContentful;
