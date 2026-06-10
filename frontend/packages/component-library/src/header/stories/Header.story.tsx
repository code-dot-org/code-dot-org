import allProjectsIcon from '@public/images/header-all-projects-icon.png';
import appLabIcon from '@public/images/header-app-lab-icon.png';
import gameLabIcon from '@public/images/header-game-lab-icon.png';
import spriteLabIcon from '@public/images/header-sprite-lab-icon.png';
import logoImage from '@public/images/logo-codeai-inverse.svg';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect, userEvent, waitFor} from 'storybook/test';

// Render the built package (what studio ships), not the relative source.
// @storybook/react-vite's bundling of the raw source drops the component's MUI
// sx (var-colored borders, nested `& i` selectors); the dist build — where @mui
// is external — resolves them. Eyes then snapshots the artifact consumers get.
import Header from '@code-dot-org/component-library/header';

export default {
  title: 'DesignSystem/Header',
  component: Header,
  parameters: {
    // The header spans the full viewport in studio; render it edge-to-edge (not
    // in Storybook's default 16px-padded canvas) so Eyes/visual baselines match prod.
    layout: 'fullscreen',
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
} as Meta;

type Story = StoryObj<typeof Header>;

const STUDENT_MENU_ITEMS = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '//code.org/students'},
  {label: 'Projects', href: '/projects'},
  {label: 'Incubator', href: '//code.org/incubator'},
];

const TEACHER_MENU_ITEMS = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '/catalog'},
  {label: 'Projects', href: '/projects'},
  {label: 'Professional Learning', href: '/my-professional-learning'},
  {label: 'Incubator', href: '//code.org/incubator'},
];

const CREATE_MENU_ITEMS = [
  {
    id: 'spritelab',
    label: 'Sprite Lab',
    href: '/projects/spritelab/new',
    iconUrl: spriteLabIcon,
  },
  {
    id: 'applab',
    label: 'App Lab',
    href: '/projects/applab/new',
    iconUrl: appLabIcon,
  },
  {
    id: 'gamelab',
    label: 'Game Lab',
    href: '/projects/gamelab/new',
    iconUrl: gameLabIcon,
  },
  {
    id: 'view_all',
    label: 'View all projects...',
    href: '/projects',
    iconUrl: allProjectsIcon,
  },
];

// Mirrors studio's shipped global nav (apps/studio .../header/config.ts) so the
// Eyes snapshot and the hamburger interaction test exercise the real structure —
// every group + the full sub-link sets — not a trimmed sample.
const GLOBAL_NAV_ITEMS = [
  {label: 'Learn', href: '//code.org/students'},
  {
    label: 'Teach',
    subItems: [
      {label: 'Educator Overview', href: '//code.org/teach'},
      {
        label: 'Elementary School',
        href: '//code.org/educate/curriculum/elementary-school',
      },
      {
        label: 'Middle School',
        href: '//code.org/educate/curriculum/middle-school',
      },
      {label: 'High School', href: '//code.org/educate/curriculum/high-school'},
      {label: 'Hour of Code', href: 'https://hourofcode.com'},
      {
        label: 'Beyond Code.org',
        href: '//code.org/educate/curriculum/3rd-party',
      },
      {label: 'Online Community', href: 'https://forum.code.org/'},
      {label: 'Technical Requirements', href: '//code.org/educate/it'},
      {label: 'Tools and Videos', href: '//code.org/educate/resources/videos'},
    ],
  },
  {label: 'Districts', href: '//code.org/administrators'},
  {label: 'Stats', href: '//code.org/promote'},
  {label: 'Donate', href: '//code.org/donate'},
  {
    label: 'About',
    subItems: [
      {label: 'About Us', href: '//code.org/about'},
      {label: 'Leadership', href: '//code.org/about/leadership'},
      {label: 'Donors', href: '//code.org/about/donors'},
      {label: 'Partners', href: '//code.org/about/partners'},
      {label: 'Full Team', href: '//code.org/about/team'},
      {label: 'Newsroom', href: '//code.org/about/news'},
      {label: 'Careers', href: '//code.org/about/jobs'},
      {label: 'Contact Us', href: '//code.org/contact'},
      {label: 'FAQs', href: '//code.org/faq'},
    ],
  },
  {
    label: 'Privacy & Legal',
    subItems: [
      {label: 'Privacy Policy', href: '//code.org/privacy'},
      {label: 'Cookie Notice', href: '//code.org/cookies'},
      {label: 'Terms of Service', href: '//code.org/terms-of-service'},
    ],
  },
];

const SUPPORT_LINKS = [
  {label: 'Help and support', href: 'https://support.code.org'},
  {
    label: 'Report a problem',
    href: 'https://support.code.org/hc/en-us/requests/new',
  },
];

const BASE = {
  logoImageUrl: logoImage,
  brandName: 'CodeAI',
  createMenuItems: CREATE_MENU_ITEMS,
  globalNavItems: GLOBAL_NAV_ITEMS,
  supportLinks: SUPPORT_LINKS,
};

