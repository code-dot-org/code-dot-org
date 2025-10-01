import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import {AiChatDisabledProvider} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {AichatState} from '@cdo/apps/aichat/redux';
import {
  AssetSource,
  ChatButtonComponent,
  PendingChatMessage,
} from '@cdo/apps/aichat/types';
import UserChatMessageEditor from '@cdo/apps/aichat/views/UserChatMessageEditor';
import {commonI18n} from '@cdo/apps/types/locale';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

const mockDispatch = jest.fn();
const mockSubmitChatContents = jest.fn();
let mockState: {aichat: Partial<AichatState>} = {
  aichat: {
    chatMessagePending: undefined,
    saveInProgress: false,
    stagedFiles: [],
    userAddedSelectionContext: {},
  },
};

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  __esModule: true,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(mockState),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@cdo/apps/aichat/redux', () => ({
  __esModule: true,
  submitChatContents: (...args: unknown[]) => mockSubmitChatContents(...args),
}));

describe('UserChatMessageEditor', () => {
  const baseProps = {
    modelParameters: {
      selectedModelId: AiChatModelIds.GEMINI_2_0_FLASH,
      temperature: 0.5,
      systemPrompt: '',
      retrievalContexts: [],
    },
    clientType: AiChatClientTypes.AI_TUTOR,
  };

  beforeEach(() => {
    mockDispatch.mockReset();
    mockSubmitChatContents.mockReset();
    mockState = {
      aichat: {
        chatMessagePending: undefined,
        saveInProgress: false,
        stagedFiles: [],
        userAddedSelectionContext: {},
      },
    };
  });

  it('disables editor when disabled via context', async () => {
    render(
      <AiChatDisabledProvider chatDisabled>
        <UserChatMessageEditor {...baseProps} />
      </AiChatDisabledProvider>
    );

    const textarea = screen.getByPlaceholderText(
      commonI18n.aiUserMessagePlaceholder()
    );
    const submit = screen.getByLabelText(commonI18n.submit());

    expect(textarea).toBeDisabled();
    expect(submit).toBeDisabled();
  });

  it('disables editor when chat response is pending', async () => {
    mockState.aichat.chatMessagePending = {
      status: 'unknown',
    } as PendingChatMessage;

    render(<UserChatMessageEditor {...baseProps} />);

    const textarea = screen.getByPlaceholderText(
      commonI18n.aiUserMessagePlaceholder()
    );
    expect(textarea).toBeDisabled();
  });

  it('submits on Enter and clears the input when enabled', async () => {
    const user = userEvent.setup();
    render(<UserChatMessageEditor {...baseProps} />);

    const textarea = screen.getByPlaceholderText(
      commonI18n.aiUserMessagePlaceholder()
    );

    await user.click(textarea);
    await user.type(textarea, 'Hello bot');
    await user.keyboard('{Enter}');

    expect(mockSubmitChatContents).toHaveBeenCalledTimes(1);
    // First arg is the payload object
    expect(mockSubmitChatContents.mock.calls[0][0]).toMatchObject({
      text: 'Hello bot',
    });
    // Input clears after submit
    expect(textarea).toHaveValue('');
  });

  it('renders canned prompt chat buttons and clicking one triggers submit with analytics', async () => {
    const user = userEvent.setup();
    const ExampleButton: ChatButtonComponent = ({onClick}) => (
      <button
        type="button"
        onClick={() =>
          onClick('Can you give me an example?', {
            cannedPrompt: 'example',
          })
        }
      >
        Give an example
      </button>
    );

    render(
      <UserChatMessageEditor
        {...baseProps}
        chatButtons={[{ChatButton: ExampleButton, key: 'Give an example'}]}
      />
    );

    await user.click(screen.getByRole('button', {name: 'Give an example'}));
    expect(mockSubmitChatContents).toHaveBeenCalledTimes(1);
    expect(mockSubmitChatContents.mock.calls[0][0]).toMatchObject({
      text: 'Can you give me an example?',
      analyticsProperties: {cannedPrompt: 'example'},
    });
  });

  it('includes uploaded assets when multimodal is available', async () => {
    const user = userEvent.setup();
    const file = {filename: 'a.png', source: AssetSource.PROJECT};
    mockState.aichat.stagedFiles = [
      {
        key: '1',
        asset: file,
        status: 'uploaded',
      },
    ];

    render(<UserChatMessageEditor {...baseProps} multimodalAvailable={true} />);

    const textarea = screen.getByPlaceholderText(
      commonI18n.aiUserMessagePlaceholder()
    );
    await user.type(textarea, 'Use my image');
    await user.keyboard('{Enter}');

    expect(mockSubmitChatContents).toHaveBeenCalledTimes(1);
    expect(mockSubmitChatContents.mock.calls[0][0]).toMatchObject({
      text: 'Use my image',
      assets: [file],
    });
  });
});
