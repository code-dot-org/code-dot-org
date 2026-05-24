import {Box} from '@mui/material';
import _ from 'lodash';
import * as React from 'react';

import {Body, Button, Content} from '@/oceans/components/common';
import {AppMode, Modes} from '@/oceans/constants';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import {getState, setState} from '@/oceans/state';

interface WordSetEntry {
  textKey: string;
  choices: string[][];
  /** Layout variant key, mapped to per-variant sx. */
  buttonClass: string;
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
    buttonClass: 'ocean-word-button--2col',
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
    buttonClass: 'ocean-word-button--3col',
  },
};

/** Shared base for all word-choice buttons. */
const wordButtonBaseSx = {
  width: '20%',
  marginTop: '2%',
  '&:hover, &:focus': {
    backgroundColor: 'var(--ocean-color-orange)',
    color: 'var(--ocean-color-white)',
  },
} as const;

/** Derives MUI sx layout from the word-button CSS class identifier. */
function wordButtonSx(
  buttonClass: string,
): React.ComponentProps<typeof Button>['sx'] {
  const margin = buttonClass === 'ocean-word-button--2col' ? '14%' : '6%';
  return [wordButtonBaseSx, {marginLeft: margin, marginRight: margin}];
}

interface WordsState {
  choices: string[];
}

class Words extends React.Component<Record<string, never>, WordsState> {
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
    const appMode = state.appMode as string;
    const entry = wordSet[appMode];
    const btnSx = wordButtonSx(entry.buttonClass);

    return (
      <Body>
        <Content>
          {entry.textKey && (
            <Box
              sx={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '120%',
                color: 'var(--ocean-color-white)',
              }}
            >
              {I18n.t(entry.textKey)}{' '}
            </Box>
          )}
          <Box>
            {this.state.choices.map((item, itemIndex) => (
              <Button
                key={itemIndex}
                className="ocean-word-button"
                testId="word-button"
                sx={btnSx}
                onClick={() => this.onChangeWord(itemIndex)}
              >
                {I18n.t(item)}
              </Button>
            ))}
          </Box>
        </Content>
      </Body>
    );
  }
}
export default Words;