const TEACHER_ARGS = {
  ...BASE,
  menuItems: TEACHER_MENU_ITEMS,
  userAuth: {
    status: 'signed-in' as const,
    display_name: 'Ms. Rivera',
    user_type: 'teacher' as const,
  },
};

// Desktop viewport so the >1200px "New project" trigger renders in the vitest
// browser test and the Eyes snapshot (MINIMAL_VIEWPORTS has only narrow presets).
const DESKTOP_LAYOUT_PARAMS = {
  viewport: {
    viewports: {
      desktop: {name: 'Desktop', styles: {width: '1280px', height: '800px'}},
    },
    defaultViewport: 'desktop',
  },
  eyes: {browser: {width: 1280, height: 800, name: 'chrome'}},
};

// Phone viewport exercising the mobile auth behavior: the signed-in pill stays
// on the bar (prod keeps it visible), while signed-out auth moves to the hamburger.
const MOBILE_LAYOUT_PARAMS = {
  viewport: {
    viewports: {
      mobile: {name: 'Mobile', styles: {width: '375px', height: '800px'}},
    },
    defaultViewport: 'mobile',
  },
  eyes: {browser: {width: 375, height: 800, name: 'chrome'}},
};

export const StudentSignedIn: Story = {
  args: {
    ...BASE,
    menuItems: STUDENT_MENU_ITEMS,
    userAuth: {status: 'signed-in', display_name: 'Alex', user_type: 'student'},
  },
  // Opens the account menu and asserts its items render with prod-matched type
  // metrics (fontWeight 500, lineHeight 20px) that only resolve under real layout.
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Account menu'}));
    // MUI Menu portals to document.body, outside canvasElement.
    const item = await within(document.body).findByRole('menuitem', {
      name: 'My projects',
    });
    const styles = getComputedStyle(item);
    expect(styles.fontWeight).toBe('500');
    expect(styles.lineHeight).toBe('20px');
  },
};

// Resting-state guards, each a flat assert, ending with no menu open:
//  - target size (WCAG 2.5.8 AA): every control is at least 24x24px.
//  - hover colors: hovered New project + Account stay brand-white (label, icon,
//    border) — CdoTheme has no palette, so a regression resolved hover to MUI's
//    default primary purple. The white outline comes from var() in sx, not styled.
//  - focus-visible (F-5): keyboard-tabbing to the Account button engages
//    :focus-visible (programmatic .focus() does not, in Chromium).
export const TeacherSignedIn: Story = {
  args: {
    ...BASE,
    menuItems: TEACHER_MENU_ITEMS,
    userAuth: {
      status: 'signed-in',
      display_name: 'Ms. Rivera',
      user_type: 'teacher',
    },
  },
  parameters: DESKTOP_LAYOUT_PARAMS,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const white = 'rgb(255, 255, 255)';

    for (const label of [
      'CodeAI Home',
      'New project menu',
      'Account menu',
      'Help menu',
      'Open navigation menu',
    ]) {
      const {width, height} = canvasElement
        .querySelector(`[aria-label="${label}"]`)!
        .getBoundingClientRect();
      expect(width).toBeGreaterThanOrEqual(24);
      expect(height).toBeGreaterThanOrEqual(24);
    }

    const newProject = canvas.getByRole('button', {name: 'New project menu'});
    await userEvent.hover(newProject);
    expect(getComputedStyle(newProject).color).toBe(white);
    expect(getComputedStyle(newProject.querySelector('i')!).color).toBe(white);
    expect(getComputedStyle(newProject).borderColor).toBe(white);

    const account = canvas.getByRole('button', {name: 'Account menu'});
    await userEvent.hover(account);
    expect(getComputedStyle(account).color).toBe(white);
    expect(getComputedStyle(account.querySelector('i')!).color).toBe(white);
    expect(getComputedStyle(account).borderColor).toBe(white);

    account.blur();
    canvasElement.querySelector('a')?.focus();
    for (let i = 0; i < 12 && document.activeElement !== account; i++) {
      await userEvent.tab();
    }
    expect(document.activeElement).toBe(account);
    expect(account.matches(':focus-visible')).toBe(true);

    // :active (press-and-hold) keeps the white border — the theme's Button
    // :active rule recolors it unless the trigger re-pins border in sx.
    for (const btn of [newProject, account]) {
      await userEvent.pointer({keys: '[MouseLeft>]', target: btn});
      expect(getComputedStyle(btn).borderColor).toBe(white);
      await userEvent.pointer({keys: '[/MouseLeft]'});
      await userEvent.keyboard('{Escape}');
    }
  },
};

