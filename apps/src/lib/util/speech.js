import Sounds from '../../Sounds';
import {outputWarning, getAsyncOutputWarning} from './javascriptMode';
import i18n from '@cdo/locale';
import {findProfanity} from '@cdo/apps/code-studio/components/libraries/util';
import {PROFANITY_FOUND} from '../../constants';
/**
 * Start playing given text as speech.
 * @param {string} text The text to play as speech.
 * @param {string} gender The gender of the voice to play.
 * @param {string} language The language of the text.
 * @param {string} token The authorization token to access the Azure API
 * @param {string} region The region for accessing the Azure API
 * @param {object} appLanguages The map of languages to genders and voices that can be used.
 */
export function textToSpeech(
  text,
  gender,
  language,
  token,
  region,
  appLanguages
) {
  if (text.length > 750) {
    text = text.slice(0, 750);
    outputWarning(i18n.textToSpeechTruncation());
  }
  let voice = appLanguages['English']['female'];
  let languageCode = 'en-US';
  if (appLanguages[language] && appLanguages[language][gender]) {
    voice = appLanguages[language][gender];
    languageCode = appLanguages[language]['languageCode'];
  } else {
    language = 'English';
    gender = 'female';
  }

  const cachedBytes = Sounds.getSingleton().getTextBytes(language, text);

  if (
    cachedBytes !== undefined &&
    cachedBytes.profaneWords !== undefined &&
    cachedBytes.profaneWords.length > 0
  ) {
    outputWarning(
      i18n.textToSpeechProfanity({
        profanityCount: cachedBytes['profaneWords'].length,
        profaneWords: cachedBytes['profaneWords'].join(', ')
      })
    );
    return;
  }
  const asyncOutputWarning = getAsyncOutputWarning();
  const forceHTML5 = false;
  if (cachedBytes !== undefined && cachedBytes[gender] !== undefined) {
    if (cachedBytes[gender].length > 0) {
      Sounds.getSingleton().addPromiseToSpeechQueue(
        cachedBytes[gender].slice(0),
        {
          volume: 1.0,
          loop: false,
          forceHTML5: forceHTML5,
          allowHTML5Mobile: true,
          onEnded: () => {
            Sounds.getSingleton().onSpeechFinished();
          }
        }
      );
    } else {
      Sounds.getSingleton().addPromiseToSpeechQueue(
        undefined,
        {
          volume: 1.0,
          loop: false,
          forceHTML5: forceHTML5,
          allowHTML5Mobile: true,
          onEnded: () => {
            Sounds.getSingleton().onSpeechFinished();
          }
        },
        {
          language: language,
          text: text,
          gender: gender,
          profanityFoundCallback: profaneWords => {
            asyncOutputWarning(
              i18n.textToSpeechProfanity({
                profanityCount: profaneWords.length,
                profaneWords: profaneWords.join(', ')
              })
            );
          }
        }
      );
    }
  } else {
    let ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`;
    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    var request = new XMLHttpRequest();
    const resultPromise = new Promise(async function(resolve, reject) {
      let profaneWords = await findProfanity(text, languageCode, true);
      if (profaneWords && profaneWords.length > 0) {
        if (!Array.isArray(profaneWords)) {
          profaneWords = [profaneWords];
        }
        asyncOutputWarning(
          i18n.textToSpeechProfanity({
            profanityCount: profaneWords.length,
            profaneWords: profaneWords.join(', ')
          })
        );
        Sounds.getSingleton().registerTextBytes(language, text, profaneWords);
        resolve(PROFANITY_FOUND);
      }
      request.onreadystatechange = function() {
        // Waiting for readyState to be 4 meaning that the request is done
        if (request.readyState === 4) {
          if (request.status >= 200 && request.status < 300) {
            resolve(request.response);
          } else {
            reject({
              status: request.status,
              statusText: request.statusText
            });
          }
        }
      };

      request.open('POST', url, true);
      request.responseType = 'arraybuffer';
      request.setRequestHeader('Authorization', 'Bearer ' + token);
      request.setRequestHeader('Content-Type', 'application/ssml+xml');
      request.setRequestHeader(
        'X-Microsoft-OutputFormat',
        'audio-16khz-32kbitrate-mono-mp3'
      );
      request.send(ssml);
    });
    Sounds.getSingleton().addPromiseToSpeechQueue(
      resultPromise,
      {
        volume: 1.0,
        loop: false,
        forceHTML5: forceHTML5,
        allowHTML5Mobile: true,
        onEnded: () => {
          Sounds.getSingleton().onSpeechFinished();
        }
      },
      {
        language: language,
        text: text,
        profaneWords: undefined,
        gender: gender
      }
    );
    Sounds.getSingleton().registerTextBytes(
      language,
      text,
      undefined,
      gender,
      []
    );
  }
}
