'use client';

import useResizeObserver from '@react-hook/resize-observer';
import {SplitPane} from '@rexxars/react-split-pane';
import React, {useRef, useEffect, useState, useCallback} from 'react';

import {Heading1} from '@code-dot-org/component-library/typography';
import type {LevelData} from '@code-dot-org/models/levels';

import DATA from '../data';
import FrequencyLevelProvider from '../providers/FrequencyLevelProvider';
import {FrequencyLevelData, FrequencyData} from '../types';

import Controls from './Controls';
import Graph from './Graph';
import Letters from './Letters';
import MessagePanel from './MessagePanel';

import moduleStyles from './frequencyLevel.module.scss';

export interface FrequencyLevelProps {
  levelData?: LevelData<FrequencyLevelData>;
}

/**
 * Provides the full layout of the Frequency widget level.
 *
 * The frequency level investigates substitution ciphers to demonstrate
 * symmetric encryption and the inherent weaknesses of such an approach.
 */
const FrequencyLevel: React.FunctionComponent<FrequencyLevelProps> = ({
  levelData,
}) => {
  const locale = 'es';
  const graphPlaneRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frequencyData = useRef<FrequencyData>({
    alphabetical: DATA[locale].map(item => item.letter),
    letters: DATA[locale].map(item => item.letter),
    sourceLetters: DATA[locale].map(item => item.letter),
    sourceData: DATA[locale].slice(),
    data: DATA[locale].map(item => ({
      ...item,
      frequency: Math.random() / 5,
    })),
    cipher: new Map<string, string>(),
    positions: [],
  });
  const mode = levelData?.subData?.mode || 'caesar';

  const messages = levelData?.subData?.messages || [];

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

  useResizeObserver(graphPlaneRef, () => {
    if (mode === 'caesar') {
      repositionLetters();
    }
  });

  const repositionLetters = useCallback(() => {
    if (graphPlaneRef.current) {
      // There are no graphs, so we have to position the letters ourselves
      // In a graphed mode, the graph tells us where the letters are by looking
      // at the bars in the graph. In a mode without a graph, we just position them
      // in intervals.
      const width = graphPlaneRef.current.querySelector(
        `.${moduleStyles.graphPlaneContainer}`,
      )?.clientWidth || 50;
      const count = frequencyData.current.letters.length;
      const leftPadding = 100 + 10;
      const gap = (width - leftPadding - 20) / count;
      frequencyData.current.positions = frequencyData.current.letters.map(
        (_, i) => leftPadding + gap * i + gap / 2,
      );

      onUpdate();
    }
  }, [frequencyData, graphPlaneRef, onUpdate]);

  useEffect(() => {
    if (mode === 'caesar') {
      repositionLetters();
    }
  }, [mode, repositionLetters]);

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

  const isMapped: (a: string) => boolean = useCallback((a: string) => {
    const {cipher, letters} = frequencyData.current;
    return !!letters.find(
      mapped => cipher.has(mapped) && cipher.get(mapped) === a,
    );
  }, []);

  const unmapLetter = useCallback(
    (a: string) => {
      const {cipher} = frequencyData.current;

      // Remove 'A'
      cipher.delete(a);
      // Remove 'a'
      cipher.delete(a.toLowerCase());
      // Remove 'a' with a diacritic
    },
    [frequencyData],
  );

  const clearMapping = useCallback(
    (a: string) => {
      const {cipher} = frequencyData.current;

      const mapped = letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === a,
      );

      if (mapped) {
        cipher.delete(mapped);
        cipher.delete(mapped.toLowerCase());
      }
    },
    [frequencyData],
  );

  /**
   * Maps the given letter a to the cipher letter b (or remove
   * the mapping if b is omitted or undefined).
   *
   * If cipher letter b already exists, it will swap it with
   * whatever cipher letter was already attached to a.
   */
  const mapLetter = useCallback(
    (a: string, b?: string) => {
      const {cipher} = frequencyData.current;

      // Delete any potential mapping to 'b' already
      if (b) {
        clearMapping(b);
      }

      // Set it
      if (b) {
        cipher.set(a, b);
        cipher.set(a.toLowerCase(), b.toLowerCase());
      } else {
        unmapLetter(a);
      }
    },
    [frequencyData, clearMapping, unmapLetter],
  );

  const swapMapping = useCallback(
    (a: string, b: string) => {
      const {cipher} = frequencyData.current;

      // Swap them
      const mapped = letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === a,
      );
      const mappedTo = letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === b,
      );

      if (mapped) {
        // Set the base mapping
        mapLetter(mapped, b);
      }

      // Also, perform the swap the other way, if necessary
      if (mappedTo) {
        mapLetter(mappedTo, a);
      }
    },
    [frequencyData, mapLetter],
  );

  return (
    <div className={moduleStyles.frequencyLevel}>
      <FrequencyLevelProvider
        mapLetter={mapLetter}
        swapMapping={swapMapping}
        clearMapping={clearMapping}
        isMapped={isMapped}
      >
        <SplitPane
          className={moduleStyles.split}
          split="vertical"
          defaultSize={400}
          allowResize
          paneClassName={moduleStyles.splitPane}
          resizerClassName={moduleStyles.resizerVertical}
          onChange={() => {
            // Disable the letter movement during the drag
            if (graphPlaneRef.current) {
              graphPlaneRef.current.style.overflowX = 'hidden';
              for (const el of graphPlaneRef.current.querySelectorAll(
                `.${moduleStyles.letters}`,
              )) {
                el.classList.remove(moduleStyles.animate);
              }

              if (timerRef.current) {
                clearTimeout(timerRef.current);
              }

              timerRef.current = setTimeout(() => {
                if (graphPlaneRef.current) {
                  graphPlaneRef.current.style.overflowX = '';
                  for (const el of graphPlaneRef.current.querySelectorAll(
                    `.${moduleStyles.letters}`,
                  )) {
                    el.classList.add(moduleStyles.animate);
                  }
                }
              }, 200);
            }
          }}
        >
          <MessagePanel
            messages={messages}
            state={cipherState}
            frequencyData={frequencyData}
            onUpdate={updateCipher}
          />
          <div className={moduleStyles.plotPane}>
            <Heading1 visualAppearance="heading-sm">
              Letter Frequencies
            </Heading1>
            <div className={moduleStyles.graphPlane} ref={graphPlaneRef}>
              <div
                className={moduleStyles.graphPlaneContainer}
                style={{
                  minWidth: `${100 + 10 + 30 * frequencyData.current.alphabetical.length}px`,
                }}
              >
                {mode !== 'caesar' && (
                  <Graph
                    frequencyData={frequencyData}
                    data={data}
                    sourceData={assignedData}
                    onUpdate={onUpdate}
                  />
                )}
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
                {mode !== 'caesar' && (
                  <Graph
                    frequencyData={frequencyData}
                    sourceData={sourceData}
                    inverted
                  />
                )}
              </div>
            </div>
            <Controls frequencyData={frequencyData} onUpdate={updateCipher} />
          </div>
        </SplitPane>
      </FrequencyLevelProvider>
    </div>
  );
};

export default FrequencyLevel;
