import allProjectsIcon from '@public/images/header-all-projects-icon.png';
import appLabIcon from '@public/images/header-app-lab-icon.png';
import gameLabIcon from '@public/images/header-game-lab-icon.png';
import spriteLabIcon from '@public/images/header-sprite-lab-icon.png';
import logoImage from '@public/images/logo-codeai-inverse.svg';
import {Meta, StoryFn} from '@storybook/react-vite';
import {within, expect, userEvent, waitFor} from 'storybook/test';

// Render the built package (what studio ships), not the relative source.
// @storybook/react-vite's bundling of the raw source drops the component's MUI
// sx (var-colored borders, nested `& i` selectors); the dist build — where @mui
// is external — resolves them. Eyes then snapshots the artifact consumers get.
import Header, {HeaderProps} from '@code-dot-org/component-library/header';

export default {
  title: 'DesignSystem/Header',
  component: Header,
  parameters: {
    a11y: {
      // color-contrast stays enabled (F-14); only the brand navigation bar is
      // excluded — its white-on-teal ratio is a design-accepted exception. The
      // menus and the signed-out surface remain contrast-checked.
      context: {exclude: [['nav[aria-label="Main navigation"]']]},
    },
  },
} as Meta;

const Template: StoryFn<HeaderProps> = (args: HeaderProps) => (
  <Header {...args} />
);

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

const GLOBAL_NAV_ITEMS = [
  {label: 'Learn', href: '//code.org/students'},
  {
    label: 'Teach',
    subItems: [
      {label: 'Educator Overview', href: '//code.org/teach'},
      {label: 'Hour of Code', href: 'https://hourofcode.com'},
    ],
  },
  {label: 'Districts', href: '//code.org/administrators'},
  {label: 'Stats', href: '//code.org/promote'},
  {label: 'Donate', href: '//code.org/donate'},
  {
    label: 'About',
    subItems: [
      {label: 'About Us', href: '//code.org/about'},
      {label: 'Careers', href: '//code.org/about/jobs'},
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

export const StudentSignedIn = Template.bind({});
StudentSignedIn.args = {
  ...BASE,
  menuItems: STUDENT_MENU_ITEMS,
  userAuth: {status: 'signed-in', display_name: 'Alex', user_type: 'student'},
};
// Opens the account menu and asserts its items render with prod-matched type
// metrics (fontWeight 500, lineHeight 20px) that only resolve under real layout.
StudentSignedIn.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', {name: 'Account menu'}));
  // MUI Menu portals to document.body, outside canvasElement.
  const item = await within(document.body).findByRole('menuitem', {
    name: 'My projects',
  });
  const styles = getComputedStyle(item);
  expect(styles.fontWeight).toBe('500');
  expect(styles.lineHeight).toBe('20px');
};

export const TeacherSignedIn = Template.bind({});
TeacherSignedIn.args = {
  ...BASE,
  menuItems: TEACHER_MENU_ITEMS,
  userAuth: {
    status: 'signed-in',
    display_name: 'Ms. Rivera',
    user_type: 'teacher',
  },
};
TeacherSignedIn.parameters = DESKTOP_LAYOUT_PARAMS;
// Resting-state guards, each a flat assert, ending with no menu open:
//  - target size (WCAG 2.5.8 AA): every control is at least 24x24px.
//  - hover colors: hovered New project + Account stay brand-white (label, icon,
//    border) — CdoTheme has no palette, so a regression resolved hover to MUI's
//    default primary purple. The white outline comes from var() in sx, not styled.
//  - focus-visible (F-5): keyboard-tabbing to the Account button engages
//    :focus-visible (programmatic .focus() does not, in Chromium).
TeacherSignedIn.play = async ({canvasElement}) => {
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
};

export const SignedInLongName = Template.bind({});
SignedInLongName.args = {
  ...BASE,
  menuItems: STUDENT_MENU_ITEMS,
  userAuth: {
    status: 'signed-in',
    display_name: 'Bartholomew-Maximilian',
    user_type: 'student',
  },
};
// Account-button-width regression: the name span is capped at 120px (truncating
// the long name) and the button auto-sizes to prod's ~176px. It used to cap the
// whole button at 120px, over-truncating the email and shifting "New project".
SignedInLongName.play = async ({canvasElement}) => {
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
};

export const SignedOut = Template.bind({});
SignedOut.args = {
  ...BASE,
  menuItems: STUDENT_MENU_ITEMS,
  userAuth: {status: 'signed-out'},
};

export const Loading = Template.bind({});
Loading.args = {
  ...BASE,
  menuItems: STUDENT_MENU_ITEMS,
  userAuth: {status: 'loading'},
};

export const Error = Template.bind({});
Error.args = {
  ...BASE,
  menuItems: STUDENT_MENU_ITEMS,
  userAuth: {status: 'error'},
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

// Create-menu open state for Eyes. Opens the "New project" picker (rendered at the
// desktop viewport); the picker portals to body. Asserts the Sprite Lab item's
// prod-matched fontWeight 600, which only resolves under real layout.
export const CreateMenu = Template.bind({});
CreateMenu.args = {...TEACHER_ARGS};
CreateMenu.parameters = DESKTOP_LAYOUT_PARAMS;
CreateMenu.play = async ({canvasElement}) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', {name: 'New project menu'}),
  );
  const item = await within(document.body).findByRole('menuitem', {
    name: 'Sprite Lab',
  });
  expect(getComputedStyle(item).fontWeight).toBe('600');
};

// Hamburger open + expanded state. Opens the panel and asserts the compact 242px
// width matching prod #hamburger-contents (not a full-width Drawer), then expands
// the first <details> summary. Caret-inset regression: the summary needs
// box-sizing:border-box so its 8px padding sits inside the panel; without it the
// chevron rendered flush to the panel edge (~0–1px inset).
export const Hamburger = Template.bind({});
Hamburger.args = {...TEACHER_ARGS};
Hamburger.play = async ({canvasElement}) => {
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
    panel.getBoundingClientRect().right - chevron.getBoundingClientRect().right;
  expect(inset).toBeGreaterThanOrEqual(10);
};
