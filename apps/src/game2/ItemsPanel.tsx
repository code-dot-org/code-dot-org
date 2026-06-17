import React, {useCallback, useEffect, useState} from 'react';

import {assetUrl} from './imageCache';
import {generateImage, uploadAssetToProject} from './itemGeneration';
import {Game2ItemEntry, Game2ItemType} from './types';

import moduleStyles from './game2View.module.scss';

interface ItemsPanelProps {
  items: Game2ItemEntry[];
  channelId?: string;
  onItemsChange: (items: Game2ItemEntry[]) => void;
  onDeleteItem: (name: string) => void;
  onGeneratingChange?: (generating: boolean) => void;
}

const ITEM_TYPE_OPTIONS: {value: Game2ItemType; label: string}[] = [
  {value: 'sprite', label: 'Sprite (character/item)'},
  {value: 'block', label: 'Block (platform piece)'},
  {value: 'background', label: 'Background'},
];

const ItemsPanel: React.FunctionComponent<ItemsPanelProps> = ({
  items,
  channelId,
  onItemsChange,
  onDeleteItem,
  onGeneratingChange,
}) => {
  /** Set of item indices (or 'new') currently being generated. */
  const [generatingSet, setGeneratingSet] = useState<Set<number | 'new'>>(
    () => new Set()
  );

  const generating = generatingSet.size > 0;

  // Notify parent whenever generating state changes.
  useEffect(() => {
    onGeneratingChange?.(generating);
  }, [generating, onGeneratingChange]);

  const startGenerating = useCallback((index: number | null) => {
    setGeneratingSet(prev => {
      const next = new Set(prev);
      next.add(index ?? 'new');
      return next;
    });
  }, []);

  const stopGenerating = useCallback((index: number | null) => {
    setGeneratingSet(prev => {
      const next = new Set(prev);
      next.delete(index ?? 'new');
      return next;
    });
  }, []);

  // Side pane state.
  /** Index into items[] being edited, or null for "new item" mode. */
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [itemType, setItemType] = useState<Game2ItemType>('sprite');

  // When an item is clicked, populate the side pane with its data.
  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) {
        return;
      }
      setEditingIndex(index);
      setName(item.name);
      setPrompt(item.prompt ?? '');
      setItemType(item.itemType ?? 'sprite');
    },
    [items]
  );

  // Clear pane for new item.
  const startNew = useCallback(() => {
    setEditingIndex(null);
    setName('');
    setPrompt('');
    setItemType('sprite');
  }, []);

  // If the selected item is deleted externally, clear the pane.
  useEffect(() => {
    if (editingIndex !== null && editingIndex >= items.length) {
      startNew();
    }
  }, [editingIndex, items.length, startNew]);

  const currentKeyGenerating = generatingSet.has(editingIndex ?? 'new');
  const canGenerate = !!name.trim() && !!prompt.trim() && !currentKeyGenerating;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !channelId) {
      return;
    }
    const genKey = editingIndex;
    startGenerating(genKey);
    try {
      const trimmedName = name.trim();
      const trimmedPrompt = prompt.trim();
      const {filename, uint8Array, mediaType} = await generateImage(
        trimmedPrompt,
        channelId,
        itemType
      );
      await uploadAssetToProject(channelId, filename, uint8Array, mediaType);

      const newEntry: Game2ItemEntry = {
        name: trimmedName,
        filename,
        prompt: trimmedPrompt,
        itemType,
      };

      if (editingIndex !== null && editingIndex < items.length) {
        // Replace existing item.
        const updated = [...items];
        updated[editingIndex] = newEntry;
        onItemsChange(updated);
      } else {
        // Add new item.
        onItemsChange([...items, newEntry]);
        // Select the newly created item.
        setEditingIndex(items.length);
      }
    } finally {
      stopGenerating(genKey);
    }
  }, [
    canGenerate,
    channelId,
    name,
    prompt,
    itemType,
    editingIndex,
    items,
    onItemsChange,
    startGenerating,
    stopGenerating,
  ]);

  return (
    <div className={moduleStyles.itemsPanelLayout}>
      {/* Item grid */}
      <div className={moduleStyles.itemsPanel}>
        <div className={moduleStyles.itemsGrid}>
          {items.map((img, i) => (
            <div key={img.filename} className={moduleStyles.itemEntry}>
              <div
                className={`${moduleStyles.itemCell} ${
                  editingIndex === i ? moduleStyles.itemCellSelected : ''
                }`}
                onClick={() => selectItem(i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    selectItem(i);
                  }
                }}
              >
                <img
                  src={channelId ? assetUrl(channelId, img.filename) : ''}
                  alt={img.name}
                />
                {generatingSet.has(i) && (
                  <div className={moduleStyles.itemSpinnerOverlay}>
                    <i className="fa fa-spinner fa-spin fa-2x" />
                  </div>
                )}
                <button
                  type="button"
                  className={moduleStyles.itemDeleteBtn}
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteItem(img.name);
                  }}
                  aria-label={`Delete ${img.name}`}
                >
                  <i className="fa fa-times" />
                </button>
              </div>
              <span className={moduleStyles.itemName}>{img.name}</span>
            </div>
          ))}
          {/* Add new item button at the end */}
          <div className={moduleStyles.itemEntry}>
            <button
              type="button"
              className={`${moduleStyles.itemCell} ${moduleStyles.addItemCell}`}
              onClick={startNew}
              disabled={generating}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Side pane */}
      <div className={moduleStyles.itemSidePane}>
        <div className={moduleStyles.codeGenLabel}>
          {editingIndex !== null ? 'Edit item' : 'New item'}
        </div>
        <input
          className={moduleStyles.dialogInput}
          type="text"
          placeholder="Name (e.g. cat, tree, hero)"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={generating}
        />
        <input
          className={moduleStyles.dialogInput}
          type="text"
          placeholder="Describe the item you want..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={generating}
        />
        <select
          className={moduleStyles.dialogSelect}
          value={itemType}
          onChange={e => setItemType(e.target.value as Game2ItemType)}
          disabled={generating}
        >
          {ITEM_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={moduleStyles.codeGenSubmit}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {currentKeyGenerating
            ? 'Generating...'
            : editingIndex !== null
            ? 'Regenerate'
            : 'Generate'}
        </button>
      </div>
    </div>
  );
};

export default ItemsPanel;
