import logoImage from '@public/images/cdo-logo-inverse.svg';
import allProjectsImage from '@public/images/header-all-projects-icon.png';
import appLabImage from '@public/images/header-app-lab-icon.png';
import artistImage from '@public/images/header-artist-icon.png';
import dancePartyImage from '@public/images/header-dance-party-icon.png';
import gameLabImage from '@public/images/header-game-lab-icon.png';
import musicLabImage from '@public/images/header-music-lab-icon.png';
import pythonLabImage from '@public/images/header-python-lab-icon.png';
import spriteLabImage from '@public/images/header-sprite-lab-icon.png';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect, userEvent} from 'storybook/test';
import {INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS} from 'storybook/viewport';

import {getDefaultHeaderProps} from '../config';
import Header, {HeaderProps} from '../Header';

type Story = StoryObj<typeof Header>;

export default {
  title: 'CMS/Header',
  component: Header,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable the color contrast rule for the Header.
            // Header component has one a11y issue, and it's related to the background and link colors.
            // This is a known issue across our design system, and we are ok accepting this for now.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
  render: args => <Header {...args} />,
} as Meta<HeaderProps>;

const defaultArgs = getDefaultHeaderProps({
  logoImage,
  spriteLabImage,
  artistImage,
  appLabImage,
  gameLabImage,
  musicLabImage,
  dancePartyImage,
  pythonLabImage,
  allProjectsImage,
  studioUrl: 'https://studio.code.org',
});

//
// STORIES
//
export const DefaultLoggedOut: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'desktop',
    },
    eyes: {
      browser: {width: 1268, height: 720, name: 'chrome'},
    },
    docs: {
      description: {
        story:
          'The large desktop view of the header when the user is logged out. The header contains the logo, main navigation links, New Project button/menu, Sign In and Create Account buttons, and a Help icon button/menu.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that logo is visible
    const logo = await canvas.findByRole('img', {
      name: 'Code.org logo',
    });
    await expect(logo).toBeVisible();

    // check that logo is linked to the homepage
    const logoLink = await canvas.findByRole('link', {
      name: 'Go to homepage',
    });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');

    // check that main navigation is visible
    const mainNav = await canvas.findByRole('navigation', {
      name: 'Main navigation',
    });
    await expect(mainNav).toBeVisible();

    // check that secondary navigation is visible
    const secondaryNav = await canvas.findByRole('navigation', {
      name: 'Secondary navigation',
    });
    await expect(secondaryNav).toBeVisible();

    // check that New Project button is visible
    const projectsButton = await canvas.findByRole('button', {
      name: 'Open Projects menu',
    });
    await expect(projectsButton).toBeVisible();

    // check that the Sign In button is visible
    const signInButton = await canvas.findByRole('link', {name: 'Sign In'});
    await expect(signInButton).toBeVisible();

    // check that the Create Account button is visible
    const createAccountButton = await canvas.findByRole('link', {
      name: 'Create Account',
    });
    await expect(createAccountButton).toBeVisible();

    // check that Help button is visible
    const helpButton = await canvas.findByRole('button', {
      name: 'Open Help menu',
    });
    await expect(helpButton).toBeVisible();
  },
};

export const NewProjectMenu: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'desktop',
    },
    eyes: {
      browser: {width: 1268, height: 720, name: 'chrome'},
      waitBeforeCapture: 'ul[aria-label="Projects menu"]',
    },
    docs: {
      description: {
        story:
          'Shows the New Project menu. The New Project menu contains links to create different types of projects students can make.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that New Project button is visible
    const projectsButton = await canvas.findByRole('button', {
      name: 'Open Projects menu',
    });
    await expect(projectsButton).toBeVisible();

    // click the New Project button to open the menu
    await userEvent.click(projectsButton);

    // check that Projects menu is visible
    const projectsMenu = await canvas.findByRole('list', {
      name: 'Projects menu',
    });
    const projectsMenuLinks = await canvas.findAllByRole('link', {
      name: /sprite lab|artist|app lab|game lab|music lab|dance party|python lab|view all projects/i,
    });
    await expect(projectsMenu).toBeVisible();
    await expect(projectsMenuLinks).toHaveLength(8);
    for (const link of projectsMenuLinks) {
      await expect(link).toBeVisible();
    }
  },
};

export const HelpMenu: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'desktop',
    },
    eyes: {
      // TODO: CMS-559 - Turning this off for now because Applitools
      // does not currently support changing the viewportSize for a test,
      // so this menu is not being captured correctly. It's still
      // being tested in the play function.
      include: false,
    },
    docs: {
      description: {
        story:
          'Shows the Help menu on large desktop. The Help menu contains links to help and support resources.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that Help button is visible
    const helpButton = await canvas.findByRole('button', {
      name: 'Open Help menu',
    });
    await expect(helpButton).toBeVisible();

    // click the Help button to open the menu
    await userEvent.click(helpButton);

    // check that Help menu is visible
    const helpMenu = await canvas.findByRole('list', {
      name: 'Help menu',
    });
    const helpMenuLinks = await canvas.findAllByRole('link', {
      name: /help and support|report a problem/i,
    });
    await expect(helpMenu).toBeVisible();
    await expect(helpMenuLinks).toHaveLength(2);
    for (const link of helpMenuLinks) {
      await expect(link).toBeVisible();
    }
  },
};

