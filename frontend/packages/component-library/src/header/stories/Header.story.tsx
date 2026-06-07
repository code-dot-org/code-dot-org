import logoImage from '@public/images/logo-codeai-inverse.svg';
import {Meta, StoryFn} from '@storybook/react-vite';
import {within, expect, userEvent, waitFor} from 'storybook/test';

import Header, {HeaderProps} from '../Header';

export default {
  title: 'DesignSystem/Header',
  component: Header,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Header has a known color-contrast issue accepted by the design team.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
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
  const menu = canvasElement.querySelector(
    '#signed-in-user-dropdown',
  ) as HTMLElement;
  const item = menu.querySelector('a[href="/projects"]') as HTMLElement; // "My projects"
  await waitFor(() =>
    expect(item.getBoundingClientRect().width).toBeGreaterThan(0),
  );
  const styles = getComputedStyle(item);
  expect(styles.fontWeight).toBe('500');
  expect(styles.lineHeight).toBe('20px');
  // Full-row fill (prod ~228px content), not just the text width.
  expect(item.getBoundingClientRect().width).toBeGreaterThanOrEqual(220);
};

export const HelpMenuLayout = Template.bind({});
HelpMenuLayout.args = {...TEACHER_ARGS};
HelpMenuLayout.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', {name: 'Help menu'}));
  const menu = canvasElement.querySelector(
    '#help-menu-dropdown',
  ) as HTMLElement;
  const item = menu.querySelector(
    'a[href="https://support.code.org"]',
  ) as HTMLElement; // "Help and support"
  await waitFor(() =>
    expect(item.getBoundingClientRect().width).toBeGreaterThan(0),
  );
  const styles = getComputedStyle(item);
  expect(styles.fontWeight).toBe('500');
  expect(styles.lineHeight).toBe('20px');
  expect(item.getBoundingClientRect().width).toBeGreaterThanOrEqual(220);
};

export const HamburgerLayout = Template.bind({});
HamburgerLayout.args = {...TEACHER_ARGS};
HamburgerLayout.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole('button', {name: 'Open navigation menu'}),
  );
  const panel = canvasElement.querySelector(
    '#hamburger-dropdown [class*="dropdownMenuContainer"]',
  ) as HTMLElement;
  await waitFor(() =>
    expect(panel.getBoundingClientRect().width).toBeGreaterThan(0),
  );
  // Compact 242px dropdown panel matching prod #hamburger-contents (not the
  // old full-width MUI Drawer).
  expect(Math.round(panel.getBoundingClientRect().width)).toBe(242);
};
