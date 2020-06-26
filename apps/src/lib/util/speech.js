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
 * @param {string} token The authorization token to access the Azure API
 * @param {string} region The region for accessing the Azure API
 */
export function textToSpeech(text, gender, token, region) {
  const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisOutputFormat =
    SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const voice = gender === 'male' ? 'en-US-BenjaminRUS' : 'en-US-AriaRUS';
  const synthesizer = new SpeechSynthesizer(speechConfig, undefined);
  const ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`;
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
