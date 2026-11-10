import {
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_NOT_AVAILABLE_INTERNATIONAL,
  AI_TUTOR_NOT_AVAILABLE_INTERNATIONAL,
} from '@cdo/apps/aichat/constants';
import {addChatEvent} from '@cdo/apps/aichat/redux/thunks/addChatEvent';
import {notifyErrorUnauthorized} from '@cdo/apps/aichat/redux/thunks/helpers/notifyErrorUnauthorized';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aichat/redux/thunks/addChatEvent', () => ({
  addChatEvent: jest.fn(event => event),
}));
jest.mock('@cdo/apps/aichat/redux/thunks/sendAnalytics', () => ({
  sendAnalytics: jest.fn(),
}));

const mockAddChatEvent = addChatEvent as jest.Mock;

const forbidden = (body: object) =>
  ({
    response: new Response(JSON.stringify(body), {status: 403}),
  } as unknown as NetworkError);

const shownText = () => mockAddChatEvent.mock.calls[0][0].text;

describe('notifyErrorUnauthorized', () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the tutor's region message when the model is blocked in the user's region", async () => {
    await notifyErrorUnauthorized(
      forbidden({error: 'model_not_available_in_region'}),
      'Chat Completion',
      jest.fn(),
      AiChatClientTypes.AI_TUTOR
    );
    expect(shownText()).toBe(AI_TUTOR_NOT_AVAILABLE_INTERNATIONAL);
  });

  it('shows the generic region message for a client with no copy of its own', async () => {
    await notifyErrorUnauthorized(
      forbidden({user_type: 'student', error: 'model_not_available_in_region'}),
      'Chat Completion',
      jest.fn(),
      AiChatClientTypes.FLOW_LAB
    );
    expect(shownText()).toBe(AI_NOT_AVAILABLE_INTERNATIONAL);
  });

  it('shows the authorization message for any other 403', async () => {
    await notifyErrorUnauthorized(
      forbidden({user_type: 'student'}),
      'Chat Completion',
      jest.fn(),
      AiChatClientTypes.AI_TUTOR
    );
    expect(shownText()).toBe(AI_CHAT_NOT_AUTHORIZED_STUDENT);
  });
});
