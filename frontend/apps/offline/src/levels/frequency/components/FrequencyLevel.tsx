'use client';

import {SplitPane} from '@rexxars/react-split-pane';
import React, {useRef, useState, useCallback} from 'react';

import {Heading1} from '@code-dot-org/component-library/typography';

import type {LevelData} from '@/app/models/level';

import FrequencyLevelProvider from '../providers/FrequencyLevelProvider';
import {FrequencyData} from '../types';

import Controls from './Controls';
import Graph from './Graph';
import Letters from './Letters';
import Message from './Message';

import moduleStyles from './frequencyLevel.module.scss';

export interface FrequencyLevelProps {
  level: LevelData;
}

/**
 * The English letters for 'en' locales.
 */
const EN_LETTERS: string[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

/**
 * The Spanish letters for 'es' locales.
 */
const ES_LETTERS: string[] = [
  ...EN_LETTERS.slice(0, 14),
  'Ñ',
  ...EN_LETTERS.slice(14),
];

/**
 * Provides the full layout of the Frequency widget level.
 *
 * The frequency level investigates substitution ciphers to demonstrate
 * symmetric encryption and the inherent weaknesses of such an approach.
 */
const FrequencyLevel: React.FunctionComponent<FrequencyLevelProps> = () => {
  const frequencyData = useRef<FrequencyData>({
    alphabetical: ES_LETTERS.slice(),
    letters: ES_LETTERS.slice(),
    sourceLetters: ES_LETTERS.slice(),
    data: ES_LETTERS.map((letter: string) => ({
      letter,
      frequency: Math.random() / 5,
    })),
    sourceData: ES_LETTERS.map((letter: string) => ({
      letter,
      frequency: Math.random() / 5,
    })),
    cipher: new Map<string, string>(),
    positions: [],
  });

  const updaters = useRef<(() => void)[]>([]);

  const letters = frequencyData.current.letters;
  const [cipherState, setCipherState] = useState<string>(letters.join(''));
  const [data, setData] = useState(frequencyData.current.data);
  const [sourceData, setSourceData] = useState(
    frequencyData.current.sourceData,
  );
  const [assignedData, setAssignedData] = useState(
    frequencyData.current.sourceData.map(item => ({...item, frequency: 0})),
  );

  const onUpdate = useCallback(() => {
    updaters.current.forEach(updater => updater?.());
  }, [updaters]);

  const updateCipher = useCallback(() => {
    // Update the cipher state. If that changes, it causes the message to re-render
    setCipherState(
      frequencyData.current.letters
        .map(letter => `${frequencyData.current.cipher.get(letter)}->${letter}`)
        .join(''),
    );

    // Form new graph data
    setData(
      frequencyData.current.letters.map(letter => ({
        letter,
        frequency:
          frequencyData.current.data.find(item => item.letter === letter)
            ?.frequency || 0,
      })),
    );

    setAssignedData(
      frequencyData.current.letters.map(letter => {
        const {cipher} = frequencyData.current;
        const frequency = cipher.has(letter)
          ? frequencyData.current.sourceData.find(
              item => item.letter === cipher.get(letter),
            )?.frequency || 0
          : 0;

        return {
          letter,
          frequency,
        };
      }),
    );

    const newSourceData = frequencyData.current.sourceLetters.map(letter => {
      const {cipher} = frequencyData.current;
      const mapped = frequencyData.current.letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === letter,
      );
      const frequency = mapped
        ? 0
        : frequencyData.current.sourceData.find(item => item.letter === letter)
            ?.frequency || 0;

      return {
        letter,
        frequency,
      };
    });
    setSourceData(newSourceData);

    onUpdate();
  }, [
    setCipherState,
    setData,
    setAssignedData,
    setSourceData,
    frequencyData,
    onUpdate,
  ]);

  return (
    <div className={moduleStyles.frequencyLevel}>
      <FrequencyLevelProvider>
        <SplitPane
          split="vertical"
          defaultSize={400}
          allowResize
          style={{position: 'relative'}}
          paneStyle={{
            overflow: 'hidden',
            position: 'relative',
          }}
          resizerStyle={{
            width: '0.375rem',
            cursor: 'ew-resize',
            backgroundColor: 'var(--borders-neutral-primary)',
            borderLeft: '0.0625rem solid var(--borders-brand-purple-light)',
          }}
        >
          <div className={moduleStyles.messagePane}>
            <Message state={cipherState} frequencyData={frequencyData} />
          </div>
          <div className={moduleStyles.plotPane}>
            <Heading1 visualAppearance="heading-sm">
              Letter Frequencies
            </Heading1>
            <Graph
              frequencyData={frequencyData}
              data={data}
              sourceData={assignedData}
              onUpdate={onUpdate}
              color={'#6666ff'}
            />
            <Letters
              frequencyData={frequencyData}
              setUpdater={updater => {
                updaters.current[0] = updater;
              }}
              caption="Original"
            />
            <Letters
              frequencyData={frequencyData}
              setUpdater={updater => {
                updaters.current[1] = updater;
              }}
              interactive
              caption="Maps to"
              onUpdate={updateCipher}
            />
            <Letters
              frequencyData={frequencyData}
              setUpdater={updater => {
                updaters.current[2] = updater;
              }}
              interactive
              isSource
              caption="Unassigned"
              onUpdate={updateCipher}
            />
            <Graph
              frequencyData={frequencyData}
              sourceData={sourceData}
              inverted
            />
            <Controls frequencyData={frequencyData} onUpdate={updateCipher} />
          </div>
        </SplitPane>
      </FrequencyLevelProvider>
    </div>
  );
};

export default FrequencyLevel;
