import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import {Fragment, useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './hamburgerMenu.module.scss';

interface MenuItem {
  label: string;
  href: string;
}

interface SubEntry {
  label: string;
  href: string;
}

interface GlobalNavEntry {
  label: string;
  href?: string;
  subEntries?: SubEntry[];
}

const GLOBAL_NAV: GlobalNavEntry[] = [
  {label: 'Learn', href: '//code.org/students'},
  {
    label: 'Teach',
    subEntries: [
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
    subEntries: [
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
    subEntries: [
      {label: 'Privacy Policy', href: '//code.org/privacy'},
      {label: 'Cookie Notice', href: '//code.org/cookies'},
      {label: 'Terms of Service', href: '//code.org/terms-of-service'},
    ],
  },
];

function getSupportLinks(userType?: 'student' | 'teacher' | 'admin') {
  return [
    {label: 'Help and support', href: 'https://support.code.org'},
    {
      label: 'Report a problem',
      href: 'https://support.code.org/hc/en-us/requests/new',
    },
    ...(userType === 'teacher'
      ? [{label: 'Teacher forum', href: 'https://forum.code.org'}]
      : []),
  ];
}

interface HamburgerMenuProps {
  menuItems: MenuItem[];
  userType?: 'student' | 'teacher' | 'admin';
}

/** Shared `name` makes the sections a native exclusive accordion (one open at a time). */
const ACCORDION_NAME = 'hamburger-section';

/** Expandable section: a native `<details>` disclosure with an indented sub-link list. */
const ExpandableSection: FunctionComponent<{entry: GlobalNavEntry}> = ({
  entry,
}) => (
  <li>
    <details name={ACCORDION_NAME} className={moduleStyles.section}>
      <summary className={moduleStyles.expandTrigger}>
        <span className={moduleStyles.expandText}>{entry.label}</span>
        <FontAwesomeV6Icon
          iconName="chevron-down"
          iconStyle="solid"
          className={moduleStyles.chevron}
        />
      </summary>
      <ul className={moduleStyles.subList}>
        {entry.subEntries?.map(sub => (
          <li key={sub.label}>
            <a href={sub.href} className={moduleStyles.link}>
              {sub.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  </li>
);

/**
 * Panel body. The app-nav, support links, Incubator, and their dividers are
 * gated to widths below the top-nav breakpoint (the dev analog of prod's
 * .show-mobile), where the top bar's nav collapses; the global nav is always
 * shown. Mounted by the Popover only while open, so the global nav never
 * duplicates the top-bar nav items.
 */
const HamburgerPanel: FunctionComponent<HamburgerMenuProps> = ({
  menuItems,
  userType,
}) => {
  const supportLinks = getSupportLinks(userType);

  // Prod lists Incubator once, in the global-nav region after Donate (not in
  // the app-nav block). Pull it out of `menuItems` and re-inject it there.
  const incubator = menuItems.find(item => item.label === 'Incubator');
  const appNavItems = menuItems.filter(item => item.label !== 'Incubator');

  return (
    <ul className={moduleStyles.list}>
      {/* App nav — gated below the top-nav breakpoint (prod .show-mobile) */}
      {appNavItems.map(item => (
        <li key={item.label} className={moduleStyles.mobileOnly}>
          <a href={item.href} className={moduleStyles.link}>
            {item.label}
          </a>
        </li>
      ))}

      <li
        className={`${moduleStyles.divider} ${moduleStyles.mobileOnly}`}
        role="separator"
      />

      {/* Support links — gated below the top-nav breakpoint */}
      {supportLinks.map(link => (
        <li key={link.label} className={moduleStyles.mobileOnly}>
          <a
            href={link.href}
            className={moduleStyles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </a>
        </li>
      ))}

      <li
        className={`${moduleStyles.divider} ${moduleStyles.mobileOnly}`}
        role="separator"
      />

      {/* Global site nav — always visible. Incubator is re-injected after
          Donate (app-nav-gated), matching prod's single listing. */}
      {GLOBAL_NAV.map(entry => {
        const row = entry.subEntries ? (
          <ExpandableSection entry={entry} />
        ) : (
          <li>
            <a href={entry.href} className={moduleStyles.link}>
              {entry.label}
            </a>
          </li>
        );
        if (entry.label === 'Donate' && incubator) {
          return (
            <Fragment key={entry.label}>
              {row}
              <li className={moduleStyles.mobileOnly}>
                <a href={incubator.href} className={moduleStyles.link}>
                  {incubator.label}
                </a>
              </li>
            </Fragment>
          );
        }
        return <Fragment key={entry.label}>{row}</Fragment>;
      })}
    </ul>
  );
};

/**
 * Hamburger (☰) menu — a Popover disclosure panel matching the legacy
 * #hamburger-contents. Always visible; the panel's app-nav/support sections are
 * width-gated. Sections are native `<details>` disclosures sharing a `name`, so
 * the browser keeps one open at a time with no JS and native expand semantics.
 */
const HamburgerMenu: FunctionComponent<HamburgerMenuProps> = ({
  menuItems,
  userType,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();

  return (
    <>
      <IconButton
        className={moduleStyles.trigger}
        aria-label="Open navigation menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <span className={moduleStyles.barsIcon} />
      </IconButton>
      <Popover
        id={menuId}
        className={moduleStyles.popover}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        marginThreshold={0}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{paper: {elevation: 0}}}
      >
        <HamburgerPanel menuItems={menuItems} userType={userType} />
      </Popover>
    </>
  );
};

export default HamburgerMenu;
