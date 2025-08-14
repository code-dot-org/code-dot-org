import React, {ChangeEvent, useState, useCallback, useContext, MutableRefObject} from 'react';

import Button from '@code-dot-org/component-library/button';
import Tabs from '@code-dot-org/component-library/tabs';
import TextField from '@code-dot-org/component-library/textField';
import {BodyTwoText} from '@code-dot-org/component-library/typography';

import LabFrequencyAnalysisContext from '../contexts/LabFrequencyAnalysisContext';
import {FrequencyData} from '../types';

import moduleStyles from './frequencyLevel.module.scss';

export interface ControlsProps {
  message?: string;
  frequencyData: MutableRefObject<FrequencyData>;
  onUpdate: () => void;
}

const CaesarControls: React.FunctionComponent<ControlsProps> = ({
  frequencyData,
  onUpdate,
}) => {
  const [shift, setShift] = useState<number>(0);
  const {mapLetter} = useContext(LabFrequencyAnalysisContext);

  // Pull all assigned cipher letters back
  const reset = useCallback(() => {
    const {cipher} = frequencyData.current;

    // Update the cipher
    cipher.clear();

    // Clear shift amount
    setShift(0);

    // Notify the parent component
    onUpdate();
  }, []);

  // Applies the shift amount, which assigns all the cipher letters accordingly
  const updateShift = useCallback(
    (newShift: number) => {
      const {cipher, letters} = frequencyData.current;

      // Update the cipher state. If that changes, it causes the message to re-render
      newShift = Math.abs(newShift + letters.length) % letters.length;

      // Update the cipher
      cipher.clear();
      letters.forEach((letter, i) => {
        const newLetter = letters[(i + newShift) % letters.length];
        mapLetter(letter, newLetter);
      });

      // Update the shift amount
      setShift(newShift);

      // Notify the parent component
      onUpdate();
    },
    [setShift, onUpdate, frequencyData],
  );

  return (
    <div className={moduleStyles.tabContent}>
      <BodyTwoText>Shift the substitutions left or right.</BodyTwoText>
      <div className={moduleStyles.controls}>
        <div className={moduleStyles.caesarControls}>
          <Button
            icon={{
              iconName: 'arrow-left',
              iconStyle: 'solid',
            }}
            isIconOnly
            onClick={() => updateShift(shift - 1)}
          />
          <TextField
            name="caesar-range-update"
            className={moduleStyles.field}
            value={shift.toString()}
            onChange={(el: ChangeEvent<HTMLInputElement>) =>
              updateShift(parseInt(el.target.value) || 0)
            }
          />
          <Button
            icon={{
              iconName: 'arrow-right',
              iconStyle: 'solid',
            }}
            isIconOnly
            onClick={() => updateShift(shift + 1)}
          />
          <Button text="Reset" onClick={() => reset()} />
        </div>
      </div>
    </div>
  );
};

// Shuffles an array
function shuffle(array: string[]): string[] {
  array = array.slice();
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const RandomControls: React.FunctionComponent<ControlsProps> = ({
  frequencyData,
  onUpdate,
}) => {
  const {mapLetter, isMapped} = useContext(LabFrequencyAnalysisContext);

  // Assign all unassigned cipher letters
  const assign = useCallback(() => {
    const {cipher, letters, sourceLetters} = frequencyData.current;

    // For each unfulfilled letter, apply the first unassigned letter
    for (const letter of letters) {
      if (!cipher.has(letter)) {
        // Determine next source letter that isn't assigned
        for (const sourceLetter of sourceLetters) {
          if (!isMapped(sourceLetter)) {
            mapLetter(letter, sourceLetter);
            break;
          }
        }
      }
    }

    // Notify the parent component
    onUpdate();
  }, []);

  // Pull all assigned cipher letters back
  const reset = useCallback(() => {
    const {cipher} = frequencyData.current;

    // Update the cipher
    cipher.clear();

    // Notify the parent component
    onUpdate();
  }, []);

  return (
    <div className={moduleStyles.tabContent}>
      <BodyTwoText>Sort substitutions</BodyTwoText>
      <div className={moduleStyles.controls}>
        <div className={moduleStyles.randomControls}>
          <Button
            text="By letter"
            onClick={() => {
              // Update source letters to return them to alphabetical order
              frequencyData.current.sourceLetters =
                frequencyData.current.alphabetical.slice();

              // Notify the parent component
              onUpdate();
            }}
          />
          <Button
            text="Percentage"
            onClick={() => {
              const {letters, sourceData} = frequencyData.current;

              const newLetters = letters
                .slice()
                .sort(
                  (a, b) =>
                    (sourceData.find(item => item.letter === b)?.frequency || 0) -
                    (sourceData.find(item => item.letter === a)?.frequency || 0),
                );

              frequencyData.current.sourceLetters = newLetters;

              // Notify the parent component
              onUpdate();
            }}
          />
          <Button
            text="Random"
            onClick={() => {
              // Update source letters to be in a random order
              frequencyData.current.sourceLetters = shuffle(
                frequencyData.current.alphabetical.slice(),
              );

              // Notify the parent component
              onUpdate();
            }}
          />
          <Button text="Reset" onClick={() => reset()} />
          <Button text="Assign" onClick={() => assign()} />
        </div>
      </div>
      <BodyTwoText>Sort originals</BodyTwoText>
      <div className={moduleStyles.randomControls}>
        <Button
          text="By letter"
          onClick={() => {
            frequencyData.current.letters =
              frequencyData.current.alphabetical.slice();

            // Notify the parent component
            onUpdate();
          }}
        />
        <Button
          text="Percentage"
          onClick={() => {
            const {data, letters} = frequencyData.current;

            const newLetters = letters
              .slice()
              .sort(
                (a, b) =>
                  (data.find(item => item.letter === b)?.frequency || 0) -
                  (data.find(item => item.letter === a)?.frequency || 0),
              );
            frequencyData.current.letters = newLetters;

            // Notify the parent component
            onUpdate();
          }}
        />
      </div>
    </div>
  );
};

const Controls: React.FunctionComponent<ControlsProps> = ({
  frequencyData,
  onUpdate,
}) => (
  <Tabs
    name="frequencyModes"
    onChange={(value: string) => {
      if (value === 'caesar') {
        // Reset source letter order for the caesar cipher mode
        frequencyData.current.letters =
          frequencyData.current.alphabetical.slice();

        // Notify the parent component
        onUpdate();
      }
    }}
    defaultSelectedTabValue='caesar'
    tabPanelsContainerClassName={moduleStyles.tabContentContainer}
    tabs={[
      {
        value: 'caesar',
        text: 'Caesar Substitution',
        tabContent: (
          <CaesarControls frequencyData={frequencyData} onUpdate={onUpdate} />
        ),
      },
      {
        value: 'random',
        text: 'Random Substitution',
        tabContent: (
          <RandomControls frequencyData={frequencyData} onUpdate={onUpdate} />
        ),
      },
    ]}
  />
);

export default Controls;
