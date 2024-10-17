import classNames from 'classnames';
import React, {
  ChangeEvent,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';

import MusicRegistry from '../MusicRegistry';
import {InstrumentEventValue} from '../player/interfaces/InstrumentEvent';
import MusicLibrary from '../player/MusicLibrary';

import Keybed from './Keybed';
import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import moduleStyles from './tunePanel.module.scss';

const NUM_OCTAVES = 3;
const START_OCTAVE = 4;

export interface TunePanelProps {
  initValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
}

const TunePanel: React.FunctionComponent<TunePanelProps> = ({
  initValue,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue: InstrumentEventValue = JSON.parse(
    JSON.stringify(initValue)
  );

  const availableInstruments = useMemo(() => {
    return MusicLibrary.getInstance()?.instruments || [];
  }, []);

  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);

  const toggleEvent = useCallback(
    (tick: number, note: number) => {
      const index = currentValue.events.findIndex(
        event => event.note === note && event.tick === tick
      );
      if (index !== -1) {
        // If found, delete.
        currentValue.events.splice(index, 1);
      } else {
        // Not found, so add.
        currentValue.events.push({note, tick});
        MusicRegistry.player.previewNote(note, currentValue.instrument);
      }

      onChange(currentValue);
    },
    [onChange, currentValue]
  );

  const hasEvent = (note: number, tick: number) => {
    const element = currentValue.events.find(
      event => event.note === note && event.tick === tick
    );
    return !!element;
  };

  const handleFolderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    currentValue.instrument = event.target.value;
    onChange(currentValue);
  };

  const getCellClasses = (note: number, tick: number) => {
    const isSet = hasEvent(note, tick);
    const isHighlighted = !isSet && (tick - 1) % 4 === 0;

    return classNames(
      moduleStyles.cell,
      isSet && moduleStyles.activeCell,
      isHighlighted && moduleStyles.highlightedCell
    );
  };

  const onClear = useCallback(() => {
    currentValue.events = [];
    onChange(currentValue);
  }, [onChange, currentValue]);

  const startPreview = useCallback(() => {
    MusicRegistry.player.previewNotes(
      currentValue,
      (tick: number) => setCurrentPreviewTick(tick),
      () => setCurrentPreviewTick(0)
    );
  }, [setCurrentPreviewTick, currentValue]);

  const stopPreview = useCallback(() => {
    setCurrentPreviewTick(0);
    MusicRegistry.player.cancelPreviews();
  }, [setCurrentPreviewTick]);

  useEffect(() => {
    if (!MusicRegistry.player.isInstrumentLoaded(currentValue.instrument)) {
      setIsLoading(true);
      if (MusicRegistry.player.isInstrumentLoading(currentValue.instrument)) {
        // If the instrument is already loading, register a callback and wait for it to finish.
        MusicRegistry.player.registerCallback(
          'InstrumentLoaded',
          instrument => {
            if (instrument === currentValue.instrument) {
              setIsLoading(false);
            }
          }
        );
      } else {
        // Otherwise, initiate the load.
        MusicRegistry.player.setupSampler(currentValue.instrument, () =>
          setIsLoading(false)
        );
      }
    }
  }, [currentValue.instrument, setIsLoading]);

  // Generate an array of notes.
  const arrayOfNotes = Array.from(
    {length: NUM_OCTAVES * 12},
    (_, i) => i + START_OCTAVE * 12
  );

  // Generate an array containing tick numbers from 1..16.
  const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

  return (
    <div className={moduleStyles.tunePanelContainer}>
      <div className={moduleStyles.optionsRow}>
        <select
          value={currentValue.instrument}
          onChange={handleFolderChange}
          className={moduleStyles.dropdown}
          disabled={isLoading}
        >
          {availableInstruments.map(folder => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>
      <div className={moduleStyles.editorContainer}>
        <Keybed
          numOctaves={NUM_OCTAVES}
          startOctave={START_OCTAVE}
          selectedNotes={[]}
          onPressKey={() => {}}
          isDisabled={isLoading}
          isVertical={true}
        />
        <div
          id="eventgrid-container"
          className={moduleStyles.eventGridContainer}
        >
          {arrayOfNotes.map((note, index) => {
            return (
              <div className={moduleStyles.row} key={index}>
                {arrayOfTicks.map(tick => {
                  return (
                    <div
                      className={classNames(
                        moduleStyles.outerCell,
                        tick === currentPreviewTick &&
                          moduleStyles.outerCellPlaying
                      )}
                      onClick={() => toggleEvent(tick, note)}
                      key={tick}
                    >
                      <div className={getCellClasses(note, tick)} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <LoadingOverlay show={isLoading} />
      <PreviewControls
        enabled={currentValue.events.length > 0 && !isLoading}
        playPreview={startPreview}
        onClickClear={onClear}
        cancelPreviews={stopPreview}
        isPlayingPreview={currentPreviewTick > 0}
      />
    </div>
  );
};

export default TunePanel;
