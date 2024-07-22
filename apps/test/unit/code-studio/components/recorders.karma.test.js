import getRecorder, {
  RecordingFileType,
} from '@cdo/apps/code-studio/components/recorders';

import {assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('recorders', () => {
  for (const fileType of [
    ...Object.values(RecordingFileType),
    undefined,
    null,
  ]) {
    const recorder = getRecorder(fileType);

    it(`creates a recorder for file type ${fileType}`, () => {
      assert.isNotNull(recorder);
    });

    it(`has init function for file type ${fileType}`, () => {
      assert.isFunction(recorder.init);
    });

    it(`has startRecording function for file type ${fileType}`, () => {
      assert.isFunction(recorder.startRecording);
    });

    it(`has stopRecording function for file type ${fileType}`, () => {
      assert.isFunction(recorder.stopRecording);
    });

    it(`has isRecording function for file type ${fileType}`, () => {
      assert.isFunction(recorder.isRecording);
    });

    it(`has getExtension function for file type ${fileType}`, () => {
      assert.isFunction(recorder.getExtension);
      assert.equal(recorder.getExtension(), fileType || RecordingFileType.MP3);
    });
  }
});
