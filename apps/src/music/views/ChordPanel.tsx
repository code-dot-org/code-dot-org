import React, {useState, useEffect, useRef} from 'react';
import {getNoteName, isBlackKey} from '../utils/Notes';
import MusicLibrary from '../player/MusicLibrary';
import {ChordEventValue, PlayStyle} from '../player/interfaces/ChordEvent';
import {generateGraphDataFromChord, ChordGraphNote} from '../utils/Chords';

const FontAwesome = require('../../templates/FontAwesome');
const moduleStyles = require('./chordPanel.module.scss').default;
const classNames = require('classnames');

const NUM_OCTAVES = 3;
const START_OCTAVE = 4;
const MAX_NOTES = 16;

const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

const styleDropdownOptions: [PlayStyle, string][] = [
  ['arpeggio-up', 'Arpeggio Up'],
  ['arpeggio-down', 'Arpeggio Down'],
  ['arpeggio-random', 'Arpeggio Random'],
  ['together', 'Together']
];

export interface ChordPanelProps {
  library: MusicLibrary;
  initValue: ChordEventValue;
  onChange: (value: ChordEventValue) => void;
  previewChord: (chord: ChordEventValue, onStop: () => void) => void;
}

const ChordPanel: React.FunctionComponent<ChordPanelProps> = ({
  initValue,
  onChange,
  previewChord,
  library
}) => {
  const [selectedNotes, setSelectedNotes] = useState<number[]>(initValue.notes);
  const [playStyle, setPlayStyle] = useState<PlayStyle>(initValue.playStyle);
  const [instrument, setInstrument] = useState<string>(initValue.instrument);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(
    selectedNotes.length >= MAX_NOTES
  );

  const instruments: [string, string][] = library.groups[0].folders
    .filter(folder => folder.type === 'instrument')
    .map(folder => [folder.name, folder.path]);

  const onPressKey = (note: number) => {
    const newSelectedNotes = [...selectedNotes];
    if (newSelectedNotes.includes(note)) {
      newSelectedNotes.splice(newSelectedNotes.indexOf(note), 1);
    } else {
      newSelectedNotes.push(note);
    }
    setSelectedNotes(newSelectedNotes);
  };

  const previewTimeoutIdRef = useRef<number | null>(null);

  const onPreview = () => {
    if (isPlayingPreview) {
      return;
    }

    setIsPlayingPreview(true);
    previewChord(
      {
        notes: selectedNotes,
        playStyle,
        instrument
      },
      () => {
        setIsPlayingPreview(false);
        if (previewTimeoutIdRef.current !== null) {
          clearTimeout(previewTimeoutIdRef.current);
        }
      }
    );

    // Set a timeout to reset the preview button in case there is an error
    // playing a preview.
    previewTimeoutIdRef.current = window.setTimeout(() => {
      if (previewTimeoutIdRef.current !== null) {
        console.warn(`Preview timeout expired. Resetting preview buttton.`);
        setIsPlayingPreview(false);
      }
      previewTimeoutIdRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    onChange({
      notes: selectedNotes,
      playStyle,
      instrument
    });
  }, [instrument, playStyle, selectedNotes]);

  useEffect(() => {
    setIsDisabled(selectedNotes.length >= MAX_NOTES);
  }, [selectedNotes]);

  return (
    <div className={moduleStyles.chordPanelContainer}>
      <div className={moduleStyles.optionsRow}>
        <select
          value={instrument}
          onChange={event => setInstrument(event.target.value)}
          className={moduleStyles.dropdown}
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
        isDisabled={isDisabled}
      />
      <NoteGrid
        numOctaves={NUM_OCTAVES}
        startOctave={START_OCTAVE}
        selectedNotes={selectedNotes}
        playStyle={playStyle}
      />
      <div className={moduleStyles.controlsRow}>
        <FontAwesome
          icon={'play-circle'}
          onClick={onPreview}
          className={classNames(
            moduleStyles.previewButton,
            isPlayingPreview && moduleStyles.previewButtonDisabled
          )}
        />
        <FontAwesome
          icon={'trash-o'}
          onClick={() => setSelectedNotes([])}
          className={moduleStyles.previewButton}
        />
      </div>
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
  isDisabled
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
  text
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
      onClick={onClick}
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
}

const NoteGrid: React.FunctionComponent<NoteGridProps> = ({
  numOctaves,
  startOctave,
  selectedNotes,
  playStyle
}) => {
  const graphNotes: ChordGraphNote[] = generateGraphDataFromChord(
    {
      notes: selectedNotes,
      playStyle,
      instrument: ''
    } as ChordEventValue,
    315,
    110,
    numOctaves,
    startOctave,
    2
  );

  return (
    <div id="notegrid" className={moduleStyles.noteGridContainer}>
      {graphNotes.map((graphNote: ChordGraphNote, index) => {
        return (
          <div
            key={index}
            className={moduleStyles.gridNote}
            style={{
              top: graphNote.y,
              left: graphNote.x,
              width: graphNote.width,
              height: graphNote.height
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
