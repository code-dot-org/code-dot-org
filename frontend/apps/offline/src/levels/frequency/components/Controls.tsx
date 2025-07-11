import React, {useState, useCallback} from 'react';

import Button from '@code-dot-org/component-library/button';
import Tabs from '@code-dot-org/component-library/tabs';
import TextField from '@code-dot-org/component-library/textField';
import {BodyTwoText} from '@code-dot-org/component-library/typography';

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

  const reset = useCallback(() => {
    const {cipher} = frequencyData.current;

    // Update the cipher
    cipher.clear();

    // Clear shift amount
    setShift(0);

    // Notify the parent component
    onUpdate();
  }, []);

  const updateShift = useCallback(
    (newShift: number) => {
      const {cipher, letters} = frequencyData.current;

      // Update the cipher state. If that changes, it causes the message to re-render
      newShift = Math.abs(newShift + letters.length) % letters.length;

      // Update the cipher
      cipher.clear();
      letters.forEach((letter, i) => {
        const newLetter = letters[(i + newShift) % letters.length];
        cipher.set(letter, newLetter);
        cipher.set(letter.toLowerCase(), newLetter.toLowerCase());
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
      <div className={moduleStyles.randomControls}>
        <Button
          text="Random"
          onClick={() => {
            const {cipher, letters} = frequencyData.current;
            const newLetters = shuffle(letters);

            // Update the cipher
            cipher.clear();
            letters.forEach((letter, i) => {
              const newLetter = newLetters[i];
              cipher.set(letter, newLetter);
              cipher.set(letter.toLowerCase(), newLetter.toLowerCase());
            });

            // Notify the parent component
            onUpdate();
          }}
        />
        <Button
          text="By letter"
          onClick={() => {
            const {cipher, letters} = frequencyData.current;
            const newLetters = letters.slice();

            // Update the cipher
            cipher.clear();
            letters.forEach((letter, i) => {
              const newLetter = newLetters[i];
              cipher.set(letter, newLetter);
              cipher.set(letter.toLowerCase(), newLetter.toLowerCase());
            });

            // Notify the parent component
            onUpdate();
          }}
        />
        <Button
          text="Percentage"
          onClick={() => {
            const {sourceData, cipher, letters} = frequencyData.current;
            const newLetters = letters
              .slice()
              .sort(
                (a, b) =>
                  sourceData.find(item => item.letter === b).frequency -
                  sourceData.find(item => item.letter === a).frequency,
              );

            // Update the cipher
            cipher.clear();
            letters.forEach((letter, i) => {
              const newLetter = newLetters[i];
              cipher.set(letter, newLetter);
              cipher.set(letter.toLowerCase(), newLetter.toLowerCase());
            });

            // Notify the parent component
            onUpdate();
          }}
        />
        <Button text="Reset" onClick={() => reset()} />
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
                  data.find(item => item.letter === b).frequency -
                  data.find(item => item.letter === a).frequency,
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
    _tabsContainerClassName=""
    _tabPanelsContainerClassName=""
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
