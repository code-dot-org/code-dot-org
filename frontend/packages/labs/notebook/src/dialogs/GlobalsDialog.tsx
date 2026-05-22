/**
 * GlobalsDialog — MUI Dialog for authoring notebook-level globals.
 *
 * Globals are stored in `notebook.metadata.globals` as a map from identifier
 * name to a `Global` record that carries a mandatory `default` value plus
 * optional per-locale overrides.  This dialog lets curriculum authors add,
 * edit, and delete those globals without touching raw JSON.
 *
 * Layout:
 *   - Left/top pane: scrollable list of variables with an "Add variable" button.
 *   - Right/bottom pane: edit panel for the selected variable (name, default
 *     value, per-locale overrides, delete button).
 *
 * On narrow viewports the two panes stack vertically (column direction).
 * On wider viewports they sit side-by-side (row direction).
 *
 * Save: builds an updated notebook with the edited globals map and calls
 * `onSave(updated)`.  Cancel / Close: calls `onClose()` without mutating
 * the notebook.
 */

import {useState, useCallback} from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type {Global, Notebook} from '../storage/NotebookLabDB';
import type {SupportedLocale} from '../i18n/localeMeta';

// ---------------------------------------------------------------------------
// Exported constants
// ---------------------------------------------------------------------------

/**
 * Regex that a globals identifier must satisfy: starts with a letter or
 * underscore, followed by zero or more letters, digits, or underscores.
 * Matches the pattern used by `applyGlobals` in globalsTemplating.ts so
 * authoring validation and runtime substitution stay in sync.
 */
export const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/**
 * Mutable local copy of a single global variable during editing.
 * The `name` field is kept separately so renames do not require key surgery on
 * the globals map until Save is pressed.
 */
interface EditableGlobal {
  /** Current identifier name (may be invalid until the user fixes it). */
  name: string;
  /** Default (locale-neutral) value. */
  defaultValue: string;
  /** Per-locale override values; keyed by IETF locale tag. */
  localeValues: Record<string, string>;
}

// ---------------------------------------------------------------------------
// String constants
// ---------------------------------------------------------------------------

/** Dialog title. */
const STR_TITLE = 'Edit Variables';

/** Placeholder displayed in the left pane when no variables exist. */
const STR_NO_VARIABLES = 'No variables yet.';

/** Label for the "Add variable" button. */
const STR_ADD_VARIABLE = 'Add variable';

/** Label for the Name text field. */
const STR_NAME_LABEL = 'Name';

/** Helper text shown below the Name field when the identifier is invalid. */
const STR_NAME_INVALID =
  'Must start with a letter or underscore; letters, digits, and underscores only.';

/** Label for the Default value text field. */
const STR_DEFAULT_LABEL = 'Default value';

/** Label for the Delete button. */
const STR_DELETE = 'Delete variable';

/** Label for the Save action. */
const STR_SAVE = 'Save';

/** Label for the Cancel action. */
const STR_CANCEL = 'Cancel';

/** Prompt shown in the right pane when no variable is selected. */
const STR_SELECT_PROMPT = 'Select a variable to edit.';

// ---------------------------------------------------------------------------
// Locale list (non-default locales only)
// ---------------------------------------------------------------------------

/**
 * The four locales the lab supports, minus en-US which is the default.
 * An override field is rendered for each of these in the edit panel.
 */
const OVERRIDE_LOCALES: SupportedLocale[] = ['ja-JP', 'hi-IN', 'fa-IR'];

