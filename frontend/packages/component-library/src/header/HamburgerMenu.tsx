import Collapse from '@mui/material/Collapse';
import {Fragment, useState, type FunctionComponent} from 'react';

import {useDropdownContext} from '@/common/contexts/DropdownContext';
import CustomDropdown from '@/dropdown/CustomDropdown';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './hamburgerMenu.module.scss';

const DROPDOWN_NAME = 'hamburger';

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

/** Expandable section: a chevron trigger plus an indented sub-link list. */
const ExpandableSection: FunctionComponent<{
  entry: GlobalNavEntry;
  expanded: boolean;
  onToggle: () => void;
}> = ({entry, expanded, onToggle}) => (
  <li className={moduleStyles.expandableWrapper}>
    <button
      className={moduleStyles.expandTrigger}
      onClick={onToggle}
      type="button"
    >
      <span className={moduleStyles.expandText}>{entry.label}</span>
      <FontAwesomeV6Icon
        iconName={expanded ? 'chevron-up' : 'chevron-down'}
        iconStyle="solid"
        className={moduleStyles.chevron}
      />
    </button>
    <Collapse in={expanded} unmountOnExit>
      <ul className={moduleStyles.subList}>
        {entry.subEntries?.map(sub => (
          <li key={sub.label}>
            <a href={sub.href} className={moduleStyles.link}>
              {sub.label}
            </a>
          </li>
        ))}
      </ul>
    </Collapse>
  </li>
);

/**
 * Panel body. Mounted only while the dropdown is open — CustomDropdown keeps
 * children mounted, but the global nav (Learn, …) would otherwise duplicate the
 * top-bar nav items in the DOM. Hosting the accordion state here also collapses
 * sections when the panel closes.
 */
const HamburgerPanel: FunctionComponent<HamburgerMenuProps> = ({
  menuItems,
  userType,
}) => {
  const {activeDropdownName} = useDropdownContext();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (activeDropdownName !== DROPDOWN_NAME) {
    return null;
  }

  const toggleSection = (label: string) =>
    setExpandedSection(prev => (prev === label ? null : label));

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

      <li className={moduleStyles.mobileOnly} aria-hidden>
        <hr className={moduleStyles.divider} />
      </li>

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

      <li className={moduleStyles.mobileOnly} aria-hidden>
        <hr className={moduleStyles.divider} />
      </li>

      {/* Global site nav — always visible. Incubator is re-injected after
          Donate (app-nav-gated), matching prod's single listing. */}
      {GLOBAL_NAV.map(entry => {
        const row = entry.subEntries ? (
          <ExpandableSection
            entry={entry}
            expanded={expandedSection === entry.label}
            onToggle={() => toggleSection(entry.label)}
          />
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
 * Hamburger (☰) dropdown — a CustomDropdown submenu panel matching the legacy
 * #hamburger-contents. The app-nav, support links, Incubator, and their
 * dividers are gated to widths below the top-nav breakpoint (the dev analog of
 * prod's .show-mobile), where the top bar's nav collapses; the global nav is
 * always shown. Accordion toggles stay inside the panel, so CustomDropdown's
 * click-outside handler leaves the panel open.
 */
const HamburgerMenu: FunctionComponent<HamburgerMenuProps> = ({
  menuItems,
  userType,
}) => (
  <CustomDropdown
    name={DROPDOWN_NAME}
    labelText="Open navigation menu"
    size="m"
    menuPlacement="right"
    aria-label="Open navigation menu"
    useMuiIconButtonAsTrigger
    triggerButtonProps={{
      'aria-label': 'Open navigation menu',
      sx: {
        '&&': {
          color: 'var(--neutral-base-white)',
          paddingLeft: '14px',
          paddingRight: '6px',
          paddingTop: '18px',
          paddingBottom: '20px',
          minWidth: 0,
          minHeight: 0,
        },
        '&&:hover, &&:active, &&:focus-visible': {
          backgroundColor: 'transparent',
        },
      },
      children: <span className={moduleStyles.barsIcon} />,
    }}
  >
    <HamburgerPanel menuItems={menuItems} userType={userType} />
  </CustomDropdown>
);

export default HamburgerMenu;
