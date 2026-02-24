import * as utils from '@cdo/apps/aichat/redux/utils';
import {AiCustomizations} from '@cdo/apps/aichat/types';
import {EMPTY_MODEL_CARD_INFO} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

describe('aichatRedux utils', () => {
  let aiCustomizations1: AiCustomizations;
  let aiCustomizations2: AiCustomizations;
  let aiCustomizations3: AiCustomizations;
  let aiCustomizations4: AiCustomizations;
  beforeEach(() => {
    aiCustomizations1 = {
      selectedModelId: AiChatModelIds.ARITHMO,
      temperature: 0.5,
      retrievalContexts: ['123'],
      systemPrompt: 'hello',
      modelCardInfo: EMPTY_MODEL_CARD_INFO,
    };
    aiCustomizations2 = {...aiCustomizations1};
    aiCustomizations2.selectedModelId = AiChatModelIds.KAREN;
    aiCustomizations3 = {...aiCustomizations1};
    aiCustomizations4 = {...aiCustomizations2};
    aiCustomizations4.systemPrompt = 'hi';
  });
  it('haveDifferentValues returns field name whose value is different.', async () => {
    expect(
      utils.findChangedProperties(aiCustomizations1, aiCustomizations2)[0]
    ).toBe('selectedModelId');
  });
  it('haveDifferentValues returns empty array if no values are different.', async () => {
    expect(
      utils.findChangedProperties(aiCustomizations1, aiCustomizations3).length
    ).toBe(0);
  });
  it('haveDifferentValues returns array with length 2 if two values are different.', async () => {
    expect(
      utils.findChangedProperties(aiCustomizations1, aiCustomizations4).length
    ).toBe(2);
  });
});