/** Human-readable label for each override locale. */
const LOCALE_LABEL: Record<string, string> = {
  'ja-JP': 'Japanese (ja-JP)',
  'hi-IN': 'Hindi (hi-IN)',
  'fa-IR': 'Farsi (fa-IR)',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for GlobalsDialog. */
export interface GlobalsDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** The notebook whose globals are being edited. */
  notebook: Notebook;
  /** Called when the user dismisses the dialog without saving. */
  onClose: () => void;
  /**
   * Called when the user saves their edits.
   * @param updated A new notebook with the modified globals map.
   */
  onSave: (updated: Notebook) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Converts the notebook's globals map into an ordered array of
 * `EditableGlobal` objects suitable for local React state.
 *
 * @param globals Notebook-level globals map, or undefined
 * @returns Ordered array of editable records
 */
function globalsToEditables(
  globals: Record<string, Global> | undefined
): EditableGlobal[] {
  if (globals === undefined) return [];
  return Object.entries(globals).map(([name, g]) => {
    const localeValues: Record<string, string> = {};
    for (const locale of OVERRIDE_LOCALES) {
      localeValues[locale] = g[locale] ?? '';
    }
    return {name, defaultValue: g.default, localeValues};
  });
}

/**
 * Converts the local editable array back into a `Record<string, Global>`.
 * Locale overrides with empty strings are omitted from the output.
 * Duplicate names are resolved by last-write-wins (the list preserves order).
 *
 * @param editables Ordered array of editable global records
 * @returns Globals map suitable for storing in notebook metadata
 */
function editablesToGlobals(
  editables: EditableGlobal[]
): Record<string, Global> {
  const result: Record<string, Global> = {};
  for (const e of editables) {
    if (!IDENTIFIER_PATTERN.test(e.name)) continue;
    const g: Global = {default: e.defaultValue};
    for (const locale of OVERRIDE_LOCALES) {
      const v = e.localeValues[locale];
      if (v !== undefined && v !== '') {
        g[locale] = v;
      }
    }
    result[e.name] = g;
  }
  return result;
}

/**
 * Produces a new notebook with the given globals map spliced into metadata.
 *
 * @param notebook Source notebook
 * @param globals  Replacement globals map
 * @returns Updated notebook with globals replaced
 */
function applyGlobalsToNotebook(
  notebook: Notebook,
  globals: Record<string, Global>
): Notebook {
  return {
    ...notebook,
    metadata: {...notebook.metadata, globals},
  };
}

/**
 * Returns true when all items in the editable array have valid identifier
 * names and there are no duplicates among them.
 *
 * @param editables Editable global records to validate
 * @returns Whether the list is free of identifier errors
 */
function areAllNamesValid(editables: EditableGlobal[]): boolean {
  const seen = new Set<string>();
  for (const e of editables) {
    if (!IDENTIFIER_PATTERN.test(e.name)) return false;
    if (seen.has(e.name)) return false;
    seen.add(e.name);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Left pane: variable list and "Add variable" button.
 */
function VariableList({
  editables,
  selectedIndex,
  onSelect,
  onAdd,
}: {
  /** Current list of editable globals. */
  editables: EditableGlobal[];
  /** Index of the currently selected variable, or -1. */
  selectedIndex: number;
  /**
   * Called when the user clicks a variable row.
   * @param index Zero-based index in editables
   */
  onSelect: (index: number) => void;
  /** Called when the user clicks "Add variable". */
  onAdd: () => void;
}): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 180,
        borderRight: 1,
        borderColor: 'divider',
        pr: 1,
      }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={onAdd}
        sx={{mb: 1, alignSelf: 'flex-start'}}
      >
        {STR_ADD_VARIABLE}
      </Button>
      {editables.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {STR_NO_VARIABLES}
        </Typography>
      )}
      <List dense disablePadding>
        {editables.map((e, i) => renderVariableListItem(e, i, selectedIndex, onSelect))}
      </List>
    </Box>
  );
}

/**
 * Renders a single list item for a variable in the left pane.
 *
 * @param e             Editable global record
 * @param index         Zero-based position in the list
 * @param selectedIndex Index of the currently selected variable
 * @param onSelect      Selection callback
 * @returns List item element
 */
function renderVariableListItem(
  e: EditableGlobal,
  index: number,
  selectedIndex: number,
  onSelect: (i: number) => void
): React.ReactElement {
  /** Handles click on this row. */
  function handleClick(): void {
    onSelect(index);
  }

  const isInvalid = !IDENTIFIER_PATTERN.test(e.name);
  const label = e.name.length > 0 ? e.name : '(unnamed)';

  return (
    <ListItemButton
      key={index}
      selected={index === selectedIndex}
      onClick={handleClick}
      dense
    >
      <ListItemText
        primary={label}
        secondary={e.defaultValue !== '' ? e.defaultValue : undefined}
        primaryTypographyProps={isInvalid ? {color: 'error'} : undefined}
      />
    </ListItemButton>
  );
}

/**
 * Right pane: edit form for the selected variable.
 */
