import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import React, {FC, ReactNode, Ref, useId, useRef, useState} from 'react';

import {NewCanvasText, TEXT_STYLES, TextStyle} from './canvasTextUtils';
import {Sticker, STICKER_SECTIONS} from './stickers';

import styles from './edit-toolbar.module.scss';

type PanelName = 'text' | 'stickers';

const TEXT_COLORS = [
  {name: 'Red', value: '#e02d16'},
  {name: 'Orange', value: '#f2790f'},
  {name: 'Yellow', value: '#f2b807'},
  {name: 'Lime', value: '#7cb342'},
  {name: 'Green', value: '#3ea33e'},
  {name: 'Teal', value: '#0093a4'},
  {name: 'Blue', value: '#2b6cb0'},
  {name: 'Purple', value: '#9657c7'},
  {name: 'Pink', value: '#e0529c'},
  {name: 'Slate', value: '#5b6b7b'},
  {name: 'Brown', value: '#8b5e3c'},
  {name: 'Black', value: '#000000'},
  {name: 'White', value: '#ffffff', light: true},
];

interface ToolButtonProps {
  label: string;
  iconName: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}

const ToolButton: FC<ToolButtonProps> = ({
  label,
  iconName,
  pressed,
  disabled = false,
  onClick,
  buttonRef,
}) => (
  <Tooltip title={label} placement="right">
    {/* A disabled button fires no events, so the tooltip listens here. */}
    <span>
      <IconButton
        ref={buttonRef}
        variant="text"
        color="tertiary"
        size="small"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={pressed ? styles.selectedTool : undefined}
      >
        <FontAwesomeV6Icon iconName={iconName} />
      </IconButton>
    </span>
  </Tooltip>
);

interface PanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const Panel: FC<PanelProps> = ({title, onClose, children}) => {
  const titleId = useId();
  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.panelHeader}>
        <Typography
          id={titleId}
          component="h3"
          variant="overline2"
          className={styles.panelTitle}
        >
          {title}
        </Typography>
        <IconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          <FontAwesomeV6Icon iconName="xmark" />
        </IconButton>
      </div>
      {children}
    </section>
  );
};

interface TextPanelProps {
  onClose: () => void;
  onAddText: (text: NewCanvasText) => void;
}

const TextPanel: FC<TextPanelProps> = ({onClose, onAddText}) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [textStyle, setTextStyle] = useState<TextStyle>('Normal');
  const inputId = useId();
  const groupName = useId();
  const trimmed = text.trim();

  const handleAdd = () => {
    onAddText({text: trimmed, color, style: textStyle});
    setText('');
  };

  return (
    <Panel title="Text" onClose={onClose}>
      <div className={styles.section}>
        <Typography
          component="label"
          variant="body4"
          htmlFor={inputId}
          className={styles.sectionLabel}
        >
          Type your text
        </Typography>
        <textarea
          id={inputId}
          className={styles.textInput}
          placeholder="Write something"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>
      <fieldset className={styles.section}>
        <Typography
          component="legend"
          variant="body4"
          className={styles.sectionLabel}
        >
          Color
        </Typography>
        <div className={styles.swatches}>
          {TEXT_COLORS.map(({name, value, light}) => (
            <label
              key={value}
              className={`${styles.swatch} ${light ? styles.lightSwatch : ''}`}
              style={{backgroundColor: value}}
            >
              <input
                type="radio"
                name={`${groupName}-color`}
                className={styles.radio}
                aria-label={name}
                checked={color === value}
                onChange={() => setColor(value)}
              />
              {color === value && <FontAwesomeV6Icon iconName="check" />}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.section}>
        <Typography
          component="legend"
          variant="body4"
          className={styles.sectionLabel}
        >
          Style
        </Typography>
        <div className={styles.options}>
          {TEXT_STYLES.map(option => (
            <label key={option} className={styles.chip}>
              <input
                type="radio"
                name={`${groupName}-style`}
                className={styles.radio}
                checked={textStyle === option}
                onChange={() => setTextStyle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.section}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          disabled={!trimmed}
          onClick={handleAdd}
        >
          Add to video
        </Button>
      </div>
    </Panel>
  );
};

interface StickersPanelProps {
  onClose: () => void;
  onAddSticker: (sticker: Sticker) => void;
}

const StickersPanel: FC<StickersPanelProps> = ({onClose, onAddSticker}) => (
  <Panel title="Stickers" onClose={onClose}>
    {STICKER_SECTIONS.map(({title, stickers}) => (
      <div key={title} className={styles.section}>
        <Typography variant="body4" className={styles.sectionLabel}>
          {title}
        </Typography>
        <div className={styles.stickers}>
          {stickers.map(sticker => (
            <Tooltip
              key={sticker.name}
              title={sticker.name}
              // Closes on leaving the sticker, so it never covers the next one
              disableInteractive
              slotProps={{tooltip: {className: styles.stickerTooltip}}}
            >
              <IconButton
                variant="text"
                color="tertiary"
                aria-label={sticker.name}
                onClick={() => onAddSticker(sticker)}
                className={styles.sticker}
              >
                <img src={sticker.src} alt="" />
              </IconButton>
            </Tooltip>
          ))}
        </div>
      </div>
    ))}
  </Panel>
);

interface EditToolbarProps {
  onAddText: (text: NewCanvasText) => void;
  onAddSticker: (sticker: Sticker) => void;
  canDelete: boolean;
  onDelete: () => void;
}

const EditToolbar: FC<EditToolbarProps> = ({
  onAddText,
  onAddSticker,
  canDelete,
  onDelete,
}) => {
  const [openPanel, setOpenPanel] = useState<PanelName | null>(null);
  const textButtonRef = useRef<HTMLButtonElement>(null);
  const stickersButtonRef = useRef<HTMLButtonElement>(null);

  const toggle = (panel: PanelName) =>
    setOpenPanel(open => (open === panel ? null : panel));

  const close = () => {
    const opener = openPanel === 'text' ? textButtonRef : stickersButtonRef;
    opener.current?.focus();
    setOpenPanel(null);
  };

  return (
    <div className={styles.editTools}>
      <div role="group" aria-label="Edit video" className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <ToolButton label="Effects" iconName="sparkles" disabled />
          <ToolButton
            label="Text"
            iconName="text"
            pressed={openPanel === 'text'}
            onClick={() => toggle('text')}
            buttonRef={textButtonRef}
          />
          <ToolButton
            label="Stickers"
            iconName="face-smile"
            pressed={openPanel === 'stickers'}
            onClick={() => toggle('stickers')}
            buttonRef={stickersButtonRef}
          />
        </div>
        <div className={styles.toolGroup}>
          <ToolButton label="Rotate left" iconName="rotate-left" disabled />
          <ToolButton label="Rotate right" iconName="rotate-right" disabled />
          <ToolButton
            label="Delete"
            iconName="trash"
            disabled={!canDelete}
            onClick={onDelete}
          />
        </div>
      </div>
      {openPanel === 'text' && (
        <TextPanel onClose={close} onAddText={onAddText} />
      )}
      {openPanel === 'stickers' && (
        <StickersPanel onClose={close} onAddSticker={onAddSticker} />
      )}
    </div>
  );
};

export default EditToolbar;
