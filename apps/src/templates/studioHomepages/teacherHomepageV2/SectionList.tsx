import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, {useState} from 'react';

import {removeSectionOrThrow} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionMap} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionCard} from './SectionCard';
import {SectionDeleteModal} from './SectionDeleteModal';

import styles from './teacherHomepage.module.scss';

interface SectionListProps {
  showHiddenOnly: boolean;
}

const NO_SECTION_ID = -1;

export const SectionList: React.FC<SectionListProps> = ({showHiddenOnly}) => {
  const dispatch = useAppDispatch();
  const [sectionToDelete, setSectionToDelete] = useState<number>(NO_SECTION_ID);
  const sections: SectionMap = useAppSelector(
    state => state.teacherSections.sections
  );

  const [sortableSectionIds, setSortableSectionIds] = useState<number[]>(
    Object.entries(sections)
      .filter(([_id, section]) => section.participantType === 'student')
      .filter(([_id, section]) => showHiddenOnly === section.hidden)
      .map(([id, _section]) => Number(id))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 10},
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;

      if (over && active.id !== over.id) {
        setSortableSectionIds(items => {
          const oldIndex = items.indexOf(active.id as number);
          const newIndex = items.indexOf(over.id as number);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [setSortableSectionIds]
  );

  React.useEffect(() => {
    sortableSectionIds;
    // TODO(lfm): Update the order of sections in the backend
  }, [sortableSectionIds]);

  const onDeleteClickCallback = (sectionId: number) => {
    setSectionToDelete(sectionId);
  };

  const onCloseDeleteDialog = () => {
    setSectionToDelete(NO_SECTION_ID);
  };

  const deleteSection = () => {
    HttpClient.delete(`/dashboardapi/sections/${sectionToDelete}`, true)
      .then(() => {
        dispatch(removeSectionOrThrow(sectionToDelete));
        setSectionToDelete(NO_SECTION_ID);
      })
      .catch((error: Error) => {
        alert(i18n.unexpectedError());
        console.error(error);
        setSectionToDelete(NO_SECTION_ID);
      });
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={sortableSectionIds}
          strategy={verticalListSortingStrategy}
        >
          <ol className={styles.sectionList}>
            {sortableSectionIds.map(id =>
              sections[id] ? (
                <SectionCard
                  id={id}
                  key={id}
                  section={sections[id]}
                  onDeleteClickCallback={onDeleteClickCallback}
                />
              ) : null
            )}
          </ol>
        </SortableContext>
      </DndContext>
      {sectionToDelete > NO_SECTION_ID && (
        <SectionDeleteModal
          onCloseCallback={onCloseDeleteDialog}
          sectionDeleteCallback={deleteSection}
        />
      )}
    </div>
  );
};
