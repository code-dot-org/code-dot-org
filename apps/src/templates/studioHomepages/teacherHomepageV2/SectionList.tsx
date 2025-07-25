import {
  Active,
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  Over,
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
import _ from 'lodash';
import React, {useState} from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {AgeGatedSectionsBanner} from '@cdo/apps/templates/policy_compliance/AgeGatedSectionsModal/AgeGatedSectionsBanner';
import {
  removeSectionOrThrow,
  setSectionOrder,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {atRiskAgeGatedSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {SectionMap} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  getFilteredSectionOrderIds,
  saveSectionOrder,
} from '../../teacherDashboard/sectionOrderUtils';
import CoteacherInviteNotification from '../CoteacherInviteNotification';

import {SectionCard} from './SectionCard';
import {SectionDeleteModal} from './SectionDeleteModal';

import styles from './teacherHomepage.module.scss';

interface SectionListProps {
  studioUrlPrefix: string;
  showHiddenOnly: boolean;
}

const NO_SECTION_ID = -1;

function moveSection(
  active: Active,
  over: Over
): React.SetStateAction<number[]> {
  return items => {
    const oldIndex = items.indexOf(active.id as number);
    const newIndex = items.indexOf(over.id as number);

    return arrayMove(items, oldIndex, newIndex);
  };
}

export const SectionList: React.FC<SectionListProps> = ({
  studioUrlPrefix,
  showHiddenOnly,
}) => {
  const dispatch = useAppDispatch();

  const [CAPmodalOpen, setCAPModalOpen] = React.useState(false);
  const toggleCAPModal = () => {
    setCAPModalOpen(!CAPmodalOpen);
  };

  const ageGatedSections = useAppSelector(atRiskAgeGatedSections);

  const shouldDisplayAtRiskAgeGatedWarning = () => {
    return ageGatedSections?.length > 0;
  };

  const [sectionToDelete, setSectionToDelete] = useState<number>(NO_SECTION_ID);
  const sections: SectionMap = useAppSelector(
    state => state.teacherSections.sections
  );

  const reduxSectionOrder: number[] = useAppSelector(
    state => state.teacherSections.sectionOrder
  );

  const sectionsAreLoaded = useAppSelector(
    state => state.teacherSections.asyncLoadComplete
  );

  const [sortableSectionIds, setSortableSectionIds] =
    useState<number[]>(reduxSectionOrder);

  // Hidden sections are not sortable
  const hiddenSectionIds = React.useMemo(
    () =>
      Object.entries(sections)
        .filter(([_id, section]) => section.participantType === 'student')
        .filter(([_id, section]) => section.hidden)
        .map(([id, _section]) => Number(id)),
    [sections]
  );

  // Update sortableSectionIds when sections change
  React.useEffect(() => {
    const newSectionOrder = getFilteredSectionOrderIds(
      Object.values(sections),
      sortableSectionIds
    );

    if (_.xor(newSectionOrder, sortableSectionIds).length > 0) {
      setSortableSectionIds(newSectionOrder);
    }
    // We do not need to add/remove sections when the section order changes, only when the sections from redux change
    // This also prevents flickering when archiving sections
  }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setSortableSectionIds(moveSection(active, over));
      }
    },
    [setSortableSectionIds]
  );

  React.useEffect(() => {
    if (!_.isEqual(sortableSectionIds, reduxSectionOrder)) {
      dispatch(setSectionOrder(sortableSectionIds, true));
      // Update the backend with the new order
      // This is done in `setSectionOrder` only when there are sections to be added or removed.
      // We need to save manually here because the order is different.
      saveSectionOrder(sortableSectionIds);
    }
  }, [sortableSectionIds, dispatch, reduxSectionOrder]);

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
        console.error(error);
        setSectionToDelete(NO_SECTION_ID);
      });
  };

  const sectionIdsToShow = showHiddenOnly
    ? hiddenSectionIds
    : sortableSectionIds;

  return (
    <div id="ui-test-section-list">
      {sectionsAreLoaded ? (
        <>
          {shouldDisplayAtRiskAgeGatedWarning() && (
            <AgeGatedSectionsBanner
              toggleModal={toggleCAPModal}
              modalOpen={CAPmodalOpen}
              ageGatedSections={ageGatedSections}
            />
          )}
          <CoteacherInviteNotification isForPl={false} destructiveLoad={true} />
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
                {sectionIdsToShow.map(id =>
                  sections[id] ? (
                    <SectionCard
                      id={id}
                      key={id}
                      section={sections[id]}
                      onDeleteClickCallback={onDeleteClickCallback}
                      studioUrlPrefix={studioUrlPrefix}
                    />
                  ) : null
                )}
              </ol>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <Spinner size="large" />
      )}
      {sectionToDelete > NO_SECTION_ID && (
        <SectionDeleteModal
          onCloseCallback={onCloseDeleteDialog}
          sectionDeleteCallback={deleteSection}
        />
      )}
    </div>
  );
};
