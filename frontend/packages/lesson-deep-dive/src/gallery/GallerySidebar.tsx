import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {
  GallerySection,
  GallerySort,
  GalleryUnit,
} from './types';
import classNames from 'classnames';
import {FC} from 'react';

import styles from './challenge-gallery.module.scss';

// The section dropdown's value for the caller's own-work view (no section).
const MY_PROJECTS_VALUE = 'mine';

interface GallerySidebarProps {
  sections: GallerySection[];
  selectedSectionId: number | null;
  // Null means "My projects": the caller's own submissions.
  onSectionChange: (sectionId: number | null) => void;
  units: GalleryUnit[];
  selectedUnitId: number;
  onUnitChange: (unitId: number) => void;
  // {unit_id => submission count} for the selected section.
  unitCounts: Record<string, number>;
  sort: GallerySort;
  onSortChange: (sort: GallerySort) => void;
}

// The gallery's filter rail: class section picker, unit list with
// per-unit submission counts, and sort order.
const GallerySidebar: FC<GallerySidebarProps> = ({
  sections,
  selectedSectionId,
  onSectionChange,
  units,
  selectedUnitId,
  onUnitChange,
  unitCounts,
  sort,
  onSortChange,
}) => (
  <aside className={styles.sidebar}>
    {sections.length > 0 && (
      <div className={styles.control}>
        <h2 className={styles.panelLabel} id="gallery-section-label">
          Class Sections
        </h2>
        <SimpleDropdown
          name="gallery-section"
          labelText="Class Sections"
          isLabelVisible={false}
          color="white"
          size="m"
          className={styles.dropdown}
          items={[
            ...sections.map(section => ({
              value: section.id.toString(),
              text: section.name,
            })),
            {value: MY_PROJECTS_VALUE, text: 'My projects'},
          ]}
          selectedValue={selectedSectionId?.toString() ?? MY_PROJECTS_VALUE}
          onChange={event =>
            onSectionChange(
              event.target.value === MY_PROJECTS_VALUE
                ? null
                : Number(event.target.value)
            )
          }
        />
      </div>
    )}
    <nav className={styles.unitNav} aria-label="Units">
      <h2 className={classNames(styles.panelLabel, styles.unitHeading)}>
        Unit
      </h2>
      <ul className={styles.unitList}>
        {units.map(unit => {
          const selected = unit.id === selectedUnitId;
          return (
            <li key={unit.id}>
              <button
                type="button"
                className={classNames(
                  styles.unitButton,
                  selected && styles.selected
                )}
                aria-current={selected || undefined}
                onClick={() => onUnitChange(unit.id)}
              >
                <span className={styles.unitName}>
                  Unit {unit.position}: {unit.name}
                </span>
                <span className={styles.unitCount}>
                  {unitCounts[unit.id.toString()] || 0}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
    <div className={styles.control}>
      <h2 className={styles.panelLabel}>Sort</h2>
      <SimpleDropdown
        name="gallery-sort"
        labelText="Sort"
        isLabelVisible={false}
        color="white"
        size="m"
        className={styles.dropdown}
        items={[
          {value: 'recent', text: 'Most recent'},
          {value: 'oldest', text: 'Oldest'},
        ]}
        selectedValue={sort}
        onChange={event => onSortChange(event.target.value as GallerySort)}
      />
    </div>
  </aside>
);

export default GallerySidebar;
