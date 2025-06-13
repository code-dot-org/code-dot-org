import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {usePathname} from 'next/navigation';

import Footer from '../Footer';

const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
  })),
}));

const mockPathName = usePathname as jest.Mock;

describe('Footer Component', () => {
  it('calls router.push and updates language on language change - home page', async () => {
    mockPathName.mockReturnValue('/en/home');
    render(<Footer locale="en" />);
    const user = userEvent.setup();

    const languageDropdown = screen.getByRole('combobox');
    await user.selectOptions(languageDropdown, 'es');

    expect(mockRouterPush).toHaveBeenCalledWith('/es/home');
    expect(window.Localize.setLanguage).toHaveBeenCalledWith('es');
  });

  it('calls router.push and updates language on language change - nested path', async () => {
    mockPathName.mockReturnValue('/en/engineering/all-the-things');
    render(<Footer locale="en" />);
    const user = userEvent.setup();

    const languageDropdown = screen.getByRole('combobox');
    await user.selectOptions(languageDropdown, 'es');

    expect(mockRouterPush).toHaveBeenCalledWith(
      '/es/engineering/all-the-things',
    );
    expect(window.Localize.setLanguage).toHaveBeenCalledWith('es');
  });
});
