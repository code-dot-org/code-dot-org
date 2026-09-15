import allProjectsIcon from '@public/images/header-all-projects-icon.png';
import appLabIcon from '@public/images/header-app-lab-icon.png';
import gameLabIcon from '@public/images/header-game-lab-icon.png';
import spriteLabIcon from '@public/images/header-sprite-lab-icon.png';
import logoImage from '@public/images/logo-codeai-inverse.svg';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect, userEvent, waitFor} from 'storybook/test';

import Header from '../index';

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
      {label: 'Hour of AI', href: '//code.org/hour-of-ai'},
      {
        label: 'Beyond CodeAI',
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
  {label: 'Incubator', href: '//code.org/incubator'},
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
    hamburgerOnly: true,
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

// Responsive auth states: Eyes captures the story at desktop + phone via the
// eyes.browser array (so the mobile render needs no separate story). The viewport
// addon keeps the interactive/play render at desktop, where the >1200px New
// project trigger is present.
const RESPONSIVE_EYES = {
  viewport: {
    viewports: {
      desktop: {name: 'Desktop', styles: {width: '1280px', height: '800px'}},
    },
    defaultViewport: 'desktop',
  },
  eyes: {
    browser: [
      {width: 1280, height: 800, name: 'chrome'},
      {width: 375, height: 800, name: 'chrome'},
    ],
  },
};

export const StudentSignedIn: Story = {
  args: {
    ...BASE,
    menuItems: STUDENT_MENU_ITEMS,
    userAuth: {status: 'signed-in', display_name: 'Alex', user_type: 'student'},
  },
  parameters: DESKTOP_LAYOUT_PARAMS,
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
//  - pill geometry: New project + Account triggers are 32px/0.5rem radius,
//    matching the Rails header's `.header_button` under codeai-brand
//    (dashboard/app/assets/stylesheets/application.scss); Help's "?" glyph
//    grows to 24px while its own box keeps the Rails header's 38px invisible
//    hit target (it never carries `.header_button`).
//  - hover colors: hovered New project + Account stay brand-white (label, icon,
//    border) — CdoTheme has no palette, so a regression resolved hover to MUI's
//    default primary purple. The white outline comes from var() in sx, not styled.
//  - focus-visible (F-5): keyboard-tabbing to the Account button engages
//    :focus-visible (programmatic .focus() does not, in Chromium).
export const TeacherSignedIn: Story = {
  args: TEACHER_ARGS,
  parameters: RESPONSIVE_EYES,
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
    const account = canvas.getByRole('button', {name: 'Account menu'});
    const help = canvas.getByRole('button', {name: 'Help menu'});

    for (const trigger of [newProject, account]) {
      const styles = getComputedStyle(trigger);
      expect(styles.height).toBe('32px');
      expect(styles.borderRadius).toBe('8px'); // 0.5rem
    }
    expect(getComputedStyle(help.querySelector('i')!).fontSize).toBe('24px');

    await userEvent.hover(newProject);
    expect(getComputedStyle(newProject).color).toBe(white);
    expect(getComputedStyle(newProject.querySelector('i')!).color).toBe(white);
    expect(getComputedStyle(newProject).borderColor).toBe(white);

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

// Signed-out matches the legacy header: marketing nav + New project on the bar,
// Sign in / Create account pills, legal in the hamburger only.
// focus-visible (F-5): keyboard-tabbing to the Sign in pill engages the
// inverse-white focus ring. The pills render as <a>, so the theme's teal
// a&:focus-visible rule wins unless the sx specificity is bumped (&&).
export const SignedOut: Story = {
  args: {
    ...BASE,
    menuItems: [],
    userAuth: {status: 'signed-out'},
  },
  parameters: RESPONSIVE_EYES,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const probe = document.createElement('div');
    probe.style.color = 'var(--text-neutral-white-fixed)';
    canvasElement.appendChild(probe);
    const inverse = getComputedStyle(probe).color;
    probe.remove();

    const signIn = canvas.getByRole('link', {name: 'Sign in'});
    canvasElement.querySelector('a')?.focus();
    for (let i = 0; i < 18 && document.activeElement !== signIn; i++) {
      await userEvent.tab();
    }
    expect(document.activeElement).toBe(signIn);
    expect(signIn.matches(':focus-visible')).toBe(true);
    expect(getComputedStyle(signIn).outlineColor).toBe(inverse);
    signIn.blur();
  },
};

// The signed-out marketing nav: an 8-link bar with About/Donate pinned to
// the trailing edge (alignEnd).
const MARKETING_NAV_ITEMS = [
  {label: 'Teachers', href: '//code.org/teachers'},
  {label: 'Districts', href: '//code.org/districts'},
  {label: 'Advocacy', href: 'https://advocacy.code.org'},
  {label: 'Hour of AI', href: '//code.org/hour-of-ai'},
  {label: 'Parents', href: '//code.org/parents'},
  {label: 'Students', href: '//code.org/students'},
  {label: 'About', href: '//code.org/about', alignEnd: true},
  {label: 'Donate', href: '//code.org/donate', alignEnd: true},
];

// Signed-out marketing nav: 8-link bar, About/Donate pinned to the trailing
// edge, pill-styled links. Verifies the pill's computed values (padding,
// radius, font-weight, focus outline) resolve under real layout, plus the
// auto-margin placement of the alignEnd pair. `globals.brand` below only
// selects the MUI theme (CodeaiTheme) — the pill styling itself comes from
// Header's base CSS. Hover/press backgrounds are verified by live browser
// interaction instead of a play-function assertion: :hover doesn't reliably
// register on anchors through this story's component-test harness
// (userEvent.hover/pointer left `.matches(':hover')` false here, unlike the
// Button-based hovers other stories assert on).
export const SignedOutMarketingNav: Story = {
  args: {
    ...BASE,
    menuItems: [],
    globalNavItems: MARKETING_NAV_ITEMS,
    userAuth: {status: 'signed-out'},
    marketingNav: true,
  },
  parameters: DESKTOP_LAYOUT_PARAMS,
  globals: {brand: 'codeai-next'},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const teachers = canvas.getByRole('link', {name: 'Teachers'});
    const styles = getComputedStyle(teachers);
    expect(styles.padding).toBe('5px 10px');
    expect(styles.borderRadius).toBe('8px'); // 0.5rem
    expect(styles.fontWeight).toBe('600');
    expect(styles.whiteSpace).toBe('nowrap');

    // About (the first alignEnd item) sits flush against the right cluster;
    // Donate follows it directly — both pushed by the same auto margin.
    const about = canvas.getByRole('link', {name: 'About'});
    const donate = canvas.getByRole('link', {name: 'Donate'});
    const hamburger = canvasElement.querySelector(
      '[aria-label="Open navigation menu"]',
    )!;
    expect(about.getBoundingClientRect().left).toBeGreaterThan(
      teachers.getBoundingClientRect().right,
    );
    expect(donate.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      about.getBoundingClientRect().right,
    );
    expect(hamburger.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      donate.getBoundingClientRect().right,
    );

    const signIn = canvas.getByRole('link', {name: 'Sign in'});
    expect(getComputedStyle(signIn).height).toBe('32px');
    expect(getComputedStyle(signIn).borderRadius).toBe('8px');
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
  parameters: DESKTOP_LAYOUT_PARAMS,
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

// Mobile renders are captured by the RESPONSIVE_EYES eyes.browser array on
// TeacherSignedIn / SignedOut above (no separate phone-width stories). The
// hamburger signed-out auth interaction is covered by HamburgerMenu's unit test.
