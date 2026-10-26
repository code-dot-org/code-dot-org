// The head of the map editor's toolbar: the Screen's or Map's name, drawn as
// a dropdown that opens the switcher, and beside it the actions on it
// (SIMPLE_INTERFACE.md, "Screen/Map Toolbar"; specs/SHELL_PLAN.md, step 4).
//
// Rename, Clone and Delete are the file menus' own acts, asked for through
// `files/fileActs`; the Main Screen can be renamed and not deleted, since a
// project is run from it.

import {Button, IconButton, ListItemText, Menu, MenuItem} from '@mui/material';
import {useMemo, useState} from 'react';

import {activateFile, shouldShowFile} from '@code-dot-org/codebridge';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {requestFileAct} from '../files/fileActs';
import {fileLabel} from '../files/fileLabel';
import {entryFileOf} from '../mainWorld';
import {filePath, projectFiles} from '../runtime/projectFiles';

import styles from './placeHeading.module.css';
import {placePicture} from './placePicture';
import {PlaceSwitcher, type Place} from './PlaceSwitcher';

export interface PlaceHeadingProps {
  fileId: string;
  isReadOnly: boolean;
}

/** The files in a project of one kind, by name, as the switcher lists them. */
const placesOf = (source: MultiFileSource, extensions: RegExp): Place[] =>
  Object.values(source.files)
    .filter(
      (file: ProjectFile) => shouldShowFile(file) && extensions.test(file.name),
    )
    .map(file => ({
      fileId: file.id,
      name: fileLabel(file),
      picture: placePicture(source, file.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

export const PlaceHeading = ({fileId, isReadOnly}: PlaceHeadingProps) => {
  const {currentSources, updateSources} = useSources<MultiFileSource>();
  const source = currentSources.source;
  const [switching, setSwitching] = useState(false);
  const [actionsAt, setActionsAt] = useState<HTMLElement | null>(null);

  const file = source.files[fileId];
  const name = file ? fileLabel(file) : '';
  // What it is, for the words its actions are labelled with. A world is
  // what a Main Screen was.
  const kind = file?.name.endsWith('.map') ? 'Map' : 'Screen';
  // The entry is the one place a project cannot be without (`entryFileOf`).
  const isEntry = useMemo(
    () => filePath(source, fileId) === entryFileOf(projectFiles(source)),
    [source, fileId],
  );
  // A world is what a Main Screen was, and is listed with the screens.
  const screens = useMemo(
    () => placesOf(source, /\.(screen|world)$/),
    [source],
  );
  const maps = useMemo(() => placesOf(source, /\.map$/), [source]);

  const open = (id: string) => {
    setSwitching(false);
    updateSources({...currentSources, source: activateFile(source, id)});
  };
  const act = (request: Parameters<typeof requestFileAct>[0]) => {
    setSwitching(false);
    setActionsAt(null);
    void requestFileAct(request);
  };

  return (
    <div className={styles.heading}>
      <Button
        variant="text"
        size="small"
        className={styles.name}
        endIcon={<FontAwesomeV6Icon iconName="caret-down" iconStyle="solid" />}
        aria-haspopup="dialog"
        onClick={() => setSwitching(true)}
      >
        {name}
      </Button>
      {!isReadOnly && (
        <>
          <IconButton
            size="small"
            aria-label={`${kind} actions`}
            aria-haspopup="menu"
            onClick={event => setActionsAt(event.currentTarget)}
          >
            <FontAwesomeV6Icon iconName="ellipsis" iconStyle="solid" />
          </IconButton>
          <Menu
            open={Boolean(actionsAt)}
            anchorEl={actionsAt}
            onClose={() => setActionsAt(null)}
          >
            <MenuItem onClick={() => act({act: 'rename', fileId})}>
              <ListItemText>Rename</ListItemText>
            </MenuItem>
            {/* A copy under a new name, opened: a second level that starts
                as this one. */}
            <MenuItem onClick={() => act({act: 'clone', fileId})}>
              <ListItemText>Clone</ListItemText>
            </MenuItem>
            {!isEntry && (
              <MenuItem onClick={() => act({act: 'delete', fileId})}>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      )}
      {switching && (
        <PlaceSwitcher
          screens={screens}
          maps={maps}
          currentId={fileId}
          onOpen={open}
          onNew={folder => act({act: 'make', folder})}
          onClose={() => setSwitching(false)}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};
