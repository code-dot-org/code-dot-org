import {viewableAudioFileType} from '@codebridge/utils/viewableAudioFileType';

describe('viewableAudioFileType', () => {
  it('should return true for playable audio file types', () => {
    const audioFileTypes = ['wav', 'mp3'];
    expect(viewableAudioFileType('wav', audioFileTypes)).toBe(true);
    expect(viewableAudioFileType('mp3', audioFileTypes)).toBe(true);
  });

  it('should return false for other file types', () => {
    const audioFileTypes = ['wav', 'mp3'];
    expect(viewableAudioFileType('png', audioFileTypes)).toBe(false);
    expect(viewableAudioFileType('py', audioFileTypes)).toBe(false);
  });

  it('should use default audio file types if not provided', () => {
    expect(viewableAudioFileType('wav')).toBe(true);
    expect(viewableAudioFileType('py')).toBe(false);
  });
});
