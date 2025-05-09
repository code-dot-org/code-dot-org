import {render, screen, fireEvent} from '@testing-library/react';

import ContentEditorHelper from '../ContentEditorHelper';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(key => (key === 'contentEditor' ? 'true' : null)),
  })),
}));

jest.mock(
  '../TokenPrompt',
  () =>
    ({onSubmit}: {onSubmit: (token: string) => void}) => (
      <button onClick={() => onSubmit('mockToken')}>Submit Token</button>
    ),
);

jest.mock('@/components/contentEditorHelper/Tools', () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({onChangeDraftToken, previewLabel}: any) => (
    <div>
      <span>{previewLabel}</span>
      <button onClick={onChangeDraftToken}>Change Token</button>
    </div>
  ),
);

describe('ContentEditorHelper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the floating button when contentEditor query param is true', () => {
    render(<ContentEditorHelper isDraftModeEnabled={false} />);
    expect(screen.getByText('Published Version')).toBeInTheDocument();
  });

  it('renders TokenPrompt when no draftToken is in localStorage', () => {
    render(<ContentEditorHelper isDraftModeEnabled={false} />);
    fireEvent.click(screen.getByText('Published Version'));
    expect(screen.getByText('Submit Token')).toBeInTheDocument();
  });

  it('renders ContentEditorTools when draftToken is in localStorage', () => {
    localStorage.setItem('draftToken', 'mockToken');
    render(<ContentEditorHelper isDraftModeEnabled={true} />);
    fireEvent.click(screen.getByText('Draft Version'));
    expect(screen.getByText('Draft Version')).toBeInTheDocument();
  });

  it('updates render state to tools after submitting a token', () => {
    render(<ContentEditorHelper isDraftModeEnabled={false} />);
    fireEvent.click(screen.getByText('Published Version'));
    fireEvent.click(screen.getByText('Submit Token'));
    expect(screen.getByText('Published Version')).toBeInTheDocument();
  });

  it('updates render state to token-prompt when changing the draft token', () => {
    localStorage.setItem('draftToken', 'mockToken');
    render(<ContentEditorHelper isDraftModeEnabled={true} />);
    fireEvent.click(screen.getByText('Draft Version'));
    fireEvent.click(screen.getByText('Change Token'));
    expect(screen.getByText('Submit Token')).toBeInTheDocument();
  });
});
