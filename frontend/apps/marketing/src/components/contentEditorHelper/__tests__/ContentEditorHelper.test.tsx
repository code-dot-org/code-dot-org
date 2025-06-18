import {render, screen, fireEvent} from '@testing-library/react';

import ContentEditorHelper from '../ContentEditorHelper';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(key => (key === 'contentEditor' ? 'true' : null)),
  })),
}));

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

  it('renders ContentEditorTools', () => {
    render(<ContentEditorHelper isDraftModeEnabled={true} />);
    fireEvent.click(screen.getByText('Draft Version'));
    expect(screen.getByText('Draft Version')).toBeInTheDocument();
  });
});
