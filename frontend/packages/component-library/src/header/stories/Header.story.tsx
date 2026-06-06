import logoImage from '@public/images/cdo-logo-inverse.svg';
import {Meta, StoryFn} from '@storybook/react-vite';

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