function EditPanel({
  editables,
  selectedIndex,
  onNameChange,
  onDefaultChange,
  onLocaleChange,
  onDelete,
}: {
  /** Current list of editable globals. */
  editables: EditableGlobal[];
  /** Index of the selected variable, or -1 when nothing is selected. */
  selectedIndex: number;
  /**
   * Called when the identifier name field changes.
   * @param index  Zero-based position in the list
   * @param value  New name string
   */
  onNameChange: (index: number, value: string) => void;
  /**
   * Called when the default value field changes.
   * @param index  Zero-based position in the list
   * @param value  New default value string
   */
  onDefaultChange: (index: number, value: string) => void;
  /**
   * Called when a locale override field changes.
   * @param index  Zero-based position in the list
   * @param locale IETF locale tag
   * @param value  New override value string
   */
  onLocaleChange: (index: number, locale: string, value: string) => void;
  /**
   * Called when the Delete button is pressed.
   * @param index Zero-based position in the list
   */
  onDelete: (index: number) => void;
}): React.ReactElement {
  if (selectedIndex === -1 || editables[selectedIndex] === undefined) {
    return (
      <Box sx={{pl: 2, display: 'flex', alignItems: 'center'}}>
        <Typography variant="body2" color="text.secondary">
          {STR_SELECT_PROMPT}
        </Typography>
      </Box>
    );
  }

  const e = editables[selectedIndex];
  const nameInvalid = !IDENTIFIER_PATTERN.test(e.name);

  return (
    <Box sx={{pl: 2, display: 'flex', flexDirection: 'column', gap: 2, flex: 1}}>
      {renderNameField(e.name, nameInvalid, selectedIndex, onNameChange)}
      {renderDefaultField(e.defaultValue, selectedIndex, onDefaultChange)}
      <Divider />
      <Typography variant="caption" color="text.secondary">
        Per-locale overrides (leave blank to use the default)
      </Typography>
      {OVERRIDE_LOCALES.map(locale =>
        renderLocaleField(locale, e.localeValues[locale] ?? '', selectedIndex, onLocaleChange)
      )}
      <Box sx={{mt: 1}}>
        <Button
          color="error"
          size="small"
          onClick={() => onDelete(selectedIndex)}
        >
          {STR_DELETE}
        </Button>
      </Box>
    </Box>
  );
}

/**
 * Renders the identifier Name text field.
 *
 * @param value      Current name value
 * @param invalid    Whether the current value fails IDENTIFIER_PATTERN
 * @param index      Position in the editables list
 * @param onChange   Change handler for the name field
 * @returns TextField element
 */
function renderNameField(
  value: string,
  invalid: boolean,
  index: number,
  onChange: (index: number, value: string) => void
): React.ReactElement {
  /** Handles changes to the name field. */
  function handleChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    onChange(index, evt.target.value);
  }

  return (
    <TextField
      key="name"
      label={STR_NAME_LABEL}
      value={value}
      onChange={handleChange}
      error={invalid}
      helperText={invalid ? STR_NAME_INVALID : undefined}
      size="small"
      fullWidth
    />
  );
}

/**
 * Renders the Default value text field.
 *
 * @param value      Current default value
 * @param index      Position in the editables list
 * @param onChange   Change handler
 * @returns TextField element
 */
function renderDefaultField(
  value: string,
  index: number,
  onChange: (index: number, value: string) => void
): React.ReactElement {
  /** Handles changes to the default value field. */
  function handleChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    onChange(index, evt.target.value);
  }

  return (
    <TextField
      key="default"
      label={STR_DEFAULT_LABEL}
      value={value}
      onChange={handleChange}
      size="small"
      fullWidth
    />
  );
}

/**
 * Renders a per-locale override text field.
 *
 * @param locale     IETF locale tag for this override
 * @param value      Current override value (empty string = use default)
 * @param index      Position in the editables list
 * @param onChange   Change handler
 * @returns TextField element
 */
