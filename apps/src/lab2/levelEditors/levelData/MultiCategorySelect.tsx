import React from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import styles from './multi-category-select.module.scss';

interface MultiCategorySelectProps {
  items: {
    categoryId: string;
    categoryLabel: string;
    categoryItems: {
      id: string;
      label: string;
      selected: boolean;
    }[];
  }[];
  onToggle: (categoryId: string, itemId: string, selected: boolean) => void;
  onToggleCategory: (categoryId: string, selected: boolean) => void;
}

const MultiCategorySelect: React.FC<MultiCategorySelectProps> = ({
  items,
  onToggle,
  onToggleCategory,
}) => {
  return (
    <div className={styles.container}>
      {items.map(({categoryId, categoryLabel, categoryItems}) => {
        const selectedCount = categoryItems.filter(
          item => item.selected
        ).length;
        const labelWithCount = `${categoryLabel} (${selectedCount})`;
        return (
          <div className={styles.section} key={categoryId}>
            <CollapsibleSection
              headerContent={
                selectedCount > 0 ? (
                  <StrongText>{labelWithCount}</StrongText>
                ) : (
                  labelWithCount
                )
              }
            >
              <div className={styles.options}>
                <div className={styles.checkbox}>
                  <Checkbox
                    label={'(select all)'}
                    checked={selectedCount === categoryItems.length}
                    name={'select-all'}
                    onChange={event =>
                      onToggleCategory(categoryId, event.target.checked)
                    }
                    size="s"
                  />
                </div>
                {categoryItems.map(({id, label, selected}) => {
                  return (
                    <div className={styles.checkbox} key={id}>
                      <Checkbox
                        label={label}
                        checked={selected}
                        name={id}
                        onChange={event =>
                          onToggle(categoryId, id, event.target.checked)
                        }
                        size="s"
                      />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          </div>
        );
      })}
    </div>
  );
};

export default MultiCategorySelect;
