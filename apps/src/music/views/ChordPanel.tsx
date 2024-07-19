import classNames from 'classnames';
import React, {useState, useEffect, useCallback} from 'react';

import musicI18n from '../locale';
import {ChordEventValue, PlayStyle} from '../player/interfaces/ChordEvent';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import {generateGraphDataFromChord, ChordGraphNote} from '../utils/Chords';
import {getNoteName, isBlackKey} from '../utils/Notes';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import moduleStyles from './chordPanel.module.scss';

const NUM_OCTAVES = 3;
const START_OCTAVE = 4;
const MAX_NOTES = 16;

const styleDropdownOptions: [PlayStyle, string][] = [
  ['arpeggio-up', musicI18n.chordArpeggioUp()],
  ['arpeggio-down', musicI18n.chordArpeggioDown()],
  ['arpeggio-random', musicI18n.chordArpeggioRandom()],
  ['together', musicI18n.chordTogether()],
];

export interface ChordPanelProps {
  library: MusicLibrary;
  initValue: ChordEventValue;
  onChange: (value: ChordEventValue) => void;
  previewChord: MusicPlayer['previewChord'];
  previewNote: MusicPlayer['previewNote'];
  cancelPreviews: MusicPlayer['cancelPreviews'];
  setupSampler: MusicPlayer['setupSampler'];
  isInstrumentLoading: MusicPlayer['isInstrumentLoading'];
  isInstrumentLoaded: MusicPlayer['isInstrumentLoaded'];
  registerInstrumentLoadCallback: (
    callback: (instrumentName: string) => void
  ) => void;
}

