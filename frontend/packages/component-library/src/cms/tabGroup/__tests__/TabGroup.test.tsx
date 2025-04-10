import {fireEvent, render, screen, within} from '@testing-library/react';

import '@testing-library/jest-dom';
import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/image';

import TabGroup, {TabGroupProps, TabGroupTabModel} from './../TabGroup';

const mockOnChange = jest.fn();

const defaultButton: LinkButtonProps = {
  children: 'Click Me',
  href: 'https://google.com',
  text: 'Click me',
  target: '_self',
};

const defaultImage: ImageProps = {
  src: 'https://via.placeholder.com/150',
  alt: 'Placeholder Image',
};

const defaultTabs: TabGroupTabModel[] = [
  {
    value: 'tab1',
    text: 'Tab 1',
    tabContent: {
      image: defaultImage,
      button: defaultButton,
      title: 'Track Your Progress',
      description: 'Monitor student work with real-time insights.',
    },
  },
  {
    value: 'tab2',
    text: 'Tab 2',
    tabContent: {
      image: defaultImage,
      button: defaultButton,
      title: 'Engage Students',
      description: 'Make learning more interactive and fun!',
    },
  },
];

const setup = (props?: Partial<TabGroupProps>) => {
  return render(
    <TabGroup
      tabs={defaultTabs}
      defaultSelectedTabValue="tab1"
      onChange={mockOnChange}
      name="test-tabs"
      {...props}
    />,
  );
};

describe('TabGroup', () => {
  beforeEach(() => {
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
    mockOnChange.mockClear();
  });

  test('renders tabs correctly', () => {
    setup();

    // ✅ Scope the search to tabs container only
    const tabsContainer = screen.getByRole('tablist');
    expect(within(tabsContainer).getByText('Tab 1')).toBeVisible();
    expect(within(tabsContainer).getByText('Tab 2')).toBeVisible();
  });

  test('calls onChange when tab is clicked', () => {
    setup();

    const tabsContainer = screen.getByRole('tablist');
    const tab = within(tabsContainer).getByText('Tab 2');
    fireEvent.click(tab);

    // ✅ Ensure onChange is called with correct value
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('tab2');
  });

  test('renders custom content inside tab', () => {
    setup();

    // ✅ Scope to active tab panel only
    const activeTabPanel = screen.getByRole('tabpanel', {
      name: 'Tab 1',
    });

    const image = within(activeTabPanel).getByAltText('Placeholder Image');
    expect(image).toBeVisible();

    const title = within(activeTabPanel).getByText('Track Your Progress');
    const description = within(activeTabPanel).getByText(
      'Monitor student work with real-time insights.',
    );
    expect(title).toBeVisible();
    expect(description).toBeVisible();

    // ✅ Scope button to tab panel
    const linkButton = within(activeTabPanel).getByRole('link', {
      name: 'Click me',
    });
    expect(linkButton).toBeVisible();
    expect(linkButton.closest('a')).toHaveAttribute(
      'href',
      'https://google.com',
    );
  });

  test('renders link button with correct attributes', () => {
    setup();

    // ✅ Scope to active panel or accordion
    const activeTabPanel = screen.getByRole('tabpanel', {
      name: 'Tab 1',
    });
    const linkButton = within(activeTabPanel).getByRole('link', {
      name: 'Click me',
    });

    // ✅ Ensure that the link has the correct attributes
    expect(linkButton).toBeVisible();
    expect(linkButton.closest('a')).toHaveAttribute(
      'href',
      'https://google.com',
    );
    expect(linkButton.closest('a')).toHaveAttribute('target', '_self');
  });

  // ✅ Mobile view testing
  describe('Mobile view', () => {
    beforeEach(() => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));
    });

    test('renders accordion correctly in mobile view', () => {
      setup();

      // ✅ Get accordion container by role="region"
      const accordion = screen.getByRole('region');

      expect(within(accordion).getByText('Tab 1')).toBeVisible();
      expect(within(accordion).getByText('Tab 2')).toBeVisible();

      // ✅ Ensure accordion content is hidden initially
      expect(
        within(accordion).queryByText('Track Your Progress'),
      ).not.toBeVisible();

      // ✅ Open the accordion
      const tab = within(accordion).getByText('Tab 1');
      fireEvent.click(tab);

      expect(within(accordion).getByText('Track Your Progress')).toBeVisible();
      expect(
        within(accordion).getByText(
          'Monitor student work with real-time insights.',
        ),
      ).toBeVisible();

      // ✅ Scope link to accordion content
      const linkButton = within(accordion).getAllByRole('link', {
        name: 'Click me',
      })[0];
      expect(linkButton).toBeVisible();
      expect(linkButton.closest('a')).toHaveAttribute(
        'href',
        'https://google.com',
      );
    });

    test('closes accordion when clicked again', () => {
      setup();

      const accordion = screen.getByRole('region');
      const tab = within(accordion).getByText('Tab 1');

      // ✅ Open the accordion
      fireEvent.click(tab);
      expect(within(accordion).getByText('Track Your Progress')).toBeVisible();

      // ✅ Close the accordion
      fireEvent.click(tab);
      expect(
        within(accordion).queryByText('Track Your Progress'),
      ).not.toBeVisible();
    });
  });

  // ✅ Desktop view testing
  describe('Desktop view', () => {
    beforeEach(() => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    test('renders correct tab panel content', () => {
      setup();

      // Get the specific tab panel using its role
      const tabPanel = screen.getByRole('tabpanel', {
        name: 'Tab 1',
      });

      // ✅ Use `within()` to limit the search to the tab panel
      expect(within(tabPanel).getByText('Track Your Progress')).toBeVisible();
      expect(
        within(tabPanel).getByText(
          'Monitor student work with real-time insights.',
        ),
      ).toBeVisible();

      const linkButton = within(tabPanel).getByRole('link', {name: 'Click me'});
      expect(linkButton).toBeVisible();
    });

    test('updates content when different tab is clicked', () => {
      setup();

      const tabsContainer = screen.getByRole('tablist');
      fireEvent.click(within(tabsContainer).getByText('Tab 2'));

      // ✅ Scope to active panel only
      const tabPanel = screen.getByRole('tabpanel', {name: 'Tab 2'});

      expect(within(tabPanel).getByText('Engage Students')).toBeVisible();
      expect(
        within(tabPanel).getByText('Make learning more interactive and fun!'),
      ).toBeVisible();

      // ✅ Ensure previous content is no longer in the DOM
      expect(
        within(tabPanel).queryByText('Track Your Progress'),
      ).not.toBeInTheDocument();
    });
  });
});
