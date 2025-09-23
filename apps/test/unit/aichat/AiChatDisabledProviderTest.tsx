import {render, screen} from '@testing-library/react';
import React, {FC} from 'react';
import '@testing-library/jest-dom';

import {
  AiChatDisabledProvider,
  useAiChatDisabled,
} from '@cdo/apps/aichat/context/aiChatDisabledContext';

const ReaderComponent: FC = () => {
  const {chatDisabled, chatDisabledMessage} = useAiChatDisabled();
  return (
    <div>
      <div aria-label="chat disabled">{String(chatDisabled)}</div>
      <div aria-label="chat disabled message">{chatDisabledMessage ?? ''}</div>
    </div>
  );
};

const SetterComponent: FC = () => {
  const {setChatDisabled} = useAiChatDisabled();
  // Invoke on render to validate error behavior when no provider
  try {
    setChatDisabled(true);
  } catch (e) {
    return <div aria-label="threw">true</div>;
  }
  return <div aria-label="threw">false</div>;
};

const UpdaterComponent: React.FC = () => {
  const {
    chatDisabled,
    chatDisabledMessage,
    setChatDisabled,
    setChatDisabledMessage,
  } = useAiChatDisabled();
  return (
    <div>
      <div aria-label="chat disabled">{String(chatDisabled)}</div>
      <div aria-label="chat disabled message">{chatDisabledMessage ?? ''}</div>
      <button type="button" onClick={() => setChatDisabled(!chatDisabled)}>
        toggle disabled
      </button>
      <button type="button" onClick={() => setChatDisabledMessage('custom')}>
        set message
      </button>
    </div>
  );
};

describe('AiChatDisabledContext', () => {
  it('provides safe defaults without a provider', () => {
    render(<ReaderComponent />);
    expect(screen.getByLabelText('chat disabled')).toHaveTextContent('false');
    expect(screen.getByLabelText('chat disabled message')).toHaveTextContent(
      ''
    );
  });

  it('throws in test/dev if setters are used without a provider', () => {
    render(<SetterComponent />);
    expect(screen.getByLabelText('threw')).toHaveTextContent('true');
  });

  it('uses provided values from provider and allows updating via setters', () => {
    const {getByText, getByLabelText} = render(
      <AiChatDisabledProvider chatDisabled={true} chatDisabledMessage="hello">
        <UpdaterComponent />
      </AiChatDisabledProvider>
    );

    expect(getByLabelText('chat disabled')).toHaveTextContent('true');
    expect(getByLabelText('chat disabled message')).toHaveTextContent('hello');

    getByText('toggle disabled').click();
    expect(getByLabelText('chat disabled')).toHaveTextContent('false');

    getByText('set message').click();
    expect(getByLabelText('chat disabled message')).toHaveTextContent('custom');
  });
});