// Account-button-width regression: the name span is capped at 120px (truncating
// the long name) and the button auto-sizes to prod's ~176px. It used to cap the
// whole button at 120px, over-truncating the email and shifting "New project".
export const SignedInLongName: Story = {
  args: {
    ...BASE,
    menuItems: STUDENT_MENU_ITEMS,
    userAuth: {
      status: 'signed-in',
      display_name: 'Bartholomew-Maximilian',
      user_type: 'student',
    },
  },
  play: async ({canvasElement}) => {
    const button = canvasElement.querySelector(
      'button[aria-label="Account menu"]',
    ) as HTMLElement;
    const nameSpan = [...button.querySelectorAll('span')].find(span =>
      (span.textContent || '').includes('Bartholomew'),
    ) as HTMLElement;
    expect(Math.round(nameSpan.getBoundingClientRect().width)).toBe(120);
    const buttonWidth = button.getBoundingClientRect().width;
    expect(buttonWidth).toBeGreaterThanOrEqual(168);
    expect(buttonWidth).toBeLessThanOrEqual(184);
  },
};

export const SignedOut: Story = {
  args: {
    ...BASE,
    menuItems: [],
    createMenuItems: undefined,
    userAuth: {status: 'signed-out'},
  },
};

export const Loading: Story = {
  args: {
    ...BASE,
    menuItems: STUDENT_MENU_ITEMS,
    userAuth: {status: 'loading'},
  },
};

export const Error: Story = {
  args: {
    ...BASE,
    menuItems: STUDENT_MENU_ITEMS,
    userAuth: {status: 'error'},
  },
};

// Create-menu open state for Eyes. Opens the "New project" picker (rendered at the
// desktop viewport); the picker portals to body. Asserts the Sprite Lab item's
// prod-matched fontWeight 600, which only resolves under real layout.
export const CreateMenu: Story = {
  args: {...TEACHER_ARGS},
  parameters: DESKTOP_LAYOUT_PARAMS,
  play: async ({canvasElement}) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {name: 'New project menu'}),
    );
    const item = await within(document.body).findByRole('menuitem', {
      name: 'Sprite Lab',
    });
    expect(getComputedStyle(item).fontWeight).toBe('600');
  },
};

// Hamburger open + expanded state. Opens the panel and asserts the compact 242px
// width matching prod #hamburger-contents (not a full-width Drawer), then expands
// the first <details> summary. Caret-inset regression: the summary needs
// box-sizing:border-box so its 8px padding sits inside the panel; without it the
// chevron rendered flush to the panel edge (~0–1px inset).
export const Hamburger: Story = {
  args: {...TEACHER_ARGS},
  play: async ({canvasElement}) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {name: 'Open navigation menu'}),
    );
    // Popover panel portals to document.body, outside canvasElement. Retry the
    // width assert until the MUI Grow transition settles (scale reaches 1).
    const panel = await waitFor(() => {
      const p = document.querySelector('.MuiPopover-paper') as HTMLElement;
      expect(p).not.toBeNull();
      expect(Math.round(p.getBoundingClientRect().width)).toBe(242);
      return p;
    });

    const summary = panel.querySelector('summary') as HTMLElement;
    expect(getComputedStyle(summary).boxSizing).toBe('border-box');

    await userEvent.click(summary);
    expect(summary.closest('details')).toHaveAttribute('open');

    const chevron = summary.querySelector('i') as HTMLElement;
    const inset =
      panel.getBoundingClientRect().right -
      chevron.getBoundingClientRect().right;
    expect(inset).toBeGreaterThanOrEqual(10);
  },
};

// Signed-in at phone width: the account pill stays on the bar (prod keeps
// #header_user_menu visible). Regression guard — it used to be hidden below 768px.
export const SignedInMobile: Story = {
  args: {...TEACHER_ARGS},
  parameters: MOBILE_LAYOUT_PARAMS,
  play: async ({canvasElement}) => {
    const account = canvasElement.querySelector(
      'button[aria-label="Account menu"]',
    ) as HTMLElement;
    expect(account).not.toBeNull();
    expect(account.getBoundingClientRect().width).toBeGreaterThan(0);
  },
};

// Signed-out at phone width: the bar Sign in / Create account buttons are hidden
// (prod hides #sign_in_or_user below 768px); the auth lives in the hamburger
// instead (prod's #hamburger-sign-up-buttons).
export const SignedOutMobile: Story = {
  args: {
    ...BASE,
    menuItems: [],
    createMenuItems: undefined,
    userAuth: {status: 'signed-out'},
  },
  parameters: MOBILE_LAYOUT_PARAMS,
  play: async ({canvasElement}) => {
    const barSignIn = canvasElement.querySelector('a[href="/users/sign_in"]');
    if (barSignIn) {
      expect(barSignIn.getBoundingClientRect().width).toBe(0);
    }
    await userEvent.click(
      within(canvasElement).getByRole('button', {name: 'Open navigation menu'}),
    );
    const drawer = within(document.body);
    expect(
      await drawer.findByRole('link', {name: 'Sign in'}),
    ).toBeInTheDocument();
    expect(
      drawer.getByRole('link', {name: 'Create account'}),
    ).toBeInTheDocument();
  },
};