export const SmallDesktop: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'ipad12p',
    },
    eyes: {
      browser: {width: 1024, height: 720, name: 'chrome'},
    },
    docs: {
      description: {
        story:
          'The small desktop view of the header includes the logo, a shortened list of main navigation links, the New Project button/menu, account buttons, and a Hamburger menu. The Hamburger menu contains the remaining main navigation links and Help menu links.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that logo is visible
    const logo = await canvas.findByRole('img', {
      name: 'Code.org logo',
    });
    await expect(logo).toBeVisible();

    // check that main navigation is visible
    const mainNav = await canvas.findByRole('navigation', {
      name: 'Main navigation',
    });
    await expect(mainNav).toBeVisible();
    const mainNavLinks = await canvas.findAllByRole('link', {
      name: /learn|teach|districts/i,
    });
    await expect(mainNavLinks).toHaveLength(3);
    for (const link of mainNavLinks) {
      await expect(link).toBeVisible();
    }

    // check that New Project button is visible
    const projectsButton = await canvas.findByRole('button', {
      name: 'Open Projects menu',
    });
    await expect(projectsButton).toBeVisible();

    // check that the Sign In button is visible
    const signInButton = await canvas.findByRole('link', {name: 'Sign In'});
    await expect(signInButton).toBeVisible();

    // check that the Create Account button is visible
    const createAccountButton = await canvas.findByRole('link', {
      name: 'Create Account',
    });
    await expect(createAccountButton).toBeVisible();

    // check that the Hamburger button is visible
    const hamburgerButton = await canvas.findByRole('button', {
      name: 'Open Hamburger menu',
    });
    await expect(hamburgerButton).toBeVisible();

    // click the Hamburger button to open the menu
    await userEvent.click(hamburgerButton);

    // check that Hamburger menu is visible
    const hamburgerMenu = await canvas.findByRole('navigation', {
      name: 'Hamburger menu',
    });
    const hamburgerMenuLinks = await canvas.findAllByRole('link', {
      name: /stats|donate|incubator|about|help and support|report a problem/i,
    });
    await expect(hamburgerMenu).toBeVisible();
    await expect(hamburgerMenuLinks).toHaveLength(6);
    for (const link of hamburgerMenuLinks) {
      await expect(link).toBeVisible();
    }
  },
};

export const Tablet: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'tablet',
    },
    eyes: {
      browser: {width: 834, height: 1112, name: 'chrome'},
    },
    docs: {
      description: {
        story:
          'The tablet view of the header displays the logo, account buttons, and a Hamburger menu. The New Project button/menu is removed, and the Hamburger menu includes all main navigation links and Help menu links.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that logo is visible
    const logo = await canvas.findByRole('img', {
      name: 'Code.org logo',
    });
    await expect(logo).toBeVisible();

    // check that the Sign In button is visible
    const signInButton = await canvas.findByRole('link', {name: 'Sign In'});
    await expect(signInButton).toBeVisible();

    // check that the Create Account button is visible
    const createAccountButton = await canvas.findByRole('link', {
      name: 'Create Account',
    });
    await expect(createAccountButton).toBeVisible();

    // check that the Hamburger button is visible
    const hamburgerButton = await canvas.findByRole('button', {
      name: 'Open Hamburger menu',
    });
    await expect(hamburgerButton).toBeVisible();

    // click the Hamburger button to open the menu
    await userEvent.click(hamburgerButton);

    // check that Hamburger menu is visible
    const hamburgerMenu = await canvas.findByRole('navigation', {
      name: 'Hamburger menu',
    });
    const hamburgerMenuLinks = await canvas.findAllByRole('link', {
      name: /learn|teach|districts|stats|donate|incubator|about|help and support|report a problem/i,
    });
    await expect(hamburgerMenu).toBeVisible();
    await expect(hamburgerMenuLinks).toHaveLength(9);
    for (const link of hamburgerMenuLinks) {
      await expect(link).toBeVisible();
    }
  },
};

export const Mobile: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'mobile2',
    },
    eyes: {
      browser: {width: 414, height: 896, name: 'chrome'},
    },
    docs: {
      description: {
        story:
          'The mobile view of the header displays the logo and a Hamburger menu. The Hamburger menu includes account buttons, all main navigation links, and links from the Help menu.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that the Hamburger button is visible
    const hamburgerButton = await canvas.findByRole('button', {
      name: 'Open Hamburger menu',
    });
    await expect(hamburgerButton).toBeVisible();

    // click the Hamburger button to open the menu
    await userEvent.click(hamburgerButton);

    // check that Hamburger menu is visible
    const hamburgerMenu = await canvas.findByRole('navigation', {
      name: 'Hamburger menu',
    });
    const hamburgerMenuLinks = await canvas.findAllByRole('link', {
      name: /learn|teach|districts|stats|donate|incubator|about|help and support|report a problem/i,
    });
    await expect(hamburgerMenu).toBeVisible();
    await expect(hamburgerMenuLinks).toHaveLength(9);
    for (const link of hamburgerMenuLinks) {
      await expect(link).toBeVisible();
    }
  },
};
