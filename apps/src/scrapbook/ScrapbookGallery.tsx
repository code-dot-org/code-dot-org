import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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
import {
  IconButton as MuiIconButton,
  Link as MuiLink,
  Typography as MuiTypography,
} from '@mui/material';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import ScrapbookEntryDialog from './ScrapbookEntryDialog';
import {EntryText, SCRAPBOOK_STEMS} from './stems';

import moduleStyles from './scrapbook-gallery.module.scss';

interface ScrapbookEntry {
  id: number;
  script_id: number | null;
  level_id: number | null;
  channel_id: string | null;
  script_title: string | null;
  level_name: string | null;
  level_url: string | null;
  before_asset_url: string | null;
  after_asset_url: string | null;
  entry_text: EntryText | null;
}

interface Props {
  userName: string;
}

export default function ScrapbookGallery({userName}: Props) {
  const [entries, setEntries] = useState<ScrapbookEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ScrapbookEntry | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScrapbookEntry | null>(null);

  const fetchEntries = () => {
    let cancelled = false;
    HttpClient.fetchJson<ScrapbookEntry[]>('/api/v1/scrapbook_entries')
      .then(({value}) => {
        if (!cancelled) setEntries(value);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load scrapbook entries.');
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(fetchEntries, []);

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
        `/api/v1/scrapbook_entries/${pendingDelete.id}`,
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
      <MuiTypography variant="h3" className={moduleStyles.title}>
        {userName}&rsquo;s Scrapbook
      </MuiTypography>
      {error && (
        <MuiTypography variant="body2" className={moduleStyles.error}>
          {error}
        </MuiTypography>
      )}
      {!error && entries === null && (
        <MuiTypography variant="body2" className={moduleStyles.loading}>
          Loading...
        </MuiTypography>
      )}
      {!error && entries !== null && entries.length === 0 && (
        <MuiTypography variant="body2" className={moduleStyles.empty}>
          No key learning moments saved yet. Click the{' '}
          <FontAwesomeV6Icon iconName="thumbtack" /> button on any level or
          project to add one.
        </MuiTypography>
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
                  onEditRequested={() => setEditingEntry(entry)}
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
      <ScrapbookEntryDialog
        isOpen={!!editingEntry}
        onClose={() => {
          setEditingEntry(null);
          fetchEntries();
        }}
        scriptId={editingEntry?.script_id ?? undefined}
        levelId={editingEntry?.level_id ?? undefined}
        channelId={editingEntry?.channel_id ?? undefined}
      />
    </div>
  );
}

function SortableEntryCard({
  entry,
  onEditRequested,
  onDeleteRequested,
}: {
  entry: ScrapbookEntry;
  onEditRequested: () => void;
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
          <MuiIconButton
            variant="text"
            color="secondary"
            size="small"
            onClick={() => setIsWide(w => !w)}
            aria-label={isWide ? 'Shrink to row' : 'Expand to full row'}
            title={isWide ? 'Shrink to row' : 'Expand to full row'}
          >
            <FontAwesomeV6Icon iconName={isWide ? 'compress' : 'expand'} />
          </MuiIconButton>
          <MuiIconButton
            variant="text"
            color="secondary"
            size="small"
            onClick={onEditRequested}
            aria-label="Edit entry"
            title="Edit entry"
          >
            <FontAwesomeV6Icon iconName="pen-to-square" />
          </MuiIconButton>
          <MuiIconButton
            variant="text"
            color="error"
            size="small"
            onClick={onDeleteRequested}
            aria-label="Delete entry"
            title="Delete entry"
          >
            <FontAwesomeV6Icon iconName="trash" />
          </MuiIconButton>
        </div>
      </div>
      <div className={moduleStyles.cardBody}>
        <MuiTypography variant="h5">
          {entry.script_title ||
            (entry.channel_id
              ? 'Standalone project'
              : `Script ${entry.script_id}`)}
        </MuiTypography>
        {SCRAPBOOK_STEMS.map(({key, label}) => (
          <Stem
            key={key}
            heading={label}
            text={entry.entry_text?.[key] || null}
          />
        ))}
        {entry.level_url && (
          <MuiLink
            href={entry.level_url}
            className={moduleStyles.levelLink}
            underline="hover"
          >
            {entry.channel_id ? 'View project' : 'View level'} &rarr;
          </MuiLink>
        )}
      </div>
      {hasScreenshots && (
        <div className={moduleStyles.cardScreenshots}>
          {entry.before_asset_url && (
            <div className={moduleStyles.screenshotSlot}>
              <MuiTypography
                variant="overline3"
                className={moduleStyles.screenshotLabel}
              >
                Before
              </MuiTypography>
              <img
                src={entry.before_asset_url}
                alt="before"
                className={moduleStyles.screenshotImg}
              />
            </div>
          )}
          {entry.after_asset_url && (
            <div className={moduleStyles.screenshotSlot}>
              <MuiTypography
                variant="overline3"
                className={moduleStyles.screenshotLabel}
              >
                After
              </MuiTypography>
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
      <MuiTypography variant="body4" className={moduleStyles.stemHeading}>
        {heading}
      </MuiTypography>
      {text ? (
        <MuiTypography variant="body3" className={moduleStyles.stemText}>
          {text}
        </MuiTypography>
      ) : (
        <MuiTypography variant="body3" className={moduleStyles.stemEmpty}>
          (no reflection)
        </MuiTypography>
      )}
    </div>
  );
}
