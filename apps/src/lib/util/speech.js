import Sounds from '../../Sounds';
import {
  SpeechConfig,
  SpeechSynthesizer,
  SpeechSynthesisOutputFormat
} from 'microsoft-cognitiveservices-speech-sdk';

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
  const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisOutputFormat =
    SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  let voice =
    (appLanguages[language] && appLanguages[language][gender]) ||
    appLanguages['English']['female'];
  const synthesizer = new SpeechSynthesizer(
    speechConfig,
    undefined /* AudioConfig */
  );
  let ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`;
  synthesizer.speakSsmlAsync(
    ssml,
    result => {
      // There is no way to make ajax requests from html on the filesystem.  So
      // the only way to play sounds is using HTML5. This scenario happens when
      // students export their apps and run them offline. At this point, their
      // uploaded sound files are exported as well, which means varnish is not
      // an issue.
      const forceHTML5 = window.location.protocol === 'file:';
      Sounds.getSingleton().playBytes(result.audioData, {
        volume: 1.0,
        loop: false,
        forceHTML5: forceHTML5,
        allowHTML5Mobile: true
      });

      synthesizer.close();
    },
    error => {
      console.warn(error);
      synthesizer.close();
    }
  );
}