const ChordPanel: React.FunctionComponent<ChordPanelProps> = ({
  initValue,
  onChange,
  previewChord,
  previewNote,
  cancelPreviews,
  library,
  setupSampler,
  isInstrumentLoading,
  isInstrumentLoaded,
  registerInstrumentLoadCallback,
}) => {
  const [selectedNotes, setSelectedNotes] = useState<number[]>(initValue.notes);
  const [playStyle, setPlayStyle] = useState<PlayStyle>(initValue.playStyle);
  const [instrument, setInstrument] = useState<string>(initValue.instrument);
  const [isDisabled, setIsDisabled] = useState<boolean>(
    selectedNotes.length >= MAX_NOTES
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const instruments: [string, string][] = library.instruments.map(folder => [
    folder.name,
    folder.id,
  ]);

  const onPressKey = useCallback(
    (note: number) => {
      const newSelectedNotes = [...selectedNotes];
      if (newSelectedNotes.includes(note)) {
        newSelectedNotes.splice(newSelectedNotes.indexOf(note), 1);
      } else {
        newSelectedNotes.push(note);
        previewNote(note, instrument);
      }
      setSelectedNotes(newSelectedNotes);
    },
    [selectedNotes, instrument, setSelectedNotes, previewNote]
  );

  useEffect(() => {
    if (!isInstrumentLoaded(instrument)) {
      setIsLoading(true);
      // If the instrument is already loading, register a callback and wait for it to finish.
      if (isInstrumentLoading(instrument)) {
        registerInstrumentLoadCallback(instrumentName => {
          if (instrumentName === instrument) {
            setIsLoading(false);
          }
        });
      } else {
        // Otherwise, initiate the load.
        setupSampler(instrument, () => setIsLoading(false));
      }
    }
  }, [
    setupSampler,
    isInstrumentLoading,
    isInstrumentLoaded,
    instrument,
    setIsLoading,
    registerInstrumentLoadCallback,
  ]);

  useEffect(() => {
    onChange({
      notes: selectedNotes,
      playStyle,
      instrument,
    });
  }, [instrument, playStyle, selectedNotes, onChange]);

  useEffect(() => {
    setIsDisabled(selectedNotes.length >= MAX_NOTES);
  }, [selectedNotes]);

  const playPreview = useCallback(() => {
    previewChord(
      {
        notes: selectedNotes,
        playStyle,
        instrument,
      },
      undefined, // TODO: use onTick() callback to highlight notes
      () => setIsPlayingPreview(false)
    );
    setIsPlayingPreview(true);
  }, [previewChord, selectedNotes, playStyle, instrument]);

  const stopPreview = useCallback(() => {
    cancelPreviews();
    setIsPlayingPreview(false);
  }, [cancelPreviews, setIsPlayingPreview]);

  const onClear = useCallback(() => setSelectedNotes([]), [setSelectedNotes]);

  return (
    <div className={moduleStyles.chordPanelContainer}>
      <div className={moduleStyles.optionsRow}>
        <select
          value={instrument}
          onChange={event => setInstrument(event.target.value)}
          className={moduleStyles.dropdown}
          disabled={isLoading}
        >
          {instruments.map(([name, value]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={playStyle}
          onChange={event => setPlayStyle(event.target.value as PlayStyle)}
          className={moduleStyles.dropdown}
        >
          {styleDropdownOptions.map(([playStyle, label]) => (
            <option key={playStyle} value={playStyle}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Keybed
        numOctaves={NUM_OCTAVES}
        startOctave={START_OCTAVE}
        selectedNotes={selectedNotes}
        onPressKey={onPressKey}
        isDisabled={isDisabled || isLoading}
      />
      <NoteGrid
        numOctaves={NUM_OCTAVES}
        startOctave={START_OCTAVE}
        selectedNotes={selectedNotes}
        playStyle={playStyle}
        instrument={instrument}
      />
      <LoadingOverlay show={isLoading} />
      <PreviewControls
        enabled={selectedNotes.length > 0 && !isLoading}
        playPreview={playPreview}
        onClickClear={onClear}
        cancelPreviews={stopPreview}
        isPlayingPreview={isPlayingPreview}
      />
    </div>
  );
};

interface KeybedProps {
  numOctaves: number;
  startOctave: number;
  selectedNotes: number[];
  onPressKey: (note: number) => void;
  isDisabled: boolean;
}

const Keybed: React.FunctionComponent<KeybedProps> = ({
  numOctaves,
  startOctave,
  selectedNotes,
  onPressKey,
  isDisabled,
}) => {
  const keys = [];
  const startingNote = startOctave * 12;

  for (
    let currentNote = startingNote;
    currentNote < startingNote + numOctaves * 12;
    currentNote++
  ) {
    keys.push(
      <Key
        key={currentNote}
        type={isBlackKey(currentNote) ? 'black' : 'white'}
        isDisabled={isDisabled}
        isSelected={selectedNotes.includes(currentNote)}
        onClick={() => onPressKey(currentNote)}
        text={!isBlackKey(currentNote) ? getNoteName(currentNote) : undefined}
      />
    );
  }

  return (
    <div id="keypad" className={moduleStyles.keybed}>
      {keys}
    </div>
  );
};

interface KeyProps {
  type: 'white' | 'black';
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  text?: string;
}

const Key: React.FunctionComponent<KeyProps> = ({
  type,
  isSelected,
  isDisabled,
  onClick,
  text,
}: KeyProps) => {
  return (
    <div
      className={classNames(
        moduleStyles.key,
        isDisabled && moduleStyles.disabled,
        isSelected && moduleStyles.selected,
        type === 'white' && moduleStyles.whiteKey,
        type === 'black' && moduleStyles.blackKey
      )}
      onClick={isSelected || !isDisabled ? onClick : undefined}
    >
      <div className={moduleStyles.noteLabel}>{text}</div>
    </div>
  );
};

interface NoteGridProps {
  numOctaves: number;
  startOctave: number;
  selectedNotes: number[];
  playStyle: PlayStyle;
  instrument: string;
}

const NoteGrid: React.FunctionComponent<NoteGridProps> = ({
  numOctaves,
  startOctave,
  selectedNotes,
  playStyle,
  instrument,
}) => {
  const graphNotes: ChordGraphNote[] = generateGraphDataFromChord({
    chordEventValue: {
      notes: selectedNotes,
      playStyle,
      instrument,
    },
    width: 315,
    height: 110,
    numOctaves,
    startOctave,
    padding: 2,
    noteHeightScale: 2,
  });

  return (
    <div id="notegrid-container" className={moduleStyles.noteGridContainer}>
      {graphNotes.map((graphNote: ChordGraphNote, index) => {
        return (
          <div
            key={index}
            className={moduleStyles.gridNote}
            style={{
              top: graphNote.y,
              left: graphNote.x,
              width: graphNote.width,
              height: graphNote.height,
            }}
          >
            &nbsp;
          </div>
        );
      })}
    </div>
  );
};

export default ChordPanel;