function renderLocaleField(
  locale: string,
  value: string,
  index: number,
  onChange: (index: number, locale: string, value: string) => void
): React.ReactElement {
  /** Handles changes to a locale override field. */
  function handleChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    onChange(index, locale, evt.target.value);
  }

  return (
    <TextField
      key={locale}
      label={LOCALE_LABEL[locale] ?? locale}
      value={value}
      onChange={handleChange}
      size="small"
      fullWidth
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Dialog that allows curriculum authors to create, edit, and delete
 * notebook-level globals.
 *
 * Variables are edited in a local copy; nothing is committed to the notebook
 * until Save is pressed.  The Save button is disabled while any variable has
 * an invalid or duplicate identifier name.
 */
export function GlobalsDialog({
  open,
  notebook,
  onClose,
  onSave,
}: GlobalsDialogProps): React.ReactElement {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'));

  const [editables, setEditables] = useState<EditableGlobal[]>(() =>
    globalsToEditables(notebook.metadata.globals)
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  /** Whether Save should be enabled. */
  const isSaveDisabled = !areAllNamesValid(editables);

  /**
   * Resets local state to match the notebook each time the dialog opens.
   * The dialog's `open` prop transition triggers this implicitly via the
   * TransitionProps; we use onTransitionEnter to keep state in sync.
   */
  const handleEntered = useCallback((): void => {
    setEditables(globalsToEditables(notebook.metadata.globals));
    setSelectedIndex(-1);
  }, [notebook.metadata.globals]);

  /** Closes without saving. */
  const handleClose = useCallback((): void => {
    onClose();
  }, [onClose]);

  /**
   * Builds the updated notebook and fires onSave.
   */
  const handleSave = useCallback((): void => {
    const globals = editablesToGlobals(editables);
    onSave(applyGlobalsToNotebook(notebook, globals));
    onClose();
  }, [editables, notebook, onSave, onClose]);

  /**
   * Appends a new blank variable and selects it.
   */
  const handleAdd = useCallback((): void => {
    const next: EditableGlobal = {
      name: '',
      defaultValue: '',
      localeValues: Object.fromEntries(OVERRIDE_LOCALES.map(l => [l, ''])),
    };
    setEditables(prev => {
      const updated = [...prev, next];
      setSelectedIndex(updated.length - 1);
      return updated;
    });
  }, []);

  /**
   * Selects a variable for editing.
   * @param index Zero-based index in the editables list
   */
  const handleSelect = useCallback((index: number): void => {
    setSelectedIndex(index);
  }, []);

  /**
   * Updates the identifier name of the variable at `index`.
   * @param index  Position in the list
   * @param value  New name string
   */
  const handleNameChange = useCallback(
    (index: number, value: string): void => {
      setEditables(prev =>
        prev.map((e, i) => (i === index ? {...e, name: value} : e))
      );
    },
    []
  );

  /**
   * Updates the default value of the variable at `index`.
   * @param index  Position in the list
   * @param value  New default value string
   */
  const handleDefaultChange = useCallback(
    (index: number, value: string): void => {
      setEditables(prev =>
        prev.map((e, i) =>
          i === index ? {...e, defaultValue: value} : e
        )
      );
    },
    []
  );

  /**
   * Updates a per-locale override of the variable at `index`.
   * @param index  Position in the list
   * @param locale IETF locale tag
   * @param value  New override value
   */
  const handleLocaleChange = useCallback(
    (index: number, locale: string, value: string): void => {
      setEditables(prev =>
        prev.map((e, i) =>
          i === index
            ? {...e, localeValues: {...e.localeValues, [locale]: value}}
            : e
        )
      );
    },
    []
  );

  /**
   * Removes the variable at `index` from the list.
   * Adjusts selectedIndex so the selection stays coherent.
   * @param index Zero-based position in the list
   */
  const handleDelete = useCallback((index: number): void => {
    setEditables(prev => prev.filter((_, i) => i !== index));
    setSelectedIndex(prev => {
      if (prev === index) return -1;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{onEntered: handleEntered}}
    >
      <DialogTitle>{STR_TITLE}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: isNarrow ? 'column' : 'row',
          gap: 2,
          minHeight: 320,
          pt: 2,
        }}
      >
        <VariableList
          editables={editables}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onAdd={handleAdd}
        />
        <EditPanel
          editables={editables}
          selectedIndex={selectedIndex}
          onNameChange={handleNameChange}
          onDefaultChange={handleDefaultChange}
          onLocaleChange={handleLocaleChange}
          onDelete={handleDelete}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{STR_CANCEL}</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          {STR_SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
