import React from 'react'
import _ from "lodash";
import Radium from "radium";

import {getState, setState} from "@ml/oceans/state";
import I18n from "@ml/oceans/i18n";
import modeHelpers from "@ml/oceans/modeHelpers";
import {AppMode, Modes} from "@ml/oceans/constants";
import {Body, Button, Content} from "@ml/oceans/components/common";
import styles from "@ml/oceans/styles";


/*
 * The choices for each word set are i18n keys. If adding or changing a word
 * choice, be sure to add the word the way it should appear in i18n/oceans.json.
 * The keys here will also appear in google analytics, so it's worth making
 * them readable in English.
 *
 * */
export const wordSet = {
  short: {
    textKey: 'wordQuestionShort',
    choices: [
      ['blue', 'green', 'red'],
      ['circular', 'rectangular', 'triangular']
    ],
    style: styles.button2col
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
        'wild'
      ]
    ],
    style: styles.button3col
  }
};

let UnwrappedWords = class Words extends React.Component {
  constructor(props) {
    super(props);

    // Randomize word choices in each set, merge the sets, and set as state.
    const appMode = getState().appMode;

    if (!wordSet[appMode]) {
      throw `Could not find a set of choices in wordSet for appMode '${appMode}'`;
    }

    const appModeWordSet = wordSet[appMode].choices;
    let choices = [];
    let maxSize = 0;
    // Each subset represents a different column, so merge the subsets
    // Start by shuffling the subsets and finding the max length
    for (var i = 0; i < appModeWordSet.length; ++i) {
      appModeWordSet[i] = _.shuffle(appModeWordSet[i]);
      if (appModeWordSet[i].length > maxSize) {
        maxSize = appModeWordSet[i].length;
      }
    }
    // Iterate through each subset and add those elements to choices
    for (i = 0; i < maxSize; ++i) {
      appModeWordSet.forEach(col => {
        if (col[i]) {
          choices.push(col[i]);
        }
      });
    }

    this.state = {choices};
  }

  onChangeWord(itemIndex) {
    const wordKey = this.state.choices[itemIndex];
    const word = I18n.t(wordKey);
    setState({
      word,
      trainingQuestion: I18n.t('isThisFish', {word: word.toLowerCase()})
    });
    modeHelpers.toMode(Modes.Training);

    // Report an analytics event for the word chosen.
    if (window.trackEvent) {
      const appModeToString = {
        [AppMode.FishShort]: 'words-short',
        [AppMode.FishLong]: 'words-long'
      };

      window.trackEvent('oceans', appModeToString[getState().appMode], wordKey);
    }
  }

  render() {
    const state = getState();

    return (
      <Body>
        <Content>
          {wordSet[state.appMode].textKey && (
            <div style={styles.wordsText}>
              {I18n.t(wordSet[state.appMode].textKey)}{' '}
            </div>
          )}
          {this.state.choices.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              className="words-button"
              style={[wordSet[state.appMode].style, styles.wordButton]}
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
