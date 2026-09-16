import {getAllowedFileExtensions} from '@cdo/apps/aichat/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

describe('getAllowedFileExtensions', () => {
  it('returns an empty list for a non-multimodal model', () => {
    expect(getAllowedFileExtensions(AiChatModelIds.MISTRAL)).toEqual([]);
  });

  it('returns image and pdf extensions for a multimodal model', () => {
    expect(getAllowedFileExtensions(AiChatModelIds.CHATGPT)).toEqual([
      'jpeg',
      'jpg',
      'png',
      'webp',
      'pdf',
    ]);
  });

  it('excludes gif and jpe for multimodal models', () => {
    const extensions = getAllowedFileExtensions(AiChatModelIds.CHATGPT);
    expect(extensions).not.toContain('gif');
    expect(extensions).not.toContain('jpe');
  });
});
