import _ from 'lodash';
import Radium from 'radium';
import * as React from 'react';

import {Body, Button, Content} from '@/oceans/components/common';
import {AppMode, Modes} from '@/oceans/constants';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import {getState, setState} from '@/oceans/state';
import styles from '@/oceans/styles';

interface WordSetEntry {
  textKey: string;
  choices: string[][];
  style: React.CSSProperties;
}

/*
 * The choices for each word set are i18n keys. If adding or changing a word
 * choice, be sure to add the word the way it should appear in i18n/oceans.json.
 * The keys here will also appear in google analytics, so it's worth making
 * them readable in English.
 *
 * */
export const wordSet: Record<string, WordSetEntry> = {
  short: {
    textKey: 'wordQuestionShort',
    choices: [
      ['blue', 'green', 'red'],
      ['circular', 'rectangular', 'triangular'],
    ],
    style: styles.button2col,
  },
  long: {
    textKey: 'wordQuestionLong',
    choices: [
      [
        'angry',
        'awesome',
        'delicious',
        'endangered',
        'fast',
        'fierce',
        'fun',
        'glitchy',
        'happy',
        'hungry',
        'playful',
        'scary',
        'silly',
        'spooky',
        'wild',
      ],
    ],
    style: styles.button3col,
  },
};

interface WordsState {
  choices: string[];
}

const UnwrappedWords = class Words extends React.Component<
  Record<string, never>,
  WordsState
> {
  constructor(props: Record<string, never>) {
    super(props);

    // Randomize word choices in each set, merge the sets, and set as state.
    const appMode = getState().appMode as string;

    if (!wordSet[appMode]) {
      throw `Could not find a set of choices in wordSet for appMode '${appMode}'`;
    }

    const appModeWordSet = wordSet[appMode].choices;
    const choices: string[] = [];
    let maxSize = 0;
    // Each subset represents a different column, so merge the subsets
    // Start by shuffling the subsets and finding the max length
    for (let i = 0; i < appModeWordSet.length; ++i) {
      appModeWordSet[i] = _.shuffle(appModeWordSet[i]);
      if (appModeWordSet[i].length > maxSize) {
        maxSize = appModeWordSet[i].length;
      }
    }
    // Iterate through each subset and add those elements to choices
    for (let i = 0; i < maxSize; ++i) {
      appModeWordSet.forEach(col => {
        if (col[i]) {
          choices.push(col[i]);
        }
      });
    }

    this.state = {choices};
  }

  onChangeWord(itemIndex: number) {
    const wordKey = this.state.choices[itemIndex];
    const word = I18n.t(wordKey);
    setState({
      word,
      trainingQuestion: I18n.t('isThisFish', {word: word.toLowerCase()}),
    });
    modeHelpers.toMode(Modes.Training);

    // Report an analytics event for the word chosen.
    if (window.trackEvent) {
      const appModeToString: Record<string, string> = {
        [AppMode.FishShort]: 'words-short',
        [AppMode.FishLong]: 'words-long',
      };

      window.trackEvent(
        'oceans',
        appModeToString[getState().appMode as string],
        wordKey,
      );
    }
  }

  render() {
    const state = getState();

    return (
      <Body>
        <Content>
          {wordSet[state.appMode as string].textKey && (
            <div style={styles.wordsText}>
              {I18n.t(wordSet[state.appMode as string].textKey)}{' '}
            </div>
          )}
          {this.state.choices.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              className="words-button"
              style={[
                wordSet[state.appMode as string].style,
                styles.wordButton,
              ]}
              onClick={() => this.onChangeWord(itemIndex)}
            >
              {I18n.t(item)}
            </Button>
          ))}
        </Content>
      </Body>
    );
  }
};
export default Radium(UnwrappedWords);
