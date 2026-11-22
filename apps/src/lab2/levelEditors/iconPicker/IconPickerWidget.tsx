// A schema form widget for an icon name: a text field that suggests the
// kit's icons and Font Awesome's free solid icons as you type, with the
// chosen icon shown beside it. Any name is accepted, since the page's
// Font Awesome kit has more icons than the free set.

import FontAwesomeV6Icon, {
  kitIcons,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {WidgetProps} from '../schemaForm/SchemaForm';
import {unwrap} from '../schemaForm/schemaNodes';

import solidIcons from './solidIconNames.json';

import styles from './icon-picker.module.scss';

/** The widget name a schema gives an icon field. */
export const ICON_WIDGET = 'icon';

const ICON_NAMES = [...kitIcons, ...solidIcons.names];

const IconPickerWidget: React.FunctionComponent<WidgetProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const id = `schema-field-${path.join('-')}`;
  const listId = `${id}-icons`;
  const name = typeof value === 'string' ? value : '';
  const known = ICON_NAMES.includes(name);
  return (
    <div className={styles.picker}>
      <span className={styles.preview} aria-hidden="true">
        {known && (
          <FontAwesomeV6Icon
            iconName={name}
            iconFamily={kitIcons.has(name) ? 'kit' : undefined}
          />
        )}
      </span>
      <input
        id={id}
        className={styles.input}
        list={listId}
        value={name}
        placeholder="Type to search icons"
        autoComplete="off"
        onChange={event =>
          onChange(
            event.target.value === '' && unwrap(schema).optional
              ? undefined
              : event.target.value
          )
        }
      />
      <datalist id={listId}>
        {ICON_NAMES.map(icon => (
          <option key={icon} value={icon} />
        ))}
      </datalist>
      {name && !known && (
        <span className={styles.note}>
          Not in the list; it may still be in the kit.
        </span>
      )}
    </div>
  );
};

export default IconPickerWidget;
