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
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Link as MuiLink} from '@mui/material';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import moduleStyles from './PortfolioGallery.module.scss';

interface PortfolioEntry {
  id: number;
  script_id: number;
  level_id: number;
  script_title: string | null;
  level_name: string | null;
  level_url: string | null;
  before_asset_url: string | null;
  after_asset_url: string | null;
  at_first_text: string | null;
  but_then_text: string | null;
  and_now_text: string | null;
}

interface Props {
  userName: string;
}

export default function PortfolioGallery({userName}: Props) {
  const [entries, setEntries] = useState<PortfolioEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PortfolioEntry | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    HttpClient.fetchJson<PortfolioEntry[]>('/api/v1/portfolio_entries')
      .then(({value}) => {
        if (!cancelled) setEntries(value);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load portfolio entries.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id || !entries) return;
    const oldIndex = entries.findIndex(e => e.id === active.id);
    const newIndex = entries.findIndex(e => e.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setEntries(arrayMove(entries, oldIndex, newIndex));
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !entries) return;
    setDeleting(true);
    try {
      const response = await HttpClient.delete(
        `/api/v1/portfolio_entries/${pendingDelete.id}`,
        true
      );
      if (response.ok) {
        setEntries(entries.filter(e => e.id !== pendingDelete.id));
        setPendingDelete(null);
      } else {
        setError('Could not delete entry. Try again.');
      }
    } catch {
      setError('Could not delete entry. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={moduleStyles.page}>
      <h1 className={moduleStyles.title}>{userName}&rsquo;s Aha! Moments</h1>
      {error && <div className={moduleStyles.error}>{error}</div>}
      {!error && entries === null && (
        <div className={moduleStyles.loading}>Loading...</div>
      )}
      {!error && entries !== null && entries.length === 0 && (
        <div className={moduleStyles.empty}>
          No Aha! moments saved yet. Click the +Portfolio button on any level
          to add one.
        </div>
      )}
      {!error && entries !== null && entries.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entries.map(e => e.id)}
            strategy={rectSortingStrategy}
          >
            <div className={moduleStyles.entries}>
              {entries.map(entry => (
                <SortableEntryCard
                  key={entry.id}
                  entry={entry}
                  onDeleteRequested={() => setPendingDelete(entry)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {pendingDelete && (
        <Dialog
          title="Delete this entry?"
          description="This will permanently delete your reflection and any captured screenshots."
          onClose={deleting ? undefined : () => setPendingDelete(null)}
          primaryButtonProps={{
            children: deleting ? 'Deleting...' : 'Delete',
            color: 'error',
            onClick: confirmDelete,
            disabled: deleting,
          }}
          secondaryButtonProps={{
            children: 'Cancel',
            onClick: () => setPendingDelete(null),
            disabled: deleting,
          }}
        />
      )}
    </div>
  );
}

function SortableEntryCard({
  entry,
  onDeleteRequested,
}: {
  entry: PortfolioEntry;
  onDeleteRequested: () => void;
}) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id: entry.id});
  const [isWide, setIsWide] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const hasScreenshots = !!(entry.before_asset_url || entry.after_asset_url);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${moduleStyles.card} ${isWide ? moduleStyles.cardWide : ''}`}
    >
      <div className={moduleStyles.cardHeader}>
        <div
          {...attributes}
          {...listeners}
          className={moduleStyles.dragHandle}
          style={{cursor: isDragging ? 'grabbing' : 'grab'}}
          aria-label="Drag to reorder"
        >
          <FontAwesomeV6Icon iconName="grip-vertical" />
        </div>
        <div className={moduleStyles.cardActions}>
          <button
            type="button"
            className={moduleStyles.iconButton}
            onClick={() => setIsWide(w => !w)}
            aria-label={isWide ? 'Shrink to row' : 'Expand to full row'}
            title={isWide ? 'Shrink to row' : 'Expand to full row'}
          >
            <FontAwesomeV6Icon
              iconName={isWide ? 'compress' : 'expand'}
            />
          </button>
          <button
            type="button"
            className={moduleStyles.deleteButton}
            onClick={onDeleteRequested}
            aria-label="Delete entry"
            title="Delete entry"
          >
            <FontAwesomeV6Icon iconName="trash" />
          </button>
        </div>
      </div>
      <div className={moduleStyles.cardBody}>
        <div className={moduleStyles.meta}>
          {entry.script_title || `Script ${entry.script_id}`}
        </div>
        <Stem heading="At first..." text={entry.at_first_text} />
        <Stem heading="But then..." text={entry.but_then_text} />
        <Stem heading="And now..." text={entry.and_now_text} />
        {entry.level_url && (
          <MuiLink
            href={entry.level_url}
            className={moduleStyles.levelLink}
            underline="hover"
          >
            View level &rarr;
          </MuiLink>
        )}
      </div>
      {hasScreenshots && (
        <div className={moduleStyles.cardScreenshots}>
          {entry.before_asset_url && (
            <div className={moduleStyles.screenshotSlot}>
              <div className={moduleStyles.screenshotLabel}>Before</div>
              <img
                src={entry.before_asset_url}
                alt="before"
                className={moduleStyles.screenshotImg}
              />
            </div>
          )}
          {entry.after_asset_url && (
            <div className={moduleStyles.screenshotSlot}>
              <div className={moduleStyles.screenshotLabel}>After</div>
              <img
                src={entry.after_asset_url}
                alt="after"
                className={moduleStyles.screenshotImg}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stem({heading, text}: {heading: string; text: string | null}) {
  return (
    <div className={moduleStyles.stemBlock}>
      <div className={moduleStyles.stemHeading}>{heading}</div>
      {text ? (
        <div className={moduleStyles.stemText}>{text}</div>
      ) : (
        <div className={moduleStyles.stemEmpty}>(no reflection)</div>
      )}
    </div>
  );
}
