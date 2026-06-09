import logoImage from '@public/images/logo-codeai-inverse.svg';
import {Meta, StoryFn} from '@storybook/react-vite';
import {within, expect, userEvent, waitFor} from 'storybook/test';
import {page} from 'vitest/browser';

import Header, {HeaderProps} from '../Header';

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
    iconUrl: '/shared/images/fill-70x70/courses/sprite-lab-icon.png',
  },
  {
    id: 'applab',
    label: 'App Lab',
    href: '/projects/applab/new',
    iconUrl: '/shared/images/fill-70x70/courses/app-lab-icon.png',
  },
  {
    id: 'gamelab',
    label: 'Game Lab',
    href: '/projects/gamelab/new',
    iconUrl: '/shared/images/fill-70x70/courses/game-lab-icon.png',
  },
  {
    id: 'view_all',
    label: 'View all projects...',
    href: '/projects',
    iconUrl: '/shared/images/courses/header-all-projects-icon.png',
  },
];

const BASE = {
  logoImageUrl: logoImage,
  brandName: 'CodeAI',
  createMenuItems: CREATE_MENU_ITEMS,
};

export const StudentSignedIn = Template.bind({});
StudentSignedIn.args = {
  ...BASE,
  menuItems: STUDENT_MENU_ITEMS,
  userAuth: {status: 'signed-in', display_name: 'Alex', user_type: 'student'},
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

// Layout-regression stories: open a menu and assert prod-matched metrics that
// only resolve under real layout (jsdom can't). Hover/active *colors* still
// need real pointer input and are covered by visual comparison, not here.

export const AccountMenuLayout = Template.bind({});
AccountMenuLayout.args = {...TEACHER_ARGS};
AccountMenuLayout.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', {name: 'Account menu'}));
  // MUI Menu portals to document.body, outside canvasElement.
  const item = await within(document.body).findByRole('menuitem', {
    name: 'My projects',
  });
  const styles = getComputedStyle(item);
  expect(styles.fontWeight).toBe('500');
  expect(styles.lineHeight).toBe('20px');
  // Full-row fill (prod ~228px content) is verified in the real app via pixel
  // diffs; the headless Storybook test browser renders the portaled MUI menu
  // narrower, so width isn't asserted here.
};

export const HelpMenuLayout = Template.bind({});
HelpMenuLayout.args = {...TEACHER_ARGS};
HelpMenuLayout.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', {name: 'Help menu'}));
  // MUI Menu portals to document.body, outside canvasElement.
  const item = await within(document.body).findByRole('menuitem', {
    name: 'Help and support',
  });
  const styles = getComputedStyle(item);
  expect(styles.fontWeight).toBe('500');
  expect(styles.lineHeight).toBe('20px');
  // Full-row width verified in the real app via pixel diffs (see AccountMenuLayout).
};

export const HamburgerLayout = Template.bind({});
HamburgerLayout.args = {...TEACHER_ARGS};
HamburgerLayout.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole('button', {name: 'Open navigation menu'}),
  );
  // Popover panel portals to document.body, outside canvasElement.
  await waitFor(() => {
    const panel = document.querySelector('.MuiPopover-paper') as HTMLElement;
    expect(panel).not.toBeNull();
    // Compact 242px panel matching prod #hamburger-contents (not a full-width
    // Drawer).
    expect(Math.round(panel.getBoundingClientRect().width)).toBe(242);
  });
};

// Purple-hover regression: CdoTheme defines no palette, so before color="inherit"
// the DS button override resolved hover/focus to MUI's default primary purple
// (rgb(150,87,199)). Both triggers must stay brand-white in every pointer state,
// label and icon alike. Widen past the 1200px create-menu breakpoint so the
// "New project" button renders (it's display:none at/below 1200px).
export const HoverColorsLayout = Template.bind({});
HoverColorsLayout.args = {...TEACHER_ARGS};
HoverColorsLayout.play = async ({canvasElement}) => {
  await page.viewport(1300, 800);
  const canvas = within(canvasElement);
  const white = 'rgb(255, 255, 255)';

  const newProject = canvas.getByRole('button', {name: 'New project menu'});
  await userEvent.hover(newProject);
  expect(getComputedStyle(newProject).color).toBe(white);
  expect(getComputedStyle(newProject.querySelector('i')!).color).toBe(white);

  const account = canvas.getByRole('button', {name: 'Account menu'});
  await userEvent.hover(account);
  expect(getComputedStyle(account).color).toBe(white);
  expect(getComputedStyle(account.querySelector('i')!).color).toBe(white);
};

// F-5 focus-visible: keyboard-reaching a trigger must engage :focus-visible so a
// focus ring renders (the brand-white outline color is verified visually by Eyes
// — the headless runner zeroes the computed outline width, so width/color are not
// asserted here). Tab forward from the logo link until the Account button holds
// focus; programmatic .focus() does not set :focus-visible in Chromium.
export const FocusVisibleLayout = Template.bind({});
FocusVisibleLayout.args = {...TEACHER_ARGS};
FocusVisibleLayout.play = async ({canvasElement}) => {
  const account = within(canvasElement).getByRole('button', {
    name: 'Account menu',
  });
  account.blur();
  canvasElement.querySelector('a')?.focus();
  for (let i = 0; i < 12 && document.activeElement !== account; i++) {
    await userEvent.tab();
  }
  expect(document.activeElement).toBe(account);
  expect(account.matches(':focus-visible')).toBe(true);
};

// Caret-inset regression: the accordion summary needed box-sizing:border-box so
// its 8px padding sits inside the 242px panel; without it the chevron rendered
// flush to the panel edge (~0–1px inset). Open the hamburger, then assert the
// first expandable summary's chevron is inset from the panel's right edge.
export const HamburgerExpandedLayout = Template.bind({});
HamburgerExpandedLayout.args = {...TEACHER_ARGS};
HamburgerExpandedLayout.play = async ({canvasElement}) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', {name: 'Open navigation menu'}),
  );
  const panel = await waitFor(() => {
    const p = document.querySelector('.MuiPopover-paper') as HTMLElement;
    expect(p).not.toBeNull();
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

// Create-menu open state for Eyes. Widen past the 1200px breakpoint so the "New
// project" trigger renders, then open its picker. Mirrors the other *Layout
// stories' open-and-assert shape; the picker portals to document.body.
export const CreateMenuLayout = Template.bind({});
CreateMenuLayout.args = {...TEACHER_ARGS};
CreateMenuLayout.play = async ({canvasElement}) => {
  await page.viewport(1300, 800);
  await userEvent.click(
    within(canvasElement).getByRole('button', {name: 'New project menu'}),
  );
  const item = await within(document.body).findByRole('menuitem', {
    name: 'Sprite Lab',
  });
  const styles = getComputedStyle(item);
  expect(styles.fontWeight).toBe('600');
};
